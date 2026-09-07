"""Iteration 2 backend tests: multi-matter, Morgan seed, communications hub, portfolio attention."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip()
API = f"{BASE.rstrip('/')}/api"

HAR = "ATL-HAR-00217"
MOR = "ATL-MOR-00456"


@pytest.fixture(scope="module", autouse=True)
def reset():
    requests.post(f"{API}/reset", timeout=30)
    yield
    requests.post(f"{API}/reset", timeout=30)


# --- Matters list ---
def test_matters_list_has_both():
    r = requests.get(f"{API}/matters", timeout=15)
    assert r.status_code == 200
    ids = [m["id"] for m in r.json()["matters"]]
    assert HAR in ids and MOR in ids


# --- Morgan seed ---
def test_morgan_seed():
    r = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "Morgan Family Trust"
    assert d["interactive"] is False
    cur = [s for s in d["states"] if s["status"] == "CURRENT"]
    assert cur[0]["version"] == "v5.0"
    # Consequential distribution event
    assert any(e["kind"] == "CONSEQUENTIAL" and "Distribution" in e["title"] for e in d["events"])
    # Open obligation
    open_obs = [o for o in d["obligations"] if o["status"] == "OPEN"]
    assert any("rationale" in o["title"].lower() for o in open_obs)
    # RAC + evidence at v5.0
    assert any(r_.get("audience") == "fiduciary" for r_ in d["rac"])
    assert any(e["state_version"] == "v5.0" for e in d["evidence_instruments"])


def test_harrington_initial_intact():
    r = requests.get(f"{API}/matter", params={"matter_id": HAR}, timeout=15)
    d = r.json()
    cur = [s for s in d["states"] if s["status"] == "CURRENT"]
    assert cur[0]["version"] == "v2.0"


# --- Portfolio attention includes Morgan + book ---
def test_portfolio_attention_includes_morgan():
    r = requests.get(f"{API}/portfolio", timeout=15)
    d = r.json()
    att_ids = [m["id"] for m in d["attention"]]
    assert MOR in att_ids
    # Morgan should be navigable
    mor = next(m for m in d["attention"] if m["id"] == MOR)
    assert mor["navigable"] is True
    assert mor["health"] in ("EXCEPTION", "NEEDS_ATTENTION", "ESCALATED")


# --- Communications send resolves Morgan open obligation & bumps v5->v6 ---
def test_communications_send_morgan():
    r = requests.post(f"{API}/communications/send",
                      params={"matter_id": MOR},
                      json={"to": "Daniel Morgan", "type": "Distribution Explanation",
                            "summary": "Explanation letter sent."}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["obligation"]["status"] == "SATISFIED"
    # Verify persistence
    m = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15).json()
    cur = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert cur[0]["version"] == "v6.0"
    assert any(c.get("type") == "Distribution Explanation" for c in m.get("communications", []))
    assert any(e["state_version"] == "v6.0" for e in m["evidence_instruments"])


def test_communications_send_morgan_second_fails():
    # After resolution, no open obligation, so send should 400
    r = requests.post(f"{API}/communications/send",
                      params={"matter_id": MOR},
                      json={"summary": "x"}, timeout=15)
    assert r.status_code == 400


# --- Harrington golden path -> communications resolve v3->v4 ---
def test_harrington_full_flow_via_comms():
    requests.post(f"{API}/reset", timeout=15)
    requests.post(f"{API}/upload-source", params={"matter_id": HAR}, data={"filename": "x.pdf"}, timeout=15)
    requests.post(f"{API}/verify-claims", params={"matter_id": HAR}, timeout=15)
    requests.post(f"{API}/create-changeset", params={"matter_id": HAR}, timeout=15)
    requests.post(f"{API}/approve-changeset", params={"matter_id": HAR}, timeout=15)
    r = requests.post(f"{API}/communications/send",
                     params={"matter_id": HAR},
                     json={"to": "Sarah Harrington", "summary": "Notice delivered"}, timeout=15)
    assert r.status_code == 200
    m = requests.get(f"{API}/matter", params={"matter_id": HAR}, timeout=15).json()
    cur = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert cur[0]["version"] == "v4.0"


# --- Reset restores both matters ---
def test_reset_restores_both():
    requests.post(f"{API}/reset", timeout=15)
    h = requests.get(f"{API}/matter", params={"matter_id": HAR}, timeout=15).json()
    assert [s for s in h["states"] if s["status"] == "CURRENT"][0]["version"] == "v2.0"
    mo = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15).json()
    assert [s for s in mo["states"] if s["status"] == "CURRENT"][0]["version"] == "v5.0"
    # Morgan open obligation should be back
    assert any(o["status"] == "OPEN" for o in mo["obligations"])
