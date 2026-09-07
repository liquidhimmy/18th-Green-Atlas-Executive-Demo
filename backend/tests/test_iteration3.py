"""Iteration 3 backend tests: Morgan navigable + golden path, communications, portfolio, regressions."""
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


@pytest.fixture(autouse=True)
def reset_each():
    requests.post(f"{API}/reset", timeout=30)
    yield


# ---------------- Morgan seed at v4.0 ----------------
def test_morgan_initial_v4():
    d = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15).json()
    assert d["name"] == "Morgan Family Trust"
    assert d["interactive"] is True
    cur = [s for s in d["states"] if s["status"] == "CURRENT"]
    assert len(cur) == 1 and cur[0]["version"] == "v4.0"
    assert d["pending_source"]["name"] == "Distribution Request & Trustee Resolution.pdf"
    assert d["claims"] == [] and d["changesets"] == []
    assert d["rac"] == [] and d["beneficiary_impacts"] == []
    assert len(d["evidence_instruments"]) == 1
    assert d["evidence_instruments"][0]["id"] == "mev_v4"
    assert all(v is False for v in d["flow"].values())


def test_matters_list_has_two_navigable():
    d = requests.get(f"{API}/matters", timeout=15).json()
    ids = [m["id"] for m in d["matters"]]
    assert HAR in ids and MOR in ids
    assert all(m["navigable"] for m in d["matters"])


# ---------------- Morgan golden path ----------------
def test_morgan_golden_path():
    up = requests.post(f"{API}/upload-source", params={"matter_id": MOR}, timeout=15).json()
    assert up["source"]["type"] == "Distribution Instrument"
    assert len(up["claims"]) == 4
    assert all(c["status"] == "OBSERVED" for c in up["claims"])

    vr = requests.post(f"{API}/verify-claims", params={"matter_id": MOR}, timeout=15).json()
    assert all(c["status"] == "VERIFIED" for c in vr["claims"])

    cs = requests.post(f"{API}/create-changeset", params={"matter_id": MOR}, timeout=15).json()["changeset"]
    assert cs["id"] == "cs_distribution"
    assert cs["status"] == "PROPOSED"
    assert len(cs["changes"]) == 3

    ap = requests.post(f"{API}/approve-changeset", params={"matter_id": MOR}, timeout=15).json()
    assert ap["state"]["version"] == "v5.0"
    assert ap["event"]["id"] == "mevt_dist"

    # Second approve returns already
    ap2 = requests.post(f"{API}/approve-changeset", params={"matter_id": MOR}, timeout=15).json()
    assert ap2.get("already") is True

    m = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15).json()
    cur = [s for s in m["states"] if s["status"] == "CURRENT"]
    supers = [s for s in m["states"] if s["status"] == "SUPERSEDED"]
    assert cur[0]["version"] == "v5.0"
    assert any(s["version"] == "v4.0" for s in supers)

    ob = next(o for o in m["obligations"] if o["id"] == "mob_rationale")
    assert ob["status"] == "OPEN" and ob["severity"] == "EXCEPTION"

    assert any(b["id"] == "mbi_daniel" and b["impact_status"] == "ACTION_REQUIRED" for b in m["beneficiary_impacts"])
    aud = sorted([r["audience"] for r in m["rac"]])
    assert aud == ["beneficiary", "fiduciary", "oversight"]
    assert all(r["matter_id"] == MOR for r in m["rac"])
    assert any(e["id"] == "mev_v5" for e in m["evidence_instruments"])
    cash = next(a for a in m["assets"] if a["id"] == "ma_cash")
    assert cash["value"] == 470000
    changeset = next(c for c in m["changesets"] if c["id"] == "cs_distribution")
    assert changeset["status"] == "APPROVED"


def test_portfolio_after_morgan_approve():
    for ep in ["upload-source", "verify-claims", "create-changeset", "approve-changeset"]:
        requests.post(f"{API}/{ep}", params={"matter_id": MOR}, timeout=15)
    p = requests.get(f"{API}/portfolio", timeout=15).json()
    mor = next((m for m in p["attention"] if m["id"] == MOR), None)
    assert mor is not None
    assert mor["health"] == "EXCEPTION"
    assert mor["navigable"] is True


# ---------------- Morgan communication hub ----------------
def test_morgan_communication_flow():
    for ep in ["upload-source", "verify-claims", "create-changeset", "approve-changeset"]:
        requests.post(f"{API}/{ep}", params={"matter_id": MOR}, timeout=15)

    esc = requests.post(f"{API}/obligations/mob_rationale/action", params={"matter_id": MOR},
                        json={"action": "escalate"}, timeout=15).json()
    assert esc["obligation"]["status"] == "ESCALATED"

    send = requests.post(f"{API}/communications/send", params={"matter_id": MOR},
                        json={"to": "Daniel Morgan"}, timeout=15).json()
    assert send["communication"]["type"] == "Distribution Explanation"
    assert send["communication"]["status"] == "SENT"
    assert send["obligation"]["status"] == "SATISFIED"

    m = requests.get(f"{API}/matter", params={"matter_id": MOR}, timeout=15).json()
    cur = [s for s in m["states"] if s["status"] == "CURRENT"]
    supers = [s for s in m["states"] if s["status"] == "SUPERSEDED"]
    assert cur[0]["version"] == "v6.0"
    assert any(s["version"] == "v5.0" for s in supers)
    assert len(m["communications"]) == 1
    assert len(m["evidence_instruments"]) == 3
    assert m["flow"]["obligation_resolved"] is True


# ---------------- Harrington regression ----------------
def test_harrington_regression_full():
    # Verify before upload should 400
    r = requests.post(f"{API}/verify-claims", timeout=15)
    assert r.status_code == 400

    requests.post(f"{API}/upload-source", timeout=15)

    # create-changeset before verify -> 400
    r = requests.post(f"{API}/create-changeset", timeout=15)
    assert r.status_code == 400

    requests.post(f"{API}/verify-claims", timeout=15)
    requests.post(f"{API}/create-changeset", timeout=15)
    ap = requests.post(f"{API}/approve-changeset", timeout=15).json()
    assert ap["state"]["version"] == "v3.0"

    m = requests.get(f"{API}/matter", timeout=15).json()
    cur = [s for s in m["states"] if s["status"] == "CURRENT"]
    assert cur[0]["version"] == "v3.0"
    people = {p["id"]: p for p in m["people"]}
    assert people["p_maya"]["status"] == "CURRENT"
    assert people["p_robert"]["status"] == "INACTIVE"
    assert any(o["id"] == "ob_notice" and o["status"] == "OPEN" for o in m["obligations"])
    assert any(b["id"] == "bi_sarah" for b in m["beneficiary_impacts"])
    assert any(e["id"] == "ev_v3" for e in m["evidence_instruments"])

    # Communications send -> v4.0
    send = requests.post(f"{API}/communications/send", params={"matter_id": HAR},
                        json={"to": "Sarah Harrington"}, timeout=15).json()
    assert send["communication"]["type"] == "Beneficiary Notice"
    m2 = requests.get(f"{API}/matter", timeout=15).json()
    cur2 = [s for s in m2["states"] if s["status"] == "CURRENT"]
    assert cur2[0]["version"] == "v4.0"


# ---------------- MARGARET + elicited-context ----------------
def test_margaret_morgan_fiduciary():
    r = requests.post(f"{API}/margaret",
                     json={"audience": "fiduciary", "prompt": "status", "matter_id": MOR}, timeout=15).json()
    assert "checkpoint" in r["text"].lower()


def test_elicited_context_morgan():
    r = requests.post(f"{API}/elicited-context", params={"matter_id": MOR},
                     json={"person": "Daniel Morgan", "text": "I understand."}, timeout=15).json()
    assert r["entry"]["status"] == "REQUIRES_REVIEW"
    assert r["entry"]["class"] == "ELICITED_CONTEXT"
