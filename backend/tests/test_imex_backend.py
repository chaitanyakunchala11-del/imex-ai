"""Backend tests for IMEX AI platform."""
import os
import uuid
import json
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback: read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----------------------- Health -----------------------
def test_root(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "message" in data


# ----------------------- Dashboard -----------------------
def test_dashboard_stats(client):
    r = client.get(f"{BASE_URL}/api/dashboard/stats")
    assert r.status_code == 200
    data = r.json()
    assert "stats" in data and "top_opportunities" in data
    assert isinstance(data["stats"], list) and len(data["stats"]) == 4
    for s in data["stats"]:
        assert "label" in s and "value" in s and "trend" in s
    assert len(data["top_opportunities"]) >= 1
    # ensure no MongoDB _id leaks
    assert "_id" not in data["top_opportunities"][0]


# ----------------------- Opportunities -----------------------
def test_opportunities(client):
    r = client.get(f"{BASE_URL}/api/opportunities")
    assert r.status_code == 200
    data = r.json()
    assert "opportunities" in data
    opps = data["opportunities"]
    assert len(opps) >= 5
    # sorted desc by demand_score
    scores = [o["demand_score"] for o in opps]
    assert scores == sorted(scores, reverse=True)
    for o in opps:
        assert "_id" not in o
        for k in ["product", "category", "origin", "destination", "hs_code", "margin_pct", "demand_score"]:
            assert k in o


# ----------------------- Landed Cost (new schema: product/category/route/weight) -----------------------
def test_landed_cost_defaults(client):
    payload = {
        "product_name": "TEST_Turmeric",
        "category": "Spices & Wellness",
        "product_value": 12.0,
        "quantity": 1000,
        "weight_kg": 800.0,
        "origin": "Mumbai, India",
        "destination": "Sydney, AU",
        "selling_price": 28.0,
        "gst_rate": 10.0,
        "currency": "AUD",
    }
    r = client.post(f"{BASE_URL}/api/calculator/landed-cost", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    # goods = 12*1000=12000, freight=800*4=3200, insurance=0.005*(15200)=76.0
    # cif = 12000 + 3200 + 76 = 15276, duty=4%*15276=611.04
    # gst=10%*(15276+611.04)=1588.70 -> total = 15276+611.04+1588.704 = 17475.74
    assert d["goods_value"] == 12000.0
    assert d["freight_estimate"] == 3200.0
    assert d["insurance"] == 76.0
    assert d["cif_value"] == 15276.0
    assert d["duty"] == 611.04
    assert abs(d["gst"] - 1588.7) < 0.05
    assert abs(d["total_landed_cost"] - 17475.74) < 0.1
    assert d["per_unit_cost"] == round(d["total_landed_cost"] / 1000, 2)
    # breakdown has 5 items per server.py (Goods, Freight, Insurance, Duty, GST)
    assert isinstance(d["breakdown"], list) and len(d["breakdown"]) >= 5
    # selling_price provided -> margin fields populated
    assert d["margin_pct"] is not None
    assert d["total_profit"] is not None
    assert d["profit_per_unit"] is not None


def test_landed_cost_category_changes_duty(client):
    base = {
        "product_name": "TEST_Cat",
        "product_value": 12.0,
        "quantity": 1000,
        "weight_kg": 800.0,
        "origin": "Mumbai, India",
        "destination": "Sydney, AU",
        "selling_price": 28.0,
    }
    r1 = client.post(f"{BASE_URL}/api/calculator/landed-cost",
                     json={**base, "category": "Spices & Wellness"}).json()
    r2 = client.post(f"{BASE_URL}/api/calculator/landed-cost",
                     json={**base, "category": "Textiles & Apparel"}).json()
    assert r1["duty_rate"] == 4.0
    assert r2["duty_rate"] == 10.0
    assert r2["duty"] > r1["duty"]
    assert r2["total_landed_cost"] > r1["total_landed_cost"]


def test_landed_cost_destination_changes_freight(client):
    base = {
        "product_name": "TEST_Dest",
        "category": "Spices & Wellness",
        "product_value": 12.0,
        "quantity": 1000,
        "weight_kg": 800.0,
        "origin": "Mumbai, India",
        "selling_price": 28.0,
    }
    r_syd = client.post(f"{BASE_URL}/api/calculator/landed-cost",
                        json={**base, "destination": "Sydney, AU"}).json()
    r_per = client.post(f"{BASE_URL}/api/calculator/landed-cost",
                        json={**base, "destination": "Perth, AU"}).json()
    assert r_syd["freight_rate"] == 4.0
    assert r_per["freight_rate"] == 4.8
    assert r_per["freight_estimate"] > r_syd["freight_estimate"]
    assert r_per["total_landed_cost"] > r_syd["total_landed_cost"]


def test_landed_cost_validation(client):
    # missing required product_value/quantity -> 422
    r = client.post(f"{BASE_URL}/api/calculator/landed-cost", json={"product_value": "abc"})
    assert r.status_code in (400, 422)


# ----------------------- Import vs Local -----------------------
def test_import_vs_local_import_cheaper(client):
    payload = {"import_unit_cost": 5.0, "local_unit_cost": 8.0, "quantity": 100}
    r = client.post(f"{BASE_URL}/api/calculator/import-vs-local", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["import_total"] == 500.0
    assert d["local_total"] == 800.0
    assert d["savings"] == 300.0
    assert d["recommendation"] == "import"
    assert "recommendation_text" in d


def test_import_vs_local_local_cheaper(client):
    payload = {"import_unit_cost": 10.0, "local_unit_cost": 6.0, "quantity": 50}
    r = client.post(f"{BASE_URL}/api/calculator/import-vs-local", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["recommendation"] == "local"


# ----------------------- Profit Mode -----------------------
def test_profit_mode(client):
    payload = {
        "unit_cost": 10.0,
        "selling_price": 25.0,
        "quantity": 100,
        "marketplace_fee_rate": 10.0,
        "overhead_rate": 5.0,
        "shipping_per_unit": 1.0,
    }
    r = client.post(f"{BASE_URL}/api/calculator/profit-mode", json=payload)
    assert r.status_code == 200
    d = r.json()
    # revenue=2500, cogs=1000, fees=250, overhead=125, shipping=100, net=1025
    assert d["revenue"] == 2500.0
    assert d["cogs"] == 1000.0
    assert d["marketplace_fees"] == 250.0
    assert d["overhead"] == 125.0
    assert d["shipping"] == 100.0
    assert d["net_profit"] == 1025.0
    assert d["margin_pct"] == 41.0
    assert d["roi_pct"] == 102.5


# ----------------------- AI Assistant (SSE) -----------------------
def test_assistant_chat_stream(client):
    session_id = f"TEST_{uuid.uuid4()}"
    payload = {"session_id": session_id, "message": "In one short sentence, what is HS code 091030?"}
    with requests.post(
        f"{BASE_URL}/api/assistant/chat",
        json=payload,
        stream=True,
        timeout=60,
        headers={"Content-Type": "application/json"},
    ) as r:
        assert r.status_code == 200
        assert "text/event-stream" in r.headers.get("content-type", "")
        deltas = []
        done = False
        err = None
        for raw in r.iter_lines(decode_unicode=True):
            if not raw:
                continue
            if raw.startswith("data: "):
                obj = json.loads(raw[6:])
                if "delta" in obj:
                    deltas.append(obj["delta"])
                if obj.get("done"):
                    done = True
                    break
                if "error" in obj:
                    err = obj["error"]
                    break
        assert err is None, f"LLM stream error: {err}"
        assert done is True
        assert len("".join(deltas)) > 0


def test_assistant_history(client):
    session_id = f"TEST_{uuid.uuid4()}"
    # send one chat first
    with requests.post(
        f"{BASE_URL}/api/assistant/chat",
        json={"session_id": session_id, "message": "Say 'hi' only."},
        stream=True,
        timeout=60,
    ) as r:
        for raw in r.iter_lines(decode_unicode=True):
            if raw and raw.startswith("data: ") and '"done"' in raw:
                break

    r = client.get(f"{BASE_URL}/api/assistant/history/{session_id}")
    assert r.status_code == 200
    data = r.json()
    assert "messages" in data
    roles = [m["role"] for m in data["messages"]]
    assert "user" in roles and "assistant" in roles
    for m in data["messages"]:
        assert "_id" not in m
