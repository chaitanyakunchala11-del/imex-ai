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


# ----------------------- Landed Cost -----------------------
def test_landed_cost(client):
    payload = {
        "product_name": "TEST_Turmeric",
        "unit_value": 10.0,
        "quantity": 100,
        "freight": 200.0,
        "insurance": 50.0,
        "duty_rate": 5.0,
        "gst_rate": 10.0,
        "other_fees": 25.0,
        "currency": "AUD",
    }
    r = client.post(f"{BASE_URL}/api/calculator/landed-cost", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    # goods=1000, cif=1250, duty=62.5, gst base=1337.5, gst=133.75, total=1471.25
    assert d["goods_value"] == 1000.0
    assert d["cif_value"] == 1250.0
    assert d["duty"] == 62.5
    assert d["gst"] == 133.75
    assert d["total_landed_cost"] == 1471.25
    assert d["per_unit_cost"] == round(1471.25 / 100, 2)
    assert isinstance(d["breakdown"], list) and len(d["breakdown"]) == 6


def test_landed_cost_validation(client):
    r = client.post(f"{BASE_URL}/api/calculator/landed-cost", json={"unit_value": "abc"})
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
