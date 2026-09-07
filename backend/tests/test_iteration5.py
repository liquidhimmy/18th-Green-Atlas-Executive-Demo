"""Iteration 5: Portfolio Intelligence (GET /api/intelligence) tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend .env parsing
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"
HAR = "ATL-HAR-00217"
MOR = "ATL-MOR-00456"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def _reset(s):
    r = s.post(f"{API}/reset")
    assert r.status_code == 200


def _golden(s, mid):
    for ep in ["upload-source", "verify-claims", "create-changeset", "approve-changeset"]:
        if ep == "upload-source":
            r = s.post(f"{API}/{ep}", params={"matter_id": mid}, files={"filename": (None, "trust_deed.pdf")})
        else:
            r = s.post(f"{API}/{ep}", params={"matter_id": mid})
        assert r.status_code == 200, f"{ep} for {mid} -> {r.status_code} {r.text[:200]}"


# ---- 1: fresh state
def test_intelligence_after_reset(s):
    _reset(s)
    r = s.get(f"{API}/intelligence")
    assert r.status_code == 200
    d = r.json()
    assert d["class"] == "DERIVED"
    assert d["matters"][0]["id"] == HAR
    assert d["matters"][0]["checkpoint"] == "v2.0"
    assert d["matters"][0]["obligation_status"] == "NONE"
    assert d["matters"][1]["id"] == MOR
    assert d["matters"][1]["checkpoint"] == "v4.0"
    assert d["matters"][1]["obligation_status"] == "NONE"
    kinds = [p["kind"] for p in d["patterns"]]
    assert kinds == ["MATTER", "OFFICER", "PROCESS"]
    sigs = [p["signal"] for p in d["patterns"]]
    assert sigs == ["INSUFFICIENT", "NOT PRESENT", "NOT PRESENT"]


# ---- 2: after Harrington golden path
def test_intelligence_after_harrington(s):
    _reset(s)
    _golden(s, HAR)
    d = s.get(f"{API}/intelligence").json()
    h = d["matters"][0]
    assert h["checkpoint"] == "v3.0"
    assert h["obligation_status"] == "OPEN"
    sigs = [p["signal"] for p in d["patterns"]]
    assert sigs == ["INSUFFICIENT", "NOT PRESENT", "NOT PRESENT"]


# ---- 3: both matters active
def test_intelligence_both_active(s):
    _reset(s)
    _golden(s, HAR)
    _golden(s, MOR)
    d = s.get(f"{API}/intelligence").json()
    h, m = d["matters"]
    assert h["checkpoint"] == "v3.0" and h["obligation_status"] == "OPEN"
    assert m["checkpoint"] == "v5.0" and m["obligation_status"] == "OPEN"
    by_kind = {p["kind"]: p for p in d["patterns"]}
    assert by_kind["MATTER"]["signal"] == "DIFFERENTIATED"
    assert by_kind["OFFICER"]["signal"] == "PRESENT"
    assert by_kind["PROCESS"]["signal"] == "PRESENT"
    for k in ["MATTER", "OFFICER", "PROCESS"]:
        p = by_kind[k]
        assert p["reading"], f"empty reading for {k}"
        assert isinstance(p["evidence"], list) and len(p["evidence"]) == 2


# ---- 4: after Harrington communication
def test_intelligence_after_comms(s):
    _reset(s)
    _golden(s, HAR)
    _golden(s, MOR)
    r = s.post(f"{API}/communications/send", params={"matter_id": HAR}, json={"channel": "email"})
    assert r.status_code == 200, r.text[:200]
    d = s.get(f"{API}/intelligence").json()
    h = d["matters"][0]
    assert h["checkpoint"] == "v4.0"
    assert h["obligation_status"] == "SATISFIED"
    assert h["comms"] == 1
    by_kind = {p["kind"]: p["signal"] for p in d["patterns"]}
    assert by_kind["MATTER"] == "DIFFERENTIATED"
    assert by_kind["OFFICER"] == "NOT PRESENT"
    assert by_kind["PROCESS"] == "PARTIAL"


# ---- 5: portfolio endpoint sanity
def test_portfolio_unchanged(s):
    _reset(s)
    r = s.get(f"{API}/portfolio")
    assert r.status_code == 200
    d = r.json()
    assert "portfolio" in d and "summary" in d and "attention" in d


def test_reset_at_end(s):
    _reset(s)
