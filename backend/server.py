import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="18th Green Atlas FRM")
api = APIRouter(prefix="/api")
app.add_middleware(CORSMiddleware, allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

HAR = "ATL-HAR-00217"
MOR = "ATL-MOR-00456"
NAVIGABLE = [HAR, MOR]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def today():
    return now_iso()[:10]


def next_version(states):
    cur = next((s for s in states if s["status"] == "CURRENT"), states[-1])
    major = int(cur["version"].lstrip("v").split(".")[0])
    return f"v{major + 1}.0"


# ---------------------------------------------------------------------------
# HARRINGTON SEED
# ---------------------------------------------------------------------------
def build_harrington():
    people = [
        {"id": "p_linda", "name": "Linda Harrington", "role": "Grantor / Settlor", "lens_role": "grantor", "status": "DECEASED", "since": "1987", "initials": "LH", "detail": "Established the Harrington Family Revocable Living Trust in 1987."},
        {"id": "p_robert", "name": "Robert Harrington", "role": "Original Trustee", "lens_role": "trustee", "status": "CURRENT", "since": "2009", "initials": "RH", "detail": "Serving trustee under the original instrument. Subject of the pending succession."},
        {"id": "p_maya", "name": "Maya Harrington", "role": "Successor Trustee", "lens_role": "successor", "status": "STANDBY", "since": "2019", "initials": "MH", "detail": "Named successor trustee under Trust Agreement, Article VII §3.2."},
        {"id": "p_sarah", "name": "Sarah Harrington", "role": "Primary Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "1994", "initials": "SH", "detail": "Primary income beneficiary of the marital trust."},
        {"id": "p_michael", "name": "Michael Harrington", "role": "Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "1996", "initials": "MH", "detail": "Remainder beneficiary."},
        {"id": "p_grace", "name": "Grace Harrington", "role": "Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "2001", "initials": "GH", "detail": "Remainder beneficiary."},
        {"id": "p_emily", "name": "Emily Harrington", "role": "Contingent Beneficiary (minor)", "lens_role": "beneficiary", "status": "CONTINGENT", "since": "2014", "initials": "EH", "detail": "Contingent beneficiary; distributions held per HEMS standard."},
        {"id": "p_robertjr", "name": "Robert Harrington Jr.", "role": "Contingent Beneficiary", "lens_role": "beneficiary", "status": "CONTINGENT", "since": "1998", "initials": "RJ", "detail": "Contingent remainder beneficiary."},
        {"id": "p_james", "name": "James Morgan", "role": "Fiduciary Officer", "lens_role": "officer", "status": "ASSIGNED", "since": "2021", "initials": "JM", "detail": "Assigned trust officer operating this Matter."},
        {"id": "p_patricia", "name": "Patricia Vance", "role": "Oversight Supervisor", "lens_role": "oversight", "status": "ASSIGNED", "since": "2020", "initials": "PV", "detail": "Portfolio supervisor responsible for exception review."},
        {"id": "p_david", "name": "David Chen", "role": "Wealth Advisor", "lens_role": "advisor", "status": "ADVISORY", "since": "2018", "initials": "DC", "detail": "External advisor coordinating investment strategy."},
        {"id": "p_thomas", "name": "Thomas Reed", "role": "Legal Counsel", "lens_role": "counsel", "status": "ADVISORY", "since": "2016", "initials": "TR", "detail": "Outside counsel for the trust."},
    ]
    structures = [
        {"id": "s_rlt", "name": "Harrington Family Revocable Living Trust", "type": "Revocable Living Trust", "status": "Active", "established": "1987"},
        {"id": "s_marital", "name": "Marital Trust", "type": "Sub-trust", "status": "Active", "established": "2009"},
        {"id": "s_credit", "name": "Credit Shelter Trust", "type": "Sub-trust", "status": "Active", "established": "2009"},
        {"id": "s_llc", "name": "Family Holdings LLC", "type": "Entity", "status": "Active", "established": "2011"},
        {"id": "s_ilit", "name": "Irrevocable Life Insurance Trust", "type": "Irrevocable Trust", "status": "Active", "established": "2013"},
        {"id": "s_crt", "name": "Charitable Remainder Trust", "type": "Split-interest Trust", "status": "Active", "established": "2015"},
    ]
    assets = [
        {"id": "a_home", "name": "Primary Residence", "type": "Real Property", "value": 2850000, "location": "Atlanta, GA"},
        {"id": "a_beach", "name": "Beach House", "type": "Real Property", "value": 1650000, "location": "St. Simons Island, GA"},
        {"id": "a_portfolio", "name": "Investment Portfolio", "type": "Marketable Securities", "value": 4120000, "location": "Custodial"},
        {"id": "a_llc", "name": "Family Holdings LLC Interest", "type": "Business Interest", "value": 1980000, "location": "Family Holdings LLC"},
        {"id": "a_retire", "name": "Retirement Accounts", "type": "Qualified Accounts", "value": 890000, "location": "Custodial"},
        {"id": "a_life", "name": "Life Insurance Policy", "type": "Insurance", "value": 2000000, "location": "ILIT"},
        {"id": "a_art", "name": "Art Collection", "type": "Tangible Property", "value": 640000, "location": "Primary Residence"},
        {"id": "a_cash", "name": "Cash Reserves", "type": "Cash", "value": 310000, "location": "Operating Account"},
        {"id": "a_commercial", "name": "Commercial Property", "type": "Real Property", "value": 1220000, "location": "Savannah, GA"},
    ]
    states = [
        {"version": "v1.0", "status": "SUPERSEDED", "title": "Original Relationship Established", "trustee": "Robert Harrington", "trustee_status": "CURRENT", "effective_time": "2009-03-15", "recorded_time": "2009-03-20", "verified_time": "2009-03-22", "released_time": "2009-03-22", "summary": "Original governing instrument established. Robert Harrington confirmed as trustee.", "authority": "Trust Agreement, Article II §1.1"},
        {"version": "v2.0", "status": "CURRENT", "title": "Third Amendment Incorporated", "trustee": "Robert Harrington", "trustee_status": "CURRENT", "effective_time": "2022-09-01", "recorded_time": "2022-09-20", "verified_time": "2022-09-22", "released_time": "2022-09-22", "summary": "Third Amendment incorporated, refining contingent distribution language. Robert Harrington remains trustee.", "authority": "Third Amendment to Trust, executed 2022-09-01"},
    ]
    sources = [
        {"id": "src_trust", "name": "Trust Agreement.pdf", "type": "Governing Instrument", "status": "VERIFIED", "uploaded": "2009-03-20", "size": "3.1 MB"},
        {"id": "src_amend", "name": "Third Amendment 2022.pdf", "type": "Amendment", "status": "VERIFIED", "uploaded": "2022-09-20", "size": "1.1 MB"},
        {"id": "src_schedule", "name": "Schedule A - Assets.pdf", "type": "Schedule", "status": "VERIFIED", "uploaded": "2022-09-20", "size": "854 KB"},
    ]
    events = [
        {"id": "evt_v1", "kind": "STATE_RELEASE", "title": "Original Relationship Established", "date": "2009-03-22", "state_version": "v1.0", "summary": "Harrington Family Revocable Living Trust established and governed.", "icon": "landmark"},
        {"id": "evt_v2", "kind": "STATE_RELEASE", "title": "Third Amendment Incorporated", "date": "2022-09-22", "state_version": "v2.0", "summary": "Amendment reviewed, verified, and released as governed state.", "icon": "file-text"},
    ]
    obligations = [
        {"id": "ob_annual", "title": "Annual accounting to beneficiaries", "owner": "James Morgan", "status": "ON_TRACK", "due": "2026-12-31", "created_by": "evt_v2", "standing": True, "detail": "Prepare and deliver the annual fiduciary accounting.", "lens": "fiduciary"},
        {"id": "ob_tax", "title": "File fiduciary income tax return (Form 1041)", "owner": "James Morgan", "status": "ON_TRACK", "due": "2026-04-15", "created_by": "evt_v2", "standing": True, "detail": "Coordinate with tax preparer and file the trust return.", "lens": "fiduciary"},
        {"id": "ob_review", "title": "Investment policy statement review", "owner": "David Chen", "status": "UPCOMING", "due": "2026-07-30", "created_by": "evt_v2", "standing": True, "detail": "Periodic review of investment allocation vs. policy.", "lens": "fiduciary"},
    ]
    return {
        "matter_id": HAR, "name": "Harrington Family Estate", "short": "Harrington", "status": "ACTIVE",
        "matter_type": "Revocable Living Trust", "jurisdiction": "Georgia, USA", "officer": "James Morgan",
        "established": "1987", "interactive": True, "image": "harrington",
        "tagline": "Generations are linked by more than assets — they're bound by responsibility.",
        "pending_source": {"name": "Successor Acceptance & Resignation Instrument.pdf", "type": "Successor Acceptance & Resignation Instrument",
                           "headline": "A new source has arrived for this Matter",
                           "description": "Successor-trustee condition may be satisfied. Move through the governed change workflow: upload → extract → verify → ChangeSet → establish state."},
        "people": people, "structures": structures, "assets": assets, "states": states, "sources": sources,
        "claims": [], "changesets": [], "events": events, "obligations": obligations,
        "beneficiary_impacts": [], "rac": [], "communications": [],
        "evidence_instruments": [
            {"id": "ev_v2", "matter_id": HAR, "instrument_id": "ATL-HAR-00217-EV-0002", "title": "Third Amendment — Governed Checkpoint", "state_version": "v2.0", "lifecycle": "RELEASED", "checkpoint_time": "2022-09-22", "hash": "9F2C-71AB-04E7-D1C6", "verification_class": "Human-verified · Source-linked", "prev_state": "v1.0", "successor_state": "—", "transition_type": "Amendment incorporation", "sources": ["Third Amendment 2022.pdf", "Schedule A - Assets.pdf"]},
        ],
        "elicited_context": [],
        "flow": {"source_uploaded": False, "claims_verified": False, "changeset_created": False, "changeset_approved": False, "obligation_escalated": False, "obligation_resolved": False},
    }


def succession_claims():
    return [
        {"id": "cl_condition", "field": "Successor Condition", "observed": "Successor-trustee condition satisfied", "authority": "Trust Agreement, Article VII §3.2", "kind": "authority", "status": "OBSERVED", "confidence": 0.97, "note": "AI observation — requires human verification."},
        {"id": "cl_robert", "field": "Robert Harrington", "observed": "CURRENT → INACTIVE", "authority": "Trust Agreement, Article VII §3.2", "kind": "person", "status": "OBSERVED", "confidence": 0.96, "note": "Outgoing trustee role change proposed."},
        {"id": "cl_maya", "field": "Maya Harrington", "observed": "STANDBY → CURRENT", "authority": "Trust Agreement, Article VII §3.2", "kind": "person", "status": "OBSERVED", "confidence": 0.96, "note": "Successor trustee activation proposed."},
        {"id": "cl_effective", "field": "Effective Date", "observed": "2026-06-01", "authority": "Successor Acceptance & Resignation Instrument", "kind": "date", "status": "OBSERVED", "confidence": 0.94, "note": "Effective time distinct from recorded time."},
    ]


# ---------------------------------------------------------------------------
# MORGAN SEED (fully-populated, already progressed to v5.0 with an open exception)
# ---------------------------------------------------------------------------
def build_morgan():
    people = [
        {"id": "m_eleanor", "name": "Eleanor Morgan", "role": "Grantor / Settlor", "lens_role": "grantor", "status": "DECEASED", "since": "1998", "initials": "EM", "detail": "Established the Morgan Family Irrevocable Trust in 1998."},
        {"id": "m_thomas", "name": "Thomas Morgan", "role": "Current Trustee", "lens_role": "trustee", "status": "CURRENT", "since": "2011", "initials": "TM", "detail": "Serving trustee; approved the recent discretionary distribution."},
        {"id": "m_daniel", "name": "Daniel Morgan", "role": "Primary Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "1990", "initials": "DM", "detail": "Primary beneficiary; recipient of the recent discretionary distribution."},
        {"id": "m_claire", "name": "Claire Morgan", "role": "Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "1993", "initials": "CM", "detail": "Income and remainder beneficiary."},
        {"id": "m_henry", "name": "Henry Morgan", "role": "Beneficiary", "lens_role": "beneficiary", "status": "CURRENT", "since": "1996", "initials": "HM", "detail": "Remainder beneficiary."},
        {"id": "m_olivia", "name": "Olivia Morgan", "role": "Contingent Beneficiary", "lens_role": "beneficiary", "status": "CONTINGENT", "since": "2016", "initials": "OM", "detail": "Contingent beneficiary (minor)."},
        {"id": "m_james", "name": "James Morgan", "role": "Fiduciary Officer", "lens_role": "officer", "status": "ASSIGNED", "since": "2021", "initials": "JM", "detail": "Assigned trust officer operating this Matter."},
        {"id": "m_patricia", "name": "Patricia Vance", "role": "Oversight Supervisor", "lens_role": "oversight", "status": "ASSIGNED", "since": "2020", "initials": "PV", "detail": "Portfolio supervisor responsible for exception review."},
        {"id": "m_david", "name": "David Chen", "role": "Wealth Advisor", "lens_role": "advisor", "status": "ADVISORY", "since": "2019", "initials": "DC", "detail": "External investment advisor."},
        {"id": "m_susan", "name": "Susan Blake", "role": "Legal Counsel", "lens_role": "counsel", "status": "ADVISORY", "since": "2015", "initials": "SB", "detail": "Outside counsel for the trust."},
    ]
    structures = [
        {"id": "ms_trust", "name": "Morgan Family Irrevocable Trust", "type": "Irrevocable Trust", "status": "Active", "established": "1998"},
        {"id": "ms_gst", "name": "Generation-Skipping Trust", "type": "GST Trust", "status": "Active", "established": "2001"},
        {"id": "ms_llc", "name": "Morgan Holdings LLC", "type": "Entity", "status": "Active", "established": "2005"},
        {"id": "ms_marital", "name": "Marital Trust", "type": "Sub-trust", "status": "Active", "established": "1998"},
        {"id": "ms_foundation", "name": "Morgan Family Foundation", "type": "Private Foundation", "status": "Active", "established": "2010"},
        {"id": "ms_ilit", "name": "Irrevocable Life Insurance Trust", "type": "Irrevocable Trust", "status": "Active", "established": "2008"},
    ]
    assets = [
        {"id": "ma_portfolio", "name": "Managed Investment Portfolio", "type": "Marketable Securities", "value": 6240000, "location": "Custodial"},
        {"id": "ma_business", "name": "Morgan Holdings LLC Interest", "type": "Business Interest", "value": 3850000, "location": "Morgan Holdings LLC"},
        {"id": "ma_estate", "name": "Family Estate", "type": "Real Property", "value": 3100000, "location": "Charleston, SC"},
        {"id": "ma_vineyard", "name": "Vineyard Property", "type": "Real Property", "value": 2450000, "location": "Napa, CA"},
        {"id": "ma_life", "name": "Life Insurance Policy", "type": "Insurance", "value": 3000000, "location": "ILIT"},
        {"id": "ma_cash", "name": "Cash & Money Market", "type": "Cash", "value": 720000, "location": "Operating Account"},
        {"id": "ma_collect", "name": "Collectibles & Wine", "type": "Tangible Property", "value": 540000, "location": "Family Estate"},
    ]
    states = [
        {"version": "v1.0", "status": "SUPERSEDED", "title": "Trust Established", "trustee": "Thomas Morgan", "trustee_status": "CURRENT", "effective_time": "1998-05-10", "recorded_time": "1998-05-14", "verified_time": "1998-05-16", "released_time": "1998-05-16", "summary": "Morgan Family Irrevocable Trust established.", "authority": "Trust Agreement, Article I"},
        {"version": "v2.0", "status": "SUPERSEDED", "title": "First Amendment", "trustee": "Thomas Morgan", "trustee_status": "CURRENT", "effective_time": "2011-02-01", "recorded_time": "2011-02-10", "verified_time": "2011-02-12", "released_time": "2011-02-12", "summary": "Trustee succession to Thomas Morgan incorporated.", "authority": "First Amendment"},
        {"version": "v3.0", "status": "SUPERSEDED", "title": "Asset Restructure", "trustee": "Thomas Morgan", "trustee_status": "CURRENT", "effective_time": "2018-06-01", "recorded_time": "2018-06-08", "verified_time": "2018-06-10", "released_time": "2018-06-10", "summary": "Holdings LLC interest contributed and revalued.", "authority": "Trustee Resolution 2018-06"},
        {"version": "v4.0", "status": "CURRENT", "title": "Investment Policy Update", "trustee": "Thomas Morgan", "trustee_status": "CURRENT", "effective_time": "2024-01-15", "recorded_time": "2024-01-20", "verified_time": "2024-01-22", "released_time": "2024-01-22", "summary": "Investment policy statement updated for diversification. Thomas Morgan remains trustee.", "authority": "IPS 2024"},
    ]
    sources = [
        {"id": "msrc_trust", "name": "Morgan Trust Agreement.pdf", "type": "Governing Instrument", "status": "VERIFIED", "uploaded": "1998-05-14", "size": "2.7 MB"},
        {"id": "msrc_ips", "name": "Investment Policy 2024.pdf", "type": "Policy", "status": "VERIFIED", "uploaded": "2024-01-20", "size": "640 KB"},
    ]
    events = [
        {"id": "mevt_v1", "kind": "STATE_RELEASE", "title": "Trust Established", "date": "1998-05-16", "state_version": "v1.0", "summary": "Morgan Family Irrevocable Trust established and governed.", "icon": "landmark"},
        {"id": "mevt_v2", "kind": "STATE_RELEASE", "title": "First Amendment", "date": "2011-02-12", "state_version": "v2.0", "summary": "Trustee succession to Thomas Morgan incorporated and released.", "icon": "file-text"},
        {"id": "mevt_v3", "kind": "STATE_RELEASE", "title": "Asset Restructure", "date": "2018-06-10", "state_version": "v3.0", "summary": "Holdings interest contributed; governed state re-released.", "icon": "file-text"},
        {"id": "mevt_v4", "kind": "STATE_RELEASE", "title": "Investment Policy Update", "date": "2024-01-22", "state_version": "v4.0", "summary": "Investment policy update reviewed and released.", "icon": "file-text"},
    ]
    obligations = [
        {"id": "mob_annual", "title": "Annual accounting to beneficiaries", "owner": "James Morgan", "status": "ON_TRACK", "due": "2026-12-31", "created_by": "mevt_v4", "standing": True, "detail": "Prepare and deliver the annual fiduciary accounting.", "lens": "fiduciary"},
        {"id": "mob_tax", "title": "File fiduciary income tax return (Form 1041)", "owner": "James Morgan", "status": "ON_TRACK", "due": "2026-04-15", "created_by": "mevt_v4", "standing": True, "detail": "Coordinate and file the trust return.", "lens": "fiduciary"},
        {"id": "mob_ips", "title": "Investment policy compliance review", "owner": "David Chen", "status": "UPCOMING", "due": "2026-09-30", "created_by": "mevt_v4", "standing": True, "detail": "Confirm allocation remains within IPS 2024 bands.", "lens": "fiduciary"},
    ]
    evidence = [
        {"id": "mev_v4", "matter_id": MOR, "instrument_id": "ATL-MOR-00456-EV-0004", "title": "Investment Policy Update — Governed Checkpoint", "state_version": "v4.0", "lifecycle": "RELEASED", "checkpoint_time": "2024-01-22", "hash": "7A2E-93BD-11C4-E6F0", "verification_class": "Human-verified · Source-linked", "prev_state": "v3.0", "successor_state": "—", "transition_type": "Policy update", "sources": ["Investment Policy 2024.pdf", "Morgan Trust Agreement.pdf"]},
    ]
    return {
        "matter_id": MOR, "name": "Morgan Family Trust", "short": "Morgan", "status": "ACTIVE",
        "matter_type": "Irrevocable Trust", "jurisdiction": "South Carolina, USA", "officer": "James Morgan",
        "established": "1998", "interactive": True, "image": "morgan",
        "tagline": "A legacy stewarded across generations, governed with discipline.",
        "pending_source": {"name": "Distribution Request & Trustee Resolution.pdf", "type": "Distribution Instrument",
                           "headline": "A distribution request has arrived for this Matter",
                           "description": "Daniel Morgan has requested a discretionary distribution under the HEMS standard. Move through the governed change workflow: upload → extract → verify → ChangeSet → establish state."},
        "people": people, "structures": structures, "assets": assets, "states": states, "sources": sources,
        "claims": [], "changesets": [], "events": events, "obligations": obligations,
        "beneficiary_impacts": [], "rac": [], "communications": [], "evidence_instruments": evidence,
        "elicited_context": [],
        "flow": {"source_uploaded": False, "claims_verified": False, "changeset_created": False, "changeset_approved": False, "obligation_escalated": False, "obligation_resolved": False},
    }


SEEDERS = {HAR: build_harrington, MOR: build_morgan}


# ---------------------------------------------------------------------------
# SCRIPTED GOLDEN PATHS (deterministic, per Matter)
# ---------------------------------------------------------------------------
def distribution_claims():
    return [
        {"id": "mcl_standard", "field": "Distribution Standard", "observed": "HEMS standard satisfied (education funding)", "authority": "Trust Agreement, Article V §2.4", "kind": "authority", "status": "OBSERVED", "confidence": 0.95, "note": "AI observation — requires human verification."},
        {"id": "mcl_recipient", "field": "Daniel Morgan", "observed": "Recipient of discretionary distribution", "authority": "Trust Agreement, Article V §2.4", "kind": "person", "status": "OBSERVED", "confidence": 0.97, "note": "Primary beneficiary named in request."},
        {"id": "mcl_amount", "field": "Distribution Amount", "observed": "$250,000 from Cash & Money Market", "authority": "Trustee Resolution 2026-05", "kind": "authority", "status": "OBSERVED", "confidence": 0.93, "note": "Amount stated in trustee resolution."},
        {"id": "mcl_effective", "field": "Effective Date", "observed": "2026-05-20", "authority": "Trustee Resolution 2026-05", "kind": "date", "status": "OBSERVED", "confidence": 0.94, "note": "Effective time distinct from recorded time."},
    ]


def apply_succession(doc):
    v3 = {"version": "v3.0", "status": "CURRENT", "title": "Successor Trustee Activated", "trustee": "Maya Harrington", "trustee_status": "CURRENT",
          "effective_time": "2026-06-01", "recorded_time": today(), "verified_time": today(), "released_time": today(),
          "summary": "Successor-trustee condition satisfied and verified. Maya Harrington activated as current trustee; Robert Harrington moved to inactive.", "authority": "Trust Agreement, Article VII §3.2"}
    doc["states"].append(v3)
    for p in doc["people"]:
        if p["id"] == "p_robert":
            p["status"], p["role"] = "INACTIVE", "Former Trustee"
        if p["id"] == "p_maya":
            p["status"], p["role"] = "CURRENT", "Current Trustee"
    event = {"id": "evt_succession", "kind": "CONSEQUENTIAL", "title": "Successor Trustee Activation", "date": today(), "state_version": "v3.0",
             "summary": "Trustee succession represented as one consequential event linking source, verification, state transition, conduct, obligation, and beneficiary impact.", "icon": "refresh",
             "trigger": "Successor-trustee condition satisfied.", "authority": "Trust Agreement, Article VII §3.2", "source": "Successor Acceptance & Resignation Instrument",
             "verification": "James Morgan verified claims against source authority.",
             "transition": {"from": "v2.0", "to": "v3.0", "changes": ["Robert Harrington: CURRENT → INACTIVE", "Maya Harrington: STANDBY → CURRENT"]},
             "conduct": "Fiduciary officer reviewed and confirmed succession documentation.", "obligation": "ob_notice", "beneficiary_impact": "bi_sarah", "evidence": "ev_v3",
             "effective_time": "2026-06-01", "recorded_time": today(), "verified_time": today(), "released_time": today()}
    doc["events"].append(event)
    doc["obligations"] = [o for o in doc["obligations"] if o["id"] != "ob_notice"] + [
        {"id": "ob_notice", "title": "Notify affected beneficiaries of trustee succession", "owner": "James Morgan", "status": "OPEN", "due": "2026-06-08", "created_by": "evt_succession", "severity": "NEEDS_ATTENTION",
         "detail": "Deliver formal notice of trustee change to affected beneficiaries and record completion evidence.", "lens": "fiduciary", "days_open": 3,
         "history": [{"time": now_iso(), "actor": "System", "action": "Obligation created from Successor Trustee Activation."}]}]
    doc["beneficiary_impacts"] = [b for b in doc["beneficiary_impacts"] if b["id"] != "bi_sarah"] + [
        {"id": "bi_sarah", "matter_id": HAR, "person_id": "p_sarah", "transition_id": "v2.0->v3.0", "impact_status": "INFORMATIONAL",
         "what_changed": "Maya Harrington is now serving as your trustee.", "what_did_not_change": "Your beneficiary status and distribution rights are unchanged.",
         "what_it_means": "Day-to-day administration of the trust continues under a new trustee.", "action_required": "No action is required from you at this time."}]
    doc["rac"] = [r for r in doc["rac"] if r.get("event") != "evt_succession"] + [
        {"id": "rac_fid", "event": "evt_succession", "audience": "fiduciary", "title": "Fiduciary R.A.C. — Successor Trustee Activation", "generated": today(), "matter_id": HAR, "instrument_id": "ATL-HAR-00217-RAC-F-0003", "sections": [
            {"h": "What we did", "b": "Verified the successor-trustee condition and released a new governed state activating Maya Harrington as trustee."},
            {"h": "Under what authority", "b": "Trust Agreement, Article VII §3.2, supported by the Successor Acceptance & Resignation Instrument."},
            {"h": "What evidence supports it", "b": "Source document verified by James Morgan; claims confirmed against the governing instrument."},
            {"h": "What state resulted", "b": "Governed checkpoint advanced from v2.0 (superseded) to v3.0 (current)."},
            {"h": "What remains to be done", "b": "One open obligation: notify affected beneficiaries by 2026-06-08."}]},
        {"id": "rac_ben", "event": "evt_succession", "audience": "beneficiary", "title": "Your R.A.C. Statement — Trustee Change", "generated": today(), "matter_id": HAR, "instrument_id": "ATL-HAR-00217-RAC-B-0003", "sections": [
            {"h": "What happened", "b": "The trust transitioned to its named successor trustee, Maya Harrington."},
            {"h": "What changed for you", "b": "Your point of contact for trustee matters is now Maya Harrington."},
            {"h": "What did not change", "b": "Your status as a beneficiary and your distribution rights remain the same."},
            {"h": "What it means for you", "b": "The trust continues to be administered on your behalf, without interruption."},
            {"h": "Do I need to do anything?", "b": "No action is required from you at this time."},
            {"h": "Who should I contact?", "b": "You may reach out to your fiduciary team with any questions."}]},
        {"id": "rac_ov", "event": "evt_succession", "audience": "oversight", "title": "Oversight R.A.C. — Successor Trustee Activation", "generated": today(), "matter_id": HAR, "instrument_id": "ATL-HAR-00217-RAC-O-0003", "sections": [
            {"h": "Consequential conduct", "b": "Verified succession and released governed state v3.0 (officer: James Morgan)."},
            {"h": "Exceptions", "b": "Beneficiary notification obligation currently OPEN; monitor against expected window."},
            {"h": "Obligations remaining", "b": "1 open — notify affected beneficiaries (due 2026-06-08)."},
            {"h": "Evidence / confirmations", "b": "Source-linked instrument verified; state transition provenance recorded."},
            {"h": "Supervisory attention", "b": "Attention warranted only if notice remains open beyond the expected window."},
            {"h": "Next action owner", "b": "James Morgan (fiduciary officer)."}]},
    ]
    doc["evidence_instruments"] = [e for e in doc["evidence_instruments"] if e["id"] != "ev_v3"] + [
        {"id": "ev_v3", "matter_id": HAR, "instrument_id": "ATL-HAR-00217-EV-0003", "title": "Successor Trustee Activation — Governed Transition", "state_version": "v3.0", "lifecycle": "RELEASED", "checkpoint_time": today(), "hash": "E7A3-9B2C-4F6D-A18B", "verification_class": "Human-verified · Source-linked", "prev_state": "v2.0", "successor_state": "—", "transition_type": "Successor trustee activation", "sources": ["Successor Acceptance & Resignation Instrument", "Trust Agreement.pdf"]}]
    return v3, event


def apply_distribution(doc):
    v5 = {"version": "v5.0", "status": "CURRENT", "title": "Discretionary Distribution Approved", "trustee": "Thomas Morgan", "trustee_status": "CURRENT",
          "effective_time": "2026-05-20", "recorded_time": today(), "verified_time": today(), "released_time": today(),
          "summary": "A $250,000 discretionary distribution to Daniel Morgan was reviewed and approved under the HEMS standard. Trust cash reserves adjusted.", "authority": "Trust Agreement, Article V §2.4"}
    doc["states"].append(v5)
    for a in doc["assets"]:
        if a["id"] == "ma_cash":
            a["value"] = 470000
    for p in doc["people"]:
        if p["id"] == "m_daniel":
            p["detail"] = "Primary beneficiary; recipient of the $250,000 discretionary distribution approved at v5.0."
    event = {"id": "mevt_dist", "kind": "CONSEQUENTIAL", "title": "Discretionary Distribution Approved", "date": today(), "state_version": "v5.0",
             "summary": "A discretionary distribution was reviewed and approved, linked to source authority, conduct, obligation, and beneficiary impact.", "icon": "refresh",
             "trigger": "Beneficiary education funding request received.", "authority": "Trust Agreement, Article V §2.4 (discretionary HEMS standard).",
             "source": "Distribution Request & Trustee Resolution",
             "verification": "James Morgan verified the request and trustee resolution against the distribution standard.",
             "transition": {"from": "v4.0", "to": "v5.0", "changes": ["Discretionary distribution of $250,000 approved to Daniel Morgan", "Cash & Money Market: $720,000 → $470,000"]},
             "conduct": "Trustee Thomas Morgan approved the distribution under the HEMS standard.",
             "obligation": "mob_rationale", "beneficiary_impact": "mbi_daniel", "evidence": "mev_v5",
             "effective_time": "2026-05-20", "recorded_time": today(), "verified_time": today(), "released_time": today()}
    doc["events"].append(event)
    doc["obligations"] = [o for o in doc["obligations"] if o["id"] != "mob_rationale"] + [
        {"id": "mob_rationale", "title": "Document distribution rationale & notify beneficiary", "owner": "James Morgan", "status": "OPEN", "due": "2026-06-10", "created_by": "mevt_dist", "severity": "EXCEPTION", "days_open": 4,
         "detail": "Record the written rationale for the discretionary distribution, complete the unusual-pattern review flagged by portfolio intelligence, and deliver the distribution explanation to the beneficiary.", "lens": "fiduciary",
         "history": [{"time": now_iso(), "actor": "System", "action": "Obligation created from Discretionary Distribution Approved."}]}]
    doc["beneficiary_impacts"] = [b for b in doc["beneficiary_impacts"] if b["id"] != "mbi_daniel"] + [
        {"id": "mbi_daniel", "matter_id": MOR, "person_id": "m_daniel", "transition_id": "v4.0->v5.0", "impact_status": "ACTION_REQUIRED",
         "what_changed": "A discretionary distribution of $250,000 was approved to you.", "what_did_not_change": "Your ongoing beneficiary status and future rights are unchanged.",
         "what_it_means": "Funds will be released per the trustee resolution; the distribution may have tax reporting implications.", "action_required": "Please confirm your current mailing and banking details for the distribution."}]
    doc["rac"] = [r for r in doc["rac"] if r.get("event") != "mevt_dist"] + [
        {"id": "mrac_fid", "event": "mevt_dist", "audience": "fiduciary", "title": "Fiduciary R.A.C. — Discretionary Distribution", "generated": today(), "matter_id": MOR, "instrument_id": "ATL-MOR-00456-RAC-F-0005", "sections": [
            {"h": "What we did", "b": "Reviewed and approved a $250,000 discretionary distribution to Daniel Morgan under the HEMS standard."},
            {"h": "Under what authority", "b": "Trust Agreement, Article V §2.4, supported by the trustee resolution."},
            {"h": "What evidence supports it", "b": "Distribution request and trustee resolution verified by James Morgan."},
            {"h": "What state resulted", "b": "Governed checkpoint advanced from v4.0 (superseded) to v5.0 (current)."},
            {"h": "What remains to be done", "b": "Document the distribution rationale and deliver the distribution explanation to Daniel Morgan by 2026-06-10."}]},
        {"id": "mrac_ben", "event": "mevt_dist", "audience": "beneficiary", "title": "Your R.A.C. Statement — Distribution Approved", "generated": today(), "matter_id": MOR, "instrument_id": "ATL-MOR-00456-RAC-B-0005", "sections": [
            {"h": "What happened", "b": "The trustee approved a discretionary distribution to you."},
            {"h": "What changed for you", "b": "A distribution of $250,000 has been approved for release."},
            {"h": "What did not change", "b": "Your ongoing beneficiary status is unchanged."},
            {"h": "What it means for you", "b": "Funds will be released; there may be tax reporting implications."},
            {"h": "Do I need to do anything?", "b": "Please confirm your current mailing and banking details."},
            {"h": "Who should I contact?", "b": "Reach out to your fiduciary team with any questions."}]},
        {"id": "mrac_ov", "event": "mevt_dist", "audience": "oversight", "title": "Oversight R.A.C. — Discretionary Distribution", "generated": today(), "matter_id": MOR, "instrument_id": "ATL-MOR-00456-RAC-O-0005", "sections": [
            {"h": "Consequential conduct", "b": "Trustee approved a $250,000 discretionary distribution (officer: James Morgan)."},
            {"h": "Exceptions", "b": "Portfolio intelligence flagged an unusual distribution pattern; rationale documentation is open."},
            {"h": "Obligations remaining", "b": "1 open — document rationale & notify beneficiary (due 2026-06-10)."},
            {"h": "Evidence / confirmations", "b": "Distribution instrument verified; state transition provenance recorded."},
            {"h": "Supervisory attention", "b": "Attention warranted — distribution size and pattern exceed baseline."},
            {"h": "Next action owner", "b": "James Morgan (fiduciary officer)."}]},
    ]
    doc["evidence_instruments"] = [e for e in doc["evidence_instruments"] if e["id"] != "mev_v5"] + [
        {"id": "mev_v5", "matter_id": MOR, "instrument_id": "ATL-MOR-00456-EV-0005", "title": "Discretionary Distribution — Governed Transition", "state_version": "v5.0", "lifecycle": "RELEASED", "checkpoint_time": today(), "hash": "4B1D-77CE-2A90-F35E", "verification_class": "Human-verified · Source-linked", "prev_state": "v4.0", "successor_state": "—", "transition_type": "Discretionary distribution", "sources": ["Distribution Request & Trustee Resolution.pdf", "Morgan Trust Agreement.pdf"]}]
    return v5, event


SCRIPTS = {
    HAR: {
        "source": {"id": "src_succession", "type": "Successor Acceptance & Resignation Instrument", "default_name": "Successor Trustee Instrument.pdf", "size": "1.4 MB"},
        "claims": succession_claims,
        "changeset": {"id": "cs_succession", "title": "Successor Trustee Activation", "authority": "Trust Agreement, Article VII §3.2",
                      "changes": [
                          {"id": "ch1", "type": "PERSON", "label": "Robert Harrington — trustee role", "before": "CURRENT", "after": "INACTIVE", "impact": "HIGH"},
                          {"id": "ch2", "type": "PERSON", "label": "Maya Harrington — trustee role", "before": "STANDBY", "after": "CURRENT", "impact": "HIGH"},
                          {"id": "ch3", "type": "STATE", "label": "Governed checkpoint", "before": "v2.0", "after": "v3.0", "impact": "MEDIUM"}],
                      "consequences": ["Establishes a new governed state (v3.0).", "Creates an obligation to notify affected beneficiaries.", "Prior state (v2.0) becomes SUPERSEDED — not overwritten."]},
        "apply": apply_succession,
    },
    MOR: {
        "source": {"id": "msrc_dist", "type": "Distribution Instrument", "default_name": "Distribution Request & Trustee Resolution.pdf", "size": "1.2 MB"},
        "claims": distribution_claims,
        "changeset": {"id": "cs_distribution", "title": "Discretionary Distribution Approval", "authority": "Trust Agreement, Article V §2.4",
                      "changes": [
                          {"id": "ch1", "type": "ASSET", "label": "Cash & Money Market — balance", "before": "$720,000", "after": "$470,000", "impact": "HIGH"},
                          {"id": "ch2", "type": "PERSON", "label": "Daniel Morgan — distribution", "before": "NONE PENDING", "after": "$250,000 APPROVED", "impact": "HIGH"},
                          {"id": "ch3", "type": "STATE", "label": "Governed checkpoint", "before": "v4.0", "after": "v5.0", "impact": "MEDIUM"}],
                      "consequences": ["Establishes a new governed state (v5.0).", "Creates an obligation to document rationale and notify the beneficiary.", "Prior state (v4.0) becomes SUPERSEDED — not overwritten."]},
        "apply": apply_distribution,
    },
}

EXTRA_BOOK = [
    {"id": "ATL-CAR-00789", "name": "Carter Living Trust", "officer": "Angela Ruiz", "status": "ACTIVE", "checkpoint": "v3.0", "health": "NEEDS_ATTENTION", "days_flag": 6, "reason": "Overdue obligation: beneficiary notice.", "primary": False, "navigable": False},
    {"id": "ATL-DAV-00321", "name": "Davis Family Trust", "officer": "Angela Ruiz", "status": "ACTIVE", "checkpoint": "v2.0", "health": "NEEDS_ATTENTION", "days_flag": 8, "reason": "ChangeSet requires review.", "primary": False, "navigable": False},
    {"id": "ATL-BEL-00654", "name": "Bellamy Marital Trust", "officer": "James Morgan", "status": "ACTIVE", "checkpoint": "v4.0", "health": "ON_TRACK", "days_flag": 0, "reason": "Operations within governance parameters.", "primary": False, "navigable": False},
    {"id": "ATL-WIN-00988", "name": "Winslow Charitable Trust", "officer": "Marcus Ford", "status": "ACTIVE", "checkpoint": "v6.0", "health": "ESCALATED", "days_flag": 12, "reason": "Pending evidence beyond expected window.", "primary": False, "navigable": False},
]


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
async def get_doc(mid):
    return await db.matters.find_one({"_id": mid})


async def save_doc(doc):
    doc["_id"] = doc["matter_id"]
    await db.matters.replace_one({"_id": doc["matter_id"]}, doc, upsert=True)


async def ensure_seed():
    for mid, fn in SEEDERS.items():
        if not await db.matters.find_one({"_id": mid}):
            await save_doc(fn())


def strip(doc):
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


def featured_ob(doc):
    conseq = [e["id"] for e in doc["events"] if e["kind"] == "CONSEQUENTIAL"]
    for o in doc["obligations"]:
        if o.get("created_by") in conseq and o["status"] != "SATISFIED":
            return o
    return None


def matter_summary(doc):
    ob = featured_ob(doc)
    cur = next((s for s in doc["states"] if s["status"] == "CURRENT"), doc["states"][-1])
    if ob:
        if ob.get("status") == "ESCALATED":
            health = "ESCALATED"
        else:
            health = ob.get("severity", "NEEDS_ATTENTION")
        reason = ob["title"]
        days = ob.get("days_open", 0)
    else:
        health, reason, days = "ON_TRACK", "Operations within governance parameters.", 0
    return {"id": doc["matter_id"], "name": doc["name"], "short": doc.get("short"), "officer": doc["officer"],
            "status": doc["status"], "checkpoint": cur["version"], "health": health, "days_flag": days,
            "reason": reason, "primary": doc["matter_id"] == HAR, "navigable": True,
            "people": len(doc["people"]), "matter_type": doc["matter_type"]}


async def resolve_featured(doc, comm_summary, comm_type="Beneficiary Communication", to_person=None):
    ob = featured_ob(doc)
    if not ob:
        raise HTTPException(400, "No open obligation to resolve.")
    ob["status"] = "SATISFIED"
    ob["completion_evidence"] = comm_summary
    ob.setdefault("history", []).append({"time": now_iso(), "actor": doc["officer"], "action": f"{comm_type} sent; completion evidence attached. Obligation satisfied."})
    doc["flow"]["obligation_resolved"] = True
    # bump state
    for s in doc["states"]:
        if s["status"] == "CURRENT":
            s["status"] = "SUPERSEDED"
    cur = doc["states"][-1]
    nv = next_version(doc["states"])
    new_state = {"version": nv, "status": "CURRENT", "title": f"{comm_type} Completed", "trustee": cur["trustee"], "trustee_status": "CURRENT",
                 "effective_time": today(), "recorded_time": today(), "verified_time": today(), "released_time": today(),
                 "summary": f"{comm_type} delivered and completion evidence recorded. Relationship state updated.", "authority": "Fiduciary conduct record; completion evidence."}
    doc["states"].append(new_state)
    doc["events"].append({"id": f"evt_comm_{nv}", "kind": "STATE_RELEASE", "title": f"{comm_type} Completed", "date": today(), "state_version": nv, "summary": "Obligation satisfied. Oversight exception closed and Matter Timeline updated.", "icon": "check"})
    comm = {"id": f"comm_{len(doc.get('communications', [])) + 1}", "to": to_person or "Affected beneficiaries", "type": comm_type, "date": today(), "status": "SENT", "summary": comm_summary}
    doc.setdefault("communications", []).append(comm)
    doc["evidence_instruments"].append({"id": f"ev_{nv}", "matter_id": doc["matter_id"], "instrument_id": f"{doc['matter_id']}-EV-{nv.replace('.', '')}", "title": f"{comm_type} — Completion Evidence", "state_version": nv, "lifecycle": "RELEASED", "checkpoint_time": today(), "hash": "C0DE-" + nv.replace(".", "") + "-A1B2-9F7E", "verification_class": "Human-verified · Source-linked", "prev_state": cur["version"], "successor_state": "—", "transition_type": comm_type, "sources": [f"{comm_type} letter", "Trustee record"]})
    return ob, comm


# ---------------------------------------------------------------------------
# models
# ---------------------------------------------------------------------------
class MargaretQuery(BaseModel):
    audience: str
    prompt: str
    matter_id: str | None = None


class ElicitedContext(BaseModel):
    person: str
    text: str


class ObligationAction(BaseModel):
    action: str
    note: str | None = None
    assignee: str | None = None


class SendComm(BaseModel):
    to: str | None = None
    type: str | None = None
    summary: str | None = None


# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------
@api.get("/health")
async def health():
    return {"status": "ok", "product": "18th Green Atlas", "time": now_iso()}


@api.get("/matters")
async def list_matters():
    await ensure_seed()
    out = []
    for mid in NAVIGABLE:
        out.append(matter_summary(await get_doc(mid)))
    return {"matters": out}


@api.get("/matter")
async def get_matter(matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    if not doc:
        raise HTTPException(404, "Matter not found.")
    return strip(doc)


@api.get("/portfolio")
async def get_portfolio():
    await ensure_seed()
    nav = [matter_summary(await get_doc(mid)) for mid in NAVIGABLE]
    book = nav + EXTRA_BOOK
    attention = [m for m in book if m["health"] in ("NEEDS_ATTENTION", "EXCEPTION", "ESCALATED")]
    attention.sort(key=lambda m: m["days_flag"], reverse=True)
    summary = {
        "trusts": len(book),
        "on_track": sum(1 for m in book if m["health"] == "ON_TRACK"),
        "needs_attention": sum(1 for m in book if m["health"] == "NEEDS_ATTENTION"),
        "exception": sum(1 for m in book if m["health"] == "EXCEPTION"),
        "escalated": sum(1 for m in book if m["health"] == "ESCALATED"),
        "obligations": 37, "evidence_items": 94,
    }
    return {"portfolio": book, "attention": attention, "summary": summary,
            "harrington_flagged": any(m["id"] == HAR and m["health"] != "ON_TRACK" for m in nav)}


def _stage(ev, ob, resolved):
    if not ev:
        return "No consequential change yet"
    if resolved:
        return "Closed — communication recorded"
    if ob["status"] == "ESCALATED":
        return "Escalated — awaiting fiduciary resolution"
    return "Open — post-transition obligation pending"


def matter_ops(doc):
    ob = featured_ob(doc)
    ev = next((e for e in reversed(doc["events"]) if e["kind"] == "CONSEQUENTIAL"), None)
    cur = next((s for s in doc["states"] if s["status"] == "CURRENT"), doc["states"][-1])
    resolved = ev is not None and ob is None
    ob_status = ob["status"] if ob else ("SATISFIED" if resolved else "NONE")
    return {"id": doc["matter_id"], "name": doc["name"], "officer": doc["officer"], "checkpoint": cur["version"],
            "event": ev["title"] if ev else "—", "transition": f"{ev['transition']['from']} → {ev['transition']['to']}" if ev else "—",
            "obligation": ob["title"] if ob else ("Satisfied" if resolved else "—"), "obligation_status": ob_status,
            "severity": ob.get("severity", "—") if ob else "—", "days_open": ob.get("days_open", 0) if ob else 0,
            "stage": _stage(ev, ob, resolved), "comms": len(doc.get("communications", [])),
            "escalated": bool(doc["flow"].get("obligation_escalated")), "resolved": resolved, "active": ev is not None}


def _matter_pattern(h, m, both_active):
    if not both_active:
        return {"kind": "MATTER", "label": "Matter-specific", "signal": "INSUFFICIENT", "evidence": [],
                "reading": "Only one Matter has a consequential transition in the window — Matter-specific comparison requires both."}
    return {"kind": "MATTER", "label": "Matter-specific", "signal": "DIFFERENTIATED",
            "evidence": [f"Harrington · {h['event']} · {h['severity']}", f"Morgan · {m['event']} · {m['severity']}"],
            "reading": "Exception drivers differ by Matter: Harrington's obligation is a notice deadline after a trustee succession; Morgan's is a rationale-documentation exception after a discretionary distribution flagged by portfolio intelligence. Severity is set by the Matter's own transition type, not by who operates it."}


def _officer_pattern(h, m, both_open):
    same_officer = h["officer"] == m["officer"]
    evidence = [f"Harrington · {h['obligation_status']} · {h['days_open']}d", f"Morgan · {m['obligation_status']} · {m['days_open']}d"]
    if not same_officer:
        reading = "Different officers — delays cannot be attributed to a single desk."
    elif both_open:
        reading = f"Both open obligations sit with the same officer ({h['officer']}). Concurrent open items on one desk is a workload signal — attention belongs with the officer's queue, not the Matters."
    else:
        reading = f"Both Matters share an officer ({h['officer']}), but at least one loop is closed. No concurrent-load signal at this time."
    return {"kind": "OFFICER", "label": "Officer-specific", "reading": reading, "evidence": evidence,
            "signal": "PRESENT" if both_open and same_officer else "NOT PRESENT"}


def _process_pattern(h, m, both_active, both_open):
    evidence = [f"Harrington · {h['stage']}", f"Morgan · {m['stage']}"]
    if both_open:
        return {"kind": "PROCESS", "label": "Process-specific", "signal": "PRESENT", "evidence": evidence,
                "reading": "The delay recurs at the same step on both Matters — the post-transition obligation that requires a beneficiary communication. A step that lags regardless of Matter or transition type points to process design, not conduct."}
    if both_active and (h["resolved"] or m["resolved"]):
        return {"kind": "PROCESS", "label": "Process-specific", "signal": "PARTIAL", "evidence": evidence,
                "reading": "Closed loops show the post-transition communication step completing once escalated — consistent with a process that depends on supervisory prompting."}
    return {"kind": "PROCESS", "label": "Process-specific", "signal": "NOT PRESENT", "evidence": evidence,
            "reading": "No repeated step-level delay observed across Matters yet."}


def portfolio_patterns(h, m):
    both_active = h["active"] and m["active"]
    both_open = both_active and not h["resolved"] and not m["resolved"]
    return [_matter_pattern(h, m, both_active), _officer_pattern(h, m, both_open), _process_pattern(h, m, both_active, both_open)]


@api.get("/intelligence")
async def get_intelligence():
    await ensure_seed()
    h = matter_ops(await get_doc(HAR))
    m = matter_ops(await get_doc(MOR))
    return {"class": "DERIVED", "basis": "Authorized operational metadata only — obligation lifecycle, transition type, officer assignment, communication record. No document content, no beneficiary data.",
            "matters": [h, m], "patterns": portfolio_patterns(h, m), "generated": now_iso()}


@api.post("/upload-source")
async def upload_source(matter_id: str = Query(HAR), file: UploadFile = File(None), filename: str = Form(None)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    script = SCRIPTS.get(matter_id)
    if not doc or not script:
        raise HTTPException(404, "Matter not found or not interactive.")
    sdef = script["source"]
    name = (file.filename if file else None) or filename or sdef["default_name"]
    src = {"id": sdef["id"], "name": name, "type": sdef["type"], "status": "PENDING_VERIFICATION", "uploaded": today(), "size": sdef["size"], "new": True}
    doc["sources"] = [s for s in doc["sources"] if s["id"] != sdef["id"]] + [src]
    doc["claims"] = script["claims"]()
    doc["flow"]["source_uploaded"] = True
    doc["flow"]["claims_verified"] = False
    await save_doc(doc)
    return {"source": src, "claims": doc["claims"]}


@api.post("/verify-claims")
async def verify_claims(matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    if not doc["flow"]["source_uploaded"]:
        raise HTTPException(400, "No source uploaded yet.")
    src_id = SCRIPTS[matter_id]["source"]["id"]
    for c in doc["claims"]:
        c["status"] = "VERIFIED"
    for s in doc["sources"]:
        if s["id"] == src_id:
            s["status"] = "VERIFIED"
    doc["flow"]["claims_verified"] = True
    await save_doc(doc)
    return {"claims": doc["claims"]}


@api.post("/create-changeset")
async def create_changeset(matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    if not doc["flow"]["claims_verified"]:
        raise HTTPException(400, "Claims must be verified first.")
    cs = {**SCRIPTS[matter_id]["changeset"], "status": "PROPOSED", "created": today(), "open_items": 0}
    doc["changesets"] = [c for c in doc["changesets"] if c["id"] != cs["id"]] + [cs]
    doc["flow"]["changeset_created"] = True
    await save_doc(doc)
    return {"changeset": cs}


@api.post("/approve-changeset")
async def approve_changeset(matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    if not doc["flow"]["changeset_created"]:
        raise HTTPException(400, "ChangeSet must be created first.")
    if doc["flow"]["changeset_approved"]:
        return {"already": True}
    script = SCRIPTS[matter_id]
    for s in doc["states"]:
        if s["status"] == "CURRENT":
            s["status"] = "SUPERSEDED"
    for c in doc["changesets"]:
        if c["id"] == script["changeset"]["id"]:
            c["status"] = "APPROVED"
    new_state, event = script["apply"](doc)
    doc["flow"]["changeset_approved"] = True
    await save_doc(doc)
    return {"state": new_state, "event": event}


@api.post("/obligations/{ob_id}/action")
async def obligation_action(ob_id: str, body: ObligationAction, matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    ob = next((o for o in doc["obligations"] if o["id"] == ob_id), None)
    if not ob:
        raise HTTPException(404, "Obligation not found.")
    ob.setdefault("history", [])
    act = body.action.lower()
    if act == "escalate":
        ob["status"] = "ESCALATED"
        doc["flow"]["obligation_escalated"] = True
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": "Escalated to fiduciary officer for resolution." + (f" Note: {body.note}" if body.note else "")})
        await save_doc(doc)
    elif act == "assign":
        ob["owner"] = body.assignee or ob["owner"]
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": f"Assigned to {ob['owner']}."})
        await save_doc(doc)
    elif act == "acknowledge":
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": "Acknowledged; monitoring."})
        await save_doc(doc)
    elif act == "resolve":
        await resolve_featured(doc, "Communication delivered and recorded.", "Beneficiary Notice", None)
        await save_doc(doc)
    else:
        raise HTTPException(400, "Unknown action.")
    return {"obligation": next((o for o in doc["obligations"] if o["id"] == ob_id), ob)}


@api.post("/communications/send")
async def send_communication(body: SendComm, matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    ob = featured_ob(doc)
    ctype = body.type or ("Beneficiary Notice" if matter_id == HAR else "Distribution Explanation")
    summ = body.summary or (f"{ctype} delivered to affected beneficiaries with source-linked explanation.")
    resolved_ob, comm = await resolve_featured(doc, summ, ctype, body.to)
    await save_doc(doc)
    return {"communication": comm, "obligation": resolved_ob}


@api.post("/elicited-context")
async def elicited_context(body: ElicitedContext, matter_id: str = Query(HAR)):
    await ensure_seed()
    doc = await get_doc(matter_id)
    entry = {"id": f"ec_{len(doc['elicited_context']) + 1}", "person": body.person, "text": body.text, "class": "ELICITED_CONTEXT", "status": "REQUIRES_REVIEW", "time": now_iso(), "note": "Stored as elicited context. Does not change governed state unless verified."}
    doc["elicited_context"].append(entry)
    await save_doc(doc)
    return {"entry": entry}


def margaret_reply(audience, prompt, doc):
    p = (prompt or "").lower()
    a = audience.lower()
    cur = next((s for s in doc["states"] if s["status"] == "CURRENT"), doc["states"][-1])
    trustee = cur["trustee"]
    if a == "beneficiary":
        base = f"The current governed checkpoint is {cur['version']}. " + (f"{trustee} is serving as trustee. " if trustee else "")
        return {"text": base + "Your beneficiary status did not change, and any action needed is shown on your relationship home.",
                "sources": [f"Governed State {cur['version']}", "Beneficiary R.A.C. (current)"],
                "elicit": f"Your trustee is {trustee} and your beneficiary status did not change. Does this match how you understood the change?"}
    if a == "oversight":
        ob = featured_ob(doc)
        if ob:
            return {"text": f"{doc['name']} surfaced because the obligation '{ob['title']}' remains open. Most exceptions in this portfolio followed consequential transitions.",
                    "sources": ["Attention Queue", "Oversight R.A.C.", f"Obligation: {ob['title']}"],
                    "elicit": "Would you like to compare similar Matters to determine whether the delay is officer-specific or process-specific?"}
        return {"text": f"{doc['name']} currently has no open exceptions.", "sources": ["Portfolio"], "elicit": None}
    ob = featured_ob(doc)
    remaining = f" One obligation is open: {ob['title']} (due {ob['due']})." if ob else " No open obligations."
    return {"text": f"The current governed checkpoint is {cur['version']}." + remaining + " All supporting evidence is source-linked and verified.",
            "sources": [f"Governed State {cur['version']}", "Fiduciary R.A.C."], "elicit": "Would you like to open the Communication Hub to resolve the open obligation?"}


@api.post("/margaret")
async def ask_margaret(body: MargaretQuery):
    await ensure_seed()
    doc = await get_doc(body.matter_id or HAR)
    return margaret_reply(body.audience, body.prompt, doc)


@api.post("/reset")
async def reset_demo():
    for mid, fn in SEEDERS.items():
        await save_doc(fn())
    return {"status": "reset", "matters": NAVIGABLE}


app.include_router(api)


@app.on_event("startup")
async def startup():
    await ensure_seed()


@app.on_event("shutdown")
async def shutdown():
    client.close()
