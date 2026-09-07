"""Backend tests for 18th Green Atlas FRM demo (Harrington Family Estate)."""
import os
import pytest
import requests

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE:
    # fallback to reading frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module", autouse=True)
def reset_before_all():
    r = requests.post(f"{API}/reset", timeout=30)
    assert r.status_code == 200
    yield
    requests.post(f"{API}/reset", timeout=30)


# --- Health / basics ---
def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_initial_matter_v2_current():
    r = requests.get(f"{API}/matter", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["matter_id"] == "ATL-HAR-00217"
    current = [s for s in d["states"] if s["status"] == "CURRENT"]
    assert len(current) == 1
    assert current[0]["version"] == "v2.0"
    assert d["flow"]["source_uploaded"] is False


def test_initial_portfolio_no_flag():
    r = requests.get(f"{API}/portfolio", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["harrington_flagged"] is False
    ids = [m["id"] for m in d["attention"]]
    assert "ATL-HAR-00217" not in ids


# --- Golden path ---
def test_golden_path_upload():
    r = requests.post(f"{API}/upload-source", data={"filename": "Successor Trustee Instrument.pdf"}, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert len(d["claims"]) == 4
    assert all(c["status"] == "OBSERVED" for c in d["claims"])


def test_golden_path_verify():
    r = requests.post(f"{API}/verify-claims", timeout=15)
    assert r.status_code == 200
    assert all(c["status"] == "VERIFIED" for c in r.json()["claims"])


def test_golden_path_create_changeset():
    r = requests.post(f"{API}/create-changeset", timeout=15)
    assert r.status_code == 200
    cs = r.json()["changeset"]
    assert cs["status"] == "PROPOSED"
    labels = [c["label"] for c in cs["changes"]]
    assert any("Robert" in l for l in labels)
    assert any("Maya" in l for l in labels)


def test_golden_path_approve_changeset():
    r = requests.post(f"{API}/approve-changeset", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["state"]["version"] == "v3.0"
    assert d["state"]["trustee"] == "Maya Harrington"
    assert d["event"]["id"] == "evt_succession"

    # verify persistence
    m = requests.get(f"{API}/matter", timeout=15).json()
    current = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert current[0]["version"] == "v3.0"
    superseded = [s for s in m["states"] if s["status"] == "SUPERSEDED"]
    assert any(s["version"] == "v2.0" for s in superseded)
    # RAC 3 statements
    aud = sorted([r["audience"] for r in m["rac"]])
    assert aud == ["beneficiary", "fiduciary", "oversight"]
    # evidence for v3
    assert any(e["state_version"] == "v3.0" for e in m["evidence_instruments"])
    # consequential event
    assert any(e["id"] == "evt_succession" for e in m["events"])
    # people updated
    people = {p["id"]: p for p in m["people"]}
    assert people["p_maya"]["status"] == "CURRENT"
    assert people["p_robert"]["status"] == "INACTIVE"


def test_portfolio_flagged_after_approval():
    d = requests.get(f"{API}/portfolio", timeout=15).json()
    assert d["harrington_flagged"] is True
    ids = [m["id"] for m in d["attention"]]
    assert "ATL-HAR-00217" in ids


# --- Margaret ---
def test_margaret_beneficiary():
    r = requests.post(f"{API}/margaret", json={"audience": "beneficiary", "prompt": "Do I need to do anything?"}, timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "text" in d and "sources" in d and "elicit" in d


def test_margaret_fiduciary():
    r = requests.post(f"{API}/margaret", json={"audience": "fiduciary", "prompt": "status"}, timeout=10)
    assert r.status_code == 200


def test_margaret_oversight():
    r = requests.post(f"{API}/margaret", json={"audience": "oversight", "prompt": "why flagged"}, timeout=10)
    assert r.status_code == 200


# --- Elicited context ---
def test_elicited_context():
    r = requests.post(f"{API}/elicited-context",
                      json={"person": "Sarah Harrington", "text": "I understand the trustee changed."}, timeout=10)
    assert r.status_code == 200
    e = r.json()["entry"]
    assert e["class"] == "ELICITED_CONTEXT"
    assert e["status"] == "REQUIRES_REVIEW"


# --- Obligation actions ---
def test_obligation_escalate():
    r = requests.post(f"{API}/obligations/ob_notice/action",
                      json={"action": "escalate", "note": "past window"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["obligation"]["status"] == "ESCALATED"


def test_obligation_resolve_creates_v4():
    r = requests.post(f"{API}/obligations/ob_notice/action",
                      json={"action": "resolve"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["obligation"]["status"] == "SATISFIED"
    m = requests.get(f"{API}/matter", timeout=15).json()
    current = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert current[0]["version"] == "v4.0"
    # exception closed → not flagged anymore
    p = requests.get(f"{API}/portfolio", timeout=15).json()
    assert p["harrington_flagged"] is False


def test_obligation_not_found():
    r = requests.post(f"{API}/obligations/nope/action", json={"action": "escalate"}, timeout=10)
    assert r.status_code == 404


# --- Reset ---
def test_reset():
    r = requests.post(f"{API}/reset", timeout=15)
    assert r.status_code == 200
    m = requests.get(f"{API}/matter", timeout=15).json()
    current = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert current[0]["version"] == "v2.0"
    assert m["flow"]["changeset_approved"] is False
    assert not any(e["id"] == "evt_succession" for e in m["events"])
