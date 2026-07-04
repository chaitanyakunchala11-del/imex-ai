from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI(title="IMEX AI API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ----------------------------- Models -----------------------------
class LandedCostRequest(BaseModel):
    product_name: str = "Imported Goods"
    category: str = "Other"
    product_value: float          # unit FOB value
    quantity: int
    weight_kg: float = 0.0        # total shipment weight
    origin: str = "Mumbai, India"
    destination: str = "Sydney, AU"
    selling_price: float = 0.0    # optional, per-unit, for margin
    gst_rate: float = 10.0
    currency: str = "AUD"


class ImportVsLocalRequest(BaseModel):
    import_unit_cost: float
    local_unit_cost: float
    quantity: int
    import_lead_days: int = 35
    local_lead_days: int = 7


class ProfitModeRequest(BaseModel):
    unit_cost: float
    selling_price: float
    quantity: int
    marketplace_fee_rate: float = 0.0   # %
    overhead_rate: float = 0.0          # %
    shipping_per_unit: float = 0.0


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ProjectCreate(BaseModel):
    client_id: str
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CalculationCreate(BaseModel):
    client_id: str
    type: str                       # landed_cost | import_vs_local | profit_mode
    title: str
    inputs: dict = {}
    results: dict = {}
    rows: List[dict] = []           # [{label, value}] for exports
    headline_label: str = ""
    headline_value: str = ""
    project_id: Optional[str] = None


# ----------------------------- Seed data -----------------------------
SEED_OPPORTUNITIES = [
    {"product": "Organic Turmeric Powder", "category": "Spices & Wellness", "origin": "Erode, India", "destination": "Sydney, AU", "hs_code": "091030", "margin_pct": 64.0, "demand_score": 92, "monthly_volume": 18500, "trend": "up", "landed_index": 1.18, "summary": "High-margin wellness staple with surging demand in AU health retail."},
    {"product": "Handloom Cotton Textiles", "category": "Textiles", "origin": "Tiruppur, India", "destination": "Melbourne, AU", "hs_code": "520851", "margin_pct": 48.0, "demand_score": 81, "monthly_volume": 9400, "trend": "up", "landed_index": 1.32, "summary": "Premium sustainable fashion buyers paying a clear ethical premium."},
    {"product": "Basmati Rice (Premium)", "category": "Food & Grains", "origin": "Punjab, India", "destination": "Brisbane, AU", "hs_code": "100630", "margin_pct": 34.0, "demand_score": 88, "monthly_volume": 42000, "trend": "flat", "landed_index": 1.09, "summary": "Stable, high-volume staple with consistent retail pull-through."},
    {"product": "Ayurvedic Skincare Range", "category": "Beauty & Personal", "origin": "Bengaluru, India", "destination": "Sydney, AU", "hs_code": "330499", "margin_pct": 71.0, "demand_score": 95, "monthly_volume": 6200, "trend": "up", "landed_index": 1.41, "summary": "Top-tier margin category; clean-beauty narrative converts strongly."},
    {"product": "Brass Home Decor", "category": "Home & Lifestyle", "origin": "Moradabad, India", "destination": "Perth, AU", "hs_code": "830621", "margin_pct": 58.0, "demand_score": 73, "monthly_volume": 3100, "trend": "up", "landed_index": 1.55, "summary": "Artisanal decor with strong boutique and e-commerce appeal."},
    {"product": "Leather Accessories", "category": "Fashion", "origin": "Kanpur, India", "destination": "Melbourne, AU", "hs_code": "420221", "margin_pct": 52.0, "demand_score": 69, "monthly_volume": 4800, "trend": "flat", "landed_index": 1.38, "summary": "Mid-range leather goods with reliable repeat-purchase patterns."},
    {"product": "Cold-Pressed Coconut Oil", "category": "Food & Wellness", "origin": "Kerala, India", "destination": "Adelaide, AU", "hs_code": "151311", "margin_pct": 46.0, "demand_score": 84, "monthly_volume": 12700, "trend": "up", "landed_index": 1.22, "summary": "Wellness-driven demand with strong margins at premium positioning."},
    {"product": "Handcrafted Jewelry", "category": "Luxury", "origin": "Jaipur, India", "destination": "Sydney, AU", "hs_code": "711719", "margin_pct": 78.0, "demand_score": 90, "monthly_volume": 2400, "trend": "up", "landed_index": 1.62, "summary": "Highest-margin luxury tier; gifting and bridal seasons spike demand."},
    {"product": "Stainless Steel Cookware", "category": "Kitchen", "origin": "Mumbai, India", "destination": "Brisbane, AU", "hs_code": "732393", "margin_pct": 41.0, "demand_score": 76, "monthly_volume": 5600, "trend": "flat", "landed_index": 1.28, "summary": "Durable goods with steady demand and predictable freight economics."},
    {"product": "Premium Black Tea", "category": "Beverages", "origin": "Assam, India", "destination": "Melbourne, AU", "hs_code": "090230", "margin_pct": 55.0, "demand_score": 87, "monthly_volume": 15300, "trend": "up", "landed_index": 1.15, "summary": "Specialty tea segment growing fast in AU cafe and retail channels."},
]


async def seed_opportunities():
    count = await db.opportunities.count_documents({})
    if count == 0:
        docs = []
        for o in SEED_OPPORTUNITIES:
            docs.append({"id": str(uuid.uuid4()), **o,
                         "created_at": datetime.now(timezone.utc).isoformat()})
        await db.opportunities.insert_many(docs)
        logger.info("Seeded %d opportunities", len(docs))


@app.on_event("startup")
async def on_startup():
    await seed_opportunities()


# ----------------------------- Routes -----------------------------
@api_router.get("/")
async def root():
    return {"message": "IMEX AI API", "status": "ok"}


@api_router.get("/dashboard/stats")
async def dashboard_stats():
    opps = await db.opportunities.find({}, {"_id": 0}).to_list(1000)
    total = len(opps) or 1
    avg_margin = round(sum(o["margin_pct"] for o in opps) / total, 1)
    total_volume = sum(o["monthly_volume"] for o in opps)
    hot = len([o for o in opps if o["demand_score"] >= 85])
    top = sorted(opps, key=lambda o: o["margin_pct"], reverse=True)[:4]
    return {
        "stats": [
            {"label": "Active Opportunities", "value": str(total), "delta": "+12%", "trend": "up", "hint": "Live AU–India trade lanes"},
            {"label": "Avg. Net Margin", "value": f"{avg_margin}%", "delta": "+3.4%", "trend": "up", "hint": "Across scanned products"},
            {"label": "Monthly Volume", "value": f"{total_volume:,}", "delta": "+8.1%", "trend": "up", "hint": "Estimated units / month"},
            {"label": "Hot Demand Signals", "value": str(hot), "delta": "+5", "trend": "up", "hint": "Demand score ≥ 85"},
        ],
        "top_opportunities": top,
    }


@api_router.get("/opportunities")
async def list_opportunities():
    opps = await db.opportunities.find({}, {"_id": 0}).to_list(1000)
    opps.sort(key=lambda o: o["demand_score"], reverse=True)
    return {"opportunities": opps}


CATEGORY_DUTY = {
    "Textiles & Apparel": 10.0,
    "Food & Grains": 0.0,
    "Spices & Wellness": 4.0,
    "Beauty & Personal": 5.0,
    "Home & Lifestyle": 5.0,
    "Electronics": 0.0,
    "Jewelry & Luxury": 5.0,
    "Leather Goods": 8.0,
    "Furniture": 8.0,
    "Other": 5.0,
}

# Indicative India -> AU sea-consol freight rate (AUD per kg) by destination port
DEST_FREIGHT_RATE = {
    "Sydney, AU": 4.0,
    "Melbourne, AU": 4.0,
    "Brisbane, AU": 4.3,
    "Perth, AU": 4.8,
    "Adelaide, AU": 4.5,
}


@api_router.post("/calculator/landed-cost")
async def landed_cost(req: LandedCostRequest):
    duty_rate = CATEGORY_DUTY.get(req.category, 5.0)
    freight_rate = DEST_FREIGHT_RATE.get(req.destination, 4.2)

    goods_value = req.product_value * req.quantity
    freight = max(req.weight_kg * freight_rate, 150.0 if req.weight_kg else 0.0)
    insurance = round((goods_value + freight) * 0.005, 2)   # 0.5% of CFR
    cif = goods_value + freight + insurance
    duty = cif * duty_rate / 100
    gst = (cif + duty) * req.gst_rate / 100
    total = cif + duty + gst
    per_unit = total / req.quantity if req.quantity else 0

    margin_pct = None
    profit_per_unit = None
    total_profit = None
    if req.selling_price and req.selling_price > 0:
        profit_per_unit = req.selling_price - per_unit
        margin_pct = round(profit_per_unit / req.selling_price * 100, 1)
        total_profit = round(profit_per_unit * req.quantity, 2)

    return {
        "currency": req.currency,
        "product_name": req.product_name,
        "category": req.category,
        "origin": req.origin,
        "destination": req.destination,
        "duty_rate": duty_rate,
        "freight_rate": freight_rate,
        "goods_value": round(goods_value, 2),
        "freight_estimate": round(freight, 2),
        "insurance": round(insurance, 2),
        "cif_value": round(cif, 2),
        "duty": round(duty, 2),
        "gst": round(gst, 2),
        "total_landed_cost": round(total, 2),
        "per_unit_cost": round(per_unit, 2),
        "margin_pct": margin_pct,
        "profit_per_unit": round(profit_per_unit, 2) if profit_per_unit is not None else None,
        "total_profit": total_profit,
        "breakdown": [
            {"label": "Goods Value (FOB)", "value": round(goods_value, 2)},
            {"label": "Freight Estimate", "value": round(freight, 2)},
            {"label": "Insurance (0.5%)", "value": round(insurance, 2)},
            {"label": f"Customs Duty ({duty_rate}%)", "value": round(duty, 2)},
            {"label": f"GST ({req.gst_rate}%)", "value": round(gst, 2)},
        ],
    }


@api_router.post("/calculator/import-vs-local")
async def import_vs_local(req: ImportVsLocalRequest):
    import_total = req.import_unit_cost * req.quantity
    local_total = req.local_unit_cost * req.quantity
    savings = local_total - import_total
    savings_pct = (savings / local_total * 100) if local_total else 0
    recommend = "import" if savings > 0 else "local"
    return {
        "import_total": round(import_total, 2),
        "local_total": round(local_total, 2),
        "savings": round(savings, 2),
        "savings_pct": round(savings_pct, 1),
        "import_unit_cost": round(req.import_unit_cost, 2),
        "local_unit_cost": round(req.local_unit_cost, 2),
        "import_lead_days": req.import_lead_days,
        "local_lead_days": req.local_lead_days,
        "recommendation": recommend,
        "recommendation_text": (
            f"Importing saves AUD {abs(round(savings,2)):,} ({abs(round(savings_pct,1))}%) over the order."
            if savings > 0 else
            f"Local sourcing is cheaper by AUD {abs(round(savings,2)):,} and {req.import_lead_days - req.local_lead_days} days faster."
        ),
    }


@api_router.post("/calculator/profit-mode")
async def profit_mode(req: ProfitModeRequest):
    revenue = req.selling_price * req.quantity
    cogs = req.unit_cost * req.quantity
    fees = revenue * req.marketplace_fee_rate / 100
    overhead = revenue * req.overhead_rate / 100
    shipping = req.shipping_per_unit * req.quantity
    net_profit = revenue - cogs - fees - overhead - shipping
    margin = (net_profit / revenue * 100) if revenue else 0
    roi = (net_profit / cogs * 100) if cogs else 0
    per_unit_profit = net_profit / req.quantity if req.quantity else 0
    return {
        "revenue": round(revenue, 2),
        "cogs": round(cogs, 2),
        "marketplace_fees": round(fees, 2),
        "overhead": round(overhead, 2),
        "shipping": round(shipping, 2),
        "net_profit": round(net_profit, 2),
        "margin_pct": round(margin, 1),
        "roi_pct": round(roi, 1),
        "per_unit_profit": round(per_unit_profit, 2),
    }


# ----------------------------- Projects & Saved Calculations -----------------------------
@api_router.post("/projects")
async def create_project(req: ProjectCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "client_id": req.client_id,
        "name": req.name,
        "description": req.description,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/projects")
async def list_projects(client_id: str):
    projects = await db.projects.find({"client_id": client_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for p in projects:
        p["calculation_count"] = await db.calculations.count_documents({"project_id": p["id"]})
    return {"projects": projects}


@api_router.patch("/projects/{project_id}")
async def update_project(project_id: str, req: ProjectUpdate):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.projects.update_one({"id": project_id}, {"$set": updates})
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    await db.projects.delete_one({"id": project_id})
    # detach calculations from the deleted project (keep the calcs)
    await db.calculations.update_many({"project_id": project_id}, {"$set": {"project_id": None}})
    return {"deleted": project_id}


@api_router.post("/calculations")
async def create_calculation(req: CalculationCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "client_id": req.client_id,
        "type": req.type,
        "title": req.title,
        "inputs": req.inputs,
        "results": req.results,
        "rows": req.rows,
        "headline_label": req.headline_label,
        "headline_value": req.headline_value,
        "project_id": req.project_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.calculations.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/calculations")
async def list_calculations(client_id: str, project_id: Optional[str] = None, type: Optional[str] = None):
    query = {"client_id": client_id}
    if project_id:
        query["project_id"] = project_id
    if type:
        query["type"] = type
    calcs = await db.calculations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"calculations": calcs}


@api_router.get("/calculations/{calc_id}")
async def get_calculation(calc_id: str):
    doc = await db.calculations.find_one({"id": calc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Calculation not found")
    return doc


@api_router.delete("/calculations/{calc_id}")
async def delete_calculation(calc_id: str):
    await db.calculations.delete_one({"id": calc_id})
    return {"deleted": calc_id}


# ----------------------------- AI Assistant -----------------------------
SYSTEM_PROMPT = (
    "You are IMEX AI, an elite import/export trade intelligence assistant specialising in "
    "Australia–India and global trade. You give concise, confident, actionable advice on landed "
    "costs, customs duties, GST, HS codes, freight, sourcing, margins, and market opportunities. "
    "Use clear structure and short paragraphs. When numbers help, give quick estimates and flag "
    "assumptions. Keep a premium, advisory tone."
)


@api_router.post("/assistant/chat")
async def assistant_chat(req: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-6")

    # rehydrate history into the chat context
    history = await db.chat_messages.find(
        {"session_id": req.session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)

    async def event_generator():
        full = ""
        try:
            # provide prior context as a primer if exists
            primer = req.message
            if history:
                convo = "\n".join(f"{m['role']}: {m['content']}" for m in history[-10:])
                primer = f"Conversation so far:\n{convo}\n\nUser: {req.message}"
            async for ev in chat.stream_message(UserMessage(text=primer)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("LLM stream error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

        now = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_many([
            {"id": str(uuid.uuid4()), "session_id": req.session_id, "role": "user", "content": req.message, "created_at": now},
            {"id": str(uuid.uuid4()), "session_id": req.session_id, "role": "assistant", "content": full, "created_at": now},
        ])
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api_router.get("/assistant/history/{session_id}")
async def assistant_history(session_id: str):
    msgs = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    return {"messages": msgs}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
