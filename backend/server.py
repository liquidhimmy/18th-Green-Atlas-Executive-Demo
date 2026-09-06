import os
import copy
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MATTER_ID = "ATL-HAR-00217"

# ---------------------------------------------------------------------------
# SEED — the canonical Harrington Family Estate demo dataset
# ---------------------------------------------------------------------------

def now_iso():
    return datetime.now(timezone.utc).isoformat()


def build_seed():
    people = [
        {"id": "p_linda", "name": "Linda Harrington", "role": "Grantor / Settlor",
         "lens_role": "grantor", "status": "DECEASED", "since": "1987", "initials": "LH",
         "detail": "Established the Harrington Family Revocable Living Trust in 1987."},
        {"id": "p_robert", "name": "Robert Harrington", "role": "Original Trustee",
         "lens_role": "trustee", "status": "CURRENT", "since": "2009", "initials": "RH",
         "detail": "Serving trustee under the original instrument. Subject of the pending succession."},
        {"id": "p_maya", "name": "Maya Harrington", "role": "Successor Trustee",
         "lens_role": "successor", "status": "STANDBY", "since": "2019", "initials": "MH",
         "detail": "Named successor trustee under Trust Agreement, Article VII §3.2."},
        {"id": "p_sarah", "name": "Sarah Harrington", "role": "Primary Beneficiary",
         "lens_role": "beneficiary", "status": "CURRENT", "since": "1994", "initials": "SH",
         "detail": "Primary income beneficiary of the marital trust."},
        {"id": "p_michael", "name": "Michael Harrington", "role": "Beneficiary",
         "lens_role": "beneficiary", "status": "CURRENT", "since": "1996", "initials": "MH",
         "detail": "Remainder beneficiary."},
        {"id": "p_grace", "name": "Grace Harrington", "role": "Beneficiary",
         "lens_role": "beneficiary", "status": "CURRENT", "since": "2001", "initials": "GH",
         "detail": "Remainder beneficiary."},
        {"id": "p_emily", "name": "Emily Harrington", "role": "Contingent Beneficiary (minor)",
         "lens_role": "beneficiary", "status": "CONTINGENT", "since": "2014", "initials": "EH",
         "detail": "Contingent beneficiary; distributions held per HEMS standard."},
        {"id": "p_robertjr", "name": "Robert Harrington Jr.", "role": "Contingent Beneficiary",
         "lens_role": "beneficiary", "status": "CONTINGENT", "since": "1998", "initials": "RJ",
         "detail": "Contingent remainder beneficiary."},
        {"id": "p_james", "name": "James Morgan", "role": "Fiduciary Officer",
         "lens_role": "officer", "status": "ASSIGNED", "since": "2021", "initials": "JM",
         "detail": "Assigned trust officer operating this Matter."},
        {"id": "p_patricia", "name": "Patricia Vance", "role": "Oversight Supervisor",
         "lens_role": "oversight", "status": "ASSIGNED", "since": "2020", "initials": "PV",
         "detail": "Portfolio supervisor responsible for exception review."},
        {"id": "p_david", "name": "David Chen", "role": "Wealth Advisor",
         "lens_role": "advisor", "status": "ADVISORY", "since": "2018", "initials": "DC",
         "detail": "External advisor coordinating investment strategy."},
        {"id": "p_thomas", "name": "Thomas Reed", "role": "Legal Counsel",
         "lens_role": "counsel", "status": "ADVISORY", "since": "2016", "initials": "TR",
         "detail": "Outside counsel for the trust."},
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
        {"version": "v1.0", "status": "SUPERSEDED", "title": "Original Relationship Established",
         "trustee": "Robert Harrington", "trustee_status": "CURRENT",
         "effective_time": "2009-03-15", "recorded_time": "2009-03-20", "verified_time": "2009-03-22", "released_time": "2009-03-22",
         "summary": "Original governing instrument established. Robert Harrington confirmed as trustee.",
         "authority": "Trust Agreement, Article II §1.1"},
        {"version": "v2.0", "status": "CURRENT", "title": "Third Amendment Incorporated",
         "trustee": "Robert Harrington", "trustee_status": "CURRENT",
         "effective_time": "2022-09-01", "recorded_time": "2022-09-20", "verified_time": "2022-09-22", "released_time": "2022-09-22",
         "summary": "Third Amendment incorporated, refining contingent distribution language. Robert Harrington remains trustee.",
         "authority": "Third Amendment to Trust, executed 2022-09-01"},
    ]

    # Historical sources (already governed)
    sources = [
        {"id": "src_trust", "name": "Trust Agreement.pdf", "type": "Governing Instrument", "status": "VERIFIED",
         "uploaded": "2009-03-20", "size": "3.1 MB"},
        {"id": "src_amend", "name": "Third Amendment 2022.pdf", "type": "Amendment", "status": "VERIFIED",
         "uploaded": "2022-09-20", "size": "1.1 MB"},
        {"id": "src_schedule", "name": "Schedule A - Assets.pdf", "type": "Schedule", "status": "VERIFIED",
         "uploaded": "2022-09-20", "size": "854 KB"},
    ]

    # Historical timeline / consequential events (already governed)
    events = [
        {"id": "evt_v1", "kind": "STATE_RELEASE", "title": "Original Relationship Established",
         "date": "2009-03-22", "state_version": "v1.0", "summary": "Harrington Family Revocable Living Trust established and governed.",
         "icon": "landmark"},
        {"id": "evt_v2", "kind": "STATE_RELEASE", "title": "Third Amendment Incorporated",
         "date": "2022-09-22", "state_version": "v2.0", "summary": "Amendment reviewed, verified, and released as governed state.",
         "icon": "file-text"},
    ]

    # Existing (non-succession) obligations for realistic counts
    obligations = [
        {"id": "ob_annual", "title": "Annual accounting to beneficiaries", "owner": "James Morgan",
         "status": "ON_TRACK", "due": "2026-12-31", "created_by": "evt_v2",
         "detail": "Prepare and deliver the annual fiduciary accounting.", "lens": "fiduciary"},
        {"id": "ob_tax", "title": "File fiduciary income tax return (Form 1041)", "owner": "James Morgan",
         "status": "ON_TRACK", "due": "2026-04-15", "created_by": "evt_v2",
         "detail": "Coordinate with tax preparer and file the trust return.", "lens": "fiduciary"},
        {"id": "ob_review", "title": "Investment policy statement review", "owner": "David Chen",
         "status": "UPCOMING", "due": "2026-07-30", "created_by": "evt_v2",
         "detail": "Periodic review of investment allocation vs. policy.", "lens": "fiduciary"},
    ]

    portfolio = [
        {"id": MATTER_ID, "name": "Harrington Family Estate", "officer": "James Morgan",
         "status": "ACTIVE", "checkpoint": "v2.0", "health": "ON_TRACK", "days_flag": 0,
         "reason": "Operations within governance parameters.", "primary": True},
        {"id": "ATL-MOR-00456", "name": "Morgan Family Trust", "officer": "James Morgan",
         "status": "ACTIVE", "checkpoint": "v5.0", "health": "EXCEPTION", "days_flag": 4,
         "reason": "Unusual distribution pattern detected.", "primary": False},
        {"id": "ATL-CAR-00789", "name": "Carter Living Trust", "officer": "Angela Ruiz",
         "status": "ACTIVE", "checkpoint": "v3.0", "health": "NEEDS_ATTENTION", "days_flag": 6,
         "reason": "Overdue obligation: beneficiary notice.", "primary": False},
        {"id": "ATL-DAV-00321", "name": "Davis Family Trust", "officer": "Angela Ruiz",
         "status": "ACTIVE", "checkpoint": "v2.0", "health": "NEEDS_ATTENTION", "days_flag": 8,
         "reason": "ChangeSet requires review.", "primary": False},
        {"id": "ATL-BEL-00654", "name": "Bellamy Marital Trust", "officer": "James Morgan",
         "status": "ACTIVE", "checkpoint": "v4.0", "health": "ON_TRACK", "days_flag": 0,
         "reason": "Operations within governance parameters.", "primary": False},
        {"id": "ATL-WIN-00988", "name": "Winslow Charitable Trust", "officer": "Marcus Ford",
         "status": "ACTIVE", "checkpoint": "v6.0", "health": "ESCALATED", "days_flag": 12,
         "reason": "Pending evidence beyond expected window.", "primary": False},
    ]

    return {
        "matter_id": MATTER_ID,
        "name": "Harrington Family Estate",
        "status": "ACTIVE",
        "matter_type": "Revocable Living Trust",
        "jurisdiction": "Georgia, USA",
        "officer": "James Morgan",
        "established": "1987",
        "tagline": "Generations are linked by more than assets — they're bound by responsibility.",
        "people": people,
        "structures": structures,
        "assets": assets,
        "states": states,
        "sources": sources,
        "claims": [],
        "changesets": [],
        "events": events,
        "obligations": obligations,
        "beneficiary_impacts": [],
        "rac": [],
        "evidence_instruments": [
            {"id": "ev_v2", "matter_id": MATTER_ID, "instrument_id": "ATL-HAR-00217-EV-0002",
             "title": "Third Amendment — Governed Checkpoint", "state_version": "v2.0",
             "lifecycle": "RELEASED", "checkpoint_time": "2022-09-22", "hash": "9F2C-71AB-04E7-D1C6",
             "verification_class": "Human-verified · Source-linked", "prev_state": "v1.0", "successor_state": "—",
             "transition_type": "Amendment incorporation",
             "sources": ["Third Amendment 2022.pdf", "Schedule A - Assets.pdf"]},
        ],
        "elicited_context": [],
        "portfolio": portfolio,
        "flow": {
            "source_uploaded": False,
            "claims_verified": False,
            "changeset_created": False,
            "changeset_approved": False,
            "obligation_escalated": False,
            "obligation_resolved": False,
        },
    }


# The scripted claims extracted from the newly uploaded succession source
def succession_claims():
    return [
        {"id": "cl_condition", "field": "Successor Condition", "observed": "Successor-trustee condition satisfied",
         "authority": "Trust Agreement, Article VII §3.2", "kind": "authority", "status": "OBSERVED",
         "confidence": 0.97, "note": "AI observation — requires human verification."},
        {"id": "cl_robert", "field": "Robert Harrington", "observed": "CURRENT → INACTIVE",
         "authority": "Trust Agreement, Article VII §3.2", "kind": "person", "status": "OBSERVED",
         "confidence": 0.96, "note": "Outgoing trustee role change proposed."},
        {"id": "cl_maya", "field": "Maya Harrington", "observed": "STANDBY → CURRENT",
         "authority": "Trust Agreement, Article VII §3.2", "kind": "person", "status": "OBSERVED",
         "confidence": 0.96, "note": "Successor trustee activation proposed."},
        {"id": "cl_effective", "field": "Effective Date", "observed": "2026-06-01",
         "authority": "Successor Acceptance & Resignation Instrument", "kind": "date", "status": "OBSERVED",
         "confidence": 0.94, "note": "Effective time distinct from recorded time."},
    ]


async def get_state():
    doc = await db.demo.find_one({"_id": MATTER_ID})
    return doc


async def save_state(doc):
    doc["_id"] = MATTER_ID
    await db.demo.replace_one({"_id": MATTER_ID}, doc, upsert=True)


async def ensure_seed():
    existing = await db.demo.find_one({"_id": MATTER_ID})
    if not existing:
        await save_state(build_seed())


def strip(doc):
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class MargaretQuery(BaseModel):
    audience: str
    prompt: str


class ElicitedContext(BaseModel):
    person: str
    text: str


class ObligationAction(BaseModel):
    action: str  # escalate | assign | acknowledge | resolve
    note: str | None = None
    assignee: str | None = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api.get("/health")
async def health():
    return {"status": "ok", "product": "18th Green Atlas", "time": now_iso()}


@api.get("/matter")
async def get_matter():
    await ensure_seed()
    doc = await get_state()
    return strip(doc)


@api.get("/portfolio")
async def get_portfolio():
    await ensure_seed()
    doc = await get_state()
    # attention items derived from open succession obligation + seeded book
    attention = []
    for m in doc["portfolio"]:
        if m["health"] in ("EXCEPTION", "NEEDS_ATTENTION", "ESCALATED") or (m["primary"] and _harrington_flagged(doc)):
            item = dict(m)
            if m["primary"] and _harrington_flagged(doc):
                item["health"] = "NEEDS_ATTENTION" if not doc["flow"]["obligation_escalated"] else "ESCALATED"
                item["days_flag"] = 3
                item["reason"] = "Beneficiary notice obligation open beyond expected window."
            attention.append(item)
    summary = {
        "trusts": len(doc["portfolio"]),
        "on_track": sum(1 for m in doc["portfolio"] if m["health"] == "ON_TRACK") - (1 if _harrington_flagged(doc) else 0),
        "needs_attention": sum(1 for m in attention if m["health"] == "NEEDS_ATTENTION"),
        "exception": sum(1 for m in attention if m["health"] == "EXCEPTION"),
        "escalated": sum(1 for m in attention if m["health"] == "ESCALATED"),
        "obligations": 37,
        "evidence_items": 94,
    }
    return {"portfolio": doc["portfolio"], "attention": attention, "summary": summary,
            "harrington_flagged": _harrington_flagged(doc)}


def _harrington_flagged(doc):
    return doc["flow"]["changeset_approved"] and not doc["flow"]["obligation_resolved"]


@api.post("/upload-source")
async def upload_source(file: UploadFile = File(None), filename: str = Form(None)):
    await ensure_seed()
    doc = await get_state()
    name = (file.filename if file else None) or filename or "Successor Trustee Instrument.pdf"
    src = {
        "id": "src_succession",
        "name": name,
        "type": "Successor Acceptance & Resignation Instrument",
        "status": "PENDING_VERIFICATION",
        "uploaded": now_iso()[:10],
        "size": "1.4 MB",
        "new": True,
    }
    doc["sources"] = [s for s in doc["sources"] if s["id"] != "src_succession"] + [src]
    doc["claims"] = succession_claims()
    doc["flow"]["source_uploaded"] = True
    doc["flow"]["claims_verified"] = False
    await save_state(doc)
    return {"source": src, "claims": doc["claims"]}


@api.post("/verify-claims")
async def verify_claims():
    await ensure_seed()
    doc = await get_state()
    if not doc or not doc["flow"]["source_uploaded"]:
        raise HTTPException(400, "No source uploaded yet.")
    for c in doc["claims"]:
        c["status"] = "VERIFIED"
    for s in doc["sources"]:
        if s["id"] == "src_succession":
            s["status"] = "VERIFIED"
    doc["flow"]["claims_verified"] = True
    await save_state(doc)
    return {"claims": doc["claims"]}


@api.post("/create-changeset")
async def create_changeset():
    await ensure_seed()
    doc = await get_state()
    if not doc or not doc["flow"]["claims_verified"]:
        raise HTTPException(400, "Claims must be verified first.")
    cs = {
        "id": "cs_succession",
        "title": "Successor Trustee Activation",
        "status": "PROPOSED",
        "created": now_iso()[:10],
        "authority": "Trust Agreement, Article VII §3.2",
        "changes": [
            {"id": "ch1", "type": "PERSON", "label": "Robert Harrington — trustee role", "before": "CURRENT", "after": "INACTIVE", "impact": "HIGH"},
            {"id": "ch2", "type": "PERSON", "label": "Maya Harrington — trustee role", "before": "STANDBY", "after": "CURRENT", "impact": "HIGH"},
            {"id": "ch3", "type": "STATE", "label": "Governed checkpoint", "before": "v2.0", "after": "v3.0", "impact": "MEDIUM"},
        ],
        "consequences": [
            "Establishes a new governed state (v3.0).",
            "Creates an obligation to notify affected beneficiaries.",
            "Prior state (v2.0) becomes SUPERSEDED — not overwritten.",
        ],
        "open_items": 0,
    }
    doc["changesets"] = [c for c in doc["changesets"] if c["id"] != "cs_succession"] + [cs]
    doc["flow"]["changeset_created"] = True
    await save_state(doc)
    return {"changeset": cs}


@api.post("/approve-changeset")
async def approve_changeset():
    await ensure_seed()
    doc = await get_state()
    if not doc or not doc["flow"]["changeset_created"]:
        raise HTTPException(400, "ChangeSet must be created first.")
    if doc["flow"]["changeset_approved"]:
        return {"already": True}

    # supersede current
    for s in doc["states"]:
        if s["status"] == "CURRENT":
            s["status"] = "SUPERSEDED"

    v3 = {
        "version": "v3.0", "status": "CURRENT", "title": "Successor Trustee Activated",
        "trustee": "Maya Harrington", "trustee_status": "CURRENT",
        "effective_time": "2026-06-01", "recorded_time": now_iso()[:10],
        "verified_time": now_iso()[:10], "released_time": now_iso()[:10],
        "summary": "Successor-trustee condition satisfied and verified. Maya Harrington activated as current trustee; Robert Harrington moved to inactive.",
        "authority": "Trust Agreement, Article VII §3.2",
    }
    doc["states"].append(v3)

    # update people
    for p in doc["people"]:
        if p["id"] == "p_robert":
            p["status"] = "INACTIVE"
            p["role"] = "Former Trustee"
        if p["id"] == "p_maya":
            p["status"] = "CURRENT"
            p["role"] = "Current Trustee"

    for c in doc["changesets"]:
        if c["id"] == "cs_succession":
            c["status"] = "APPROVED"

    # consequential event
    event = {
        "id": "evt_succession", "kind": "CONSEQUENTIAL", "title": "Successor Trustee Activation",
        "date": now_iso()[:10], "state_version": "v3.0",
        "summary": "Trustee succession represented as one consequential event linking source, verification, state transition, conduct, obligation, and beneficiary impact.",
        "icon": "refresh",
        "trigger": "Successor-trustee condition satisfied.",
        "authority": "Trust Agreement, Article VII §3.2",
        "source": "Successor Acceptance & Resignation Instrument",
        "verification": "James Morgan verified claims against source authority.",
        "transition": {"from": "v2.0", "to": "v3.0",
                       "changes": ["Robert Harrington: CURRENT → INACTIVE", "Maya Harrington: STANDBY → CURRENT"]},
        "conduct": "Fiduciary officer reviewed and confirmed succession documentation.",
        "obligation": "ob_notice",
        "beneficiary_impact": "bi_sarah",
        "evidence": "ev_v3",
        "effective_time": "2026-06-01", "recorded_time": now_iso()[:10], "verified_time": now_iso()[:10], "released_time": now_iso()[:10],
    }
    doc["events"].append(event)

    # obligation created
    obligation = {
        "id": "ob_notice", "title": "Notify affected beneficiaries of trustee succession",
        "owner": "James Morgan", "status": "OPEN", "due": "2026-06-08", "created_by": "evt_succession",
        "detail": "Deliver formal notice of trustee change to affected beneficiaries and record completion evidence.",
        "lens": "fiduciary", "days_open": 3, "history": [
            {"time": now_iso(), "actor": "System", "action": "Obligation created from Successor Trustee Activation."}]}
    doc["obligations"] = [o for o in doc["obligations"] if o["id"] != "ob_notice"] + [obligation]

    # beneficiary impact
    bi = {
        "id": "bi_sarah", "matter_id": MATTER_ID, "person_id": "p_sarah", "transition_id": "v2.0->v3.0",
        "impact_status": "INFORMATIONAL",
        "what_changed": "Maya Harrington is now serving as your trustee.",
        "what_did_not_change": "Your beneficiary status and distribution rights are unchanged.",
        "what_it_means": "Day-to-day administration of the trust continues under a new trustee.",
        "action_required": "No action is required from you at this time.",
    }
    doc["beneficiary_impacts"] = [b for b in doc["beneficiary_impacts"] if b["id"] != "bi_sarah"] + [bi]

    # three R.A.C. statements
    doc["rac"] = [r for r in doc["rac"] if r.get("event") != "evt_succession"] + [
        {"id": "rac_fid", "event": "evt_succession", "audience": "fiduciary",
         "title": "Fiduciary R.A.C. — Successor Trustee Activation", "generated": now_iso()[:10],
         "matter_id": MATTER_ID, "instrument_id": "ATL-HAR-00217-RAC-F-0003",
         "sections": [
             {"h": "What we did", "b": "Verified the successor-trustee condition and released a new governed state activating Maya Harrington as trustee."},
             {"h": "Under what authority", "b": "Trust Agreement, Article VII §3.2, supported by the Successor Acceptance & Resignation Instrument."},
             {"h": "What evidence supports it", "b": "Source document verified by James Morgan; claims confirmed against the governing instrument."},
             {"h": "What state resulted", "b": "Governed checkpoint advanced from v2.0 (superseded) to v3.0 (current)."},
             {"h": "What remains to be done", "b": "One open obligation: notify affected beneficiaries by 2026-06-08."},
         ]},
        {"id": "rac_ben", "event": "evt_succession", "audience": "beneficiary",
         "title": "Your R.A.C. Statement — Trustee Change", "generated": now_iso()[:10],
         "matter_id": MATTER_ID, "instrument_id": "ATL-HAR-00217-RAC-B-0003",
         "sections": [
             {"h": "What happened", "b": "The trust transitioned to its named successor trustee, Maya Harrington."},
             {"h": "What changed for you", "b": "Your point of contact for trustee matters is now Maya Harrington."},
             {"h": "What did not change", "b": "Your status as a beneficiary and your distribution rights remain the same."},
             {"h": "What it means for you", "b": "The trust continues to be administered on your behalf, without interruption."},
             {"h": "Do I need to do anything?", "b": "No action is required from you at this time."},
             {"h": "Who should I contact?", "b": "You may reach out to your fiduciary team with any questions."},
         ]},
        {"id": "rac_ov", "event": "evt_succession", "audience": "oversight",
         "title": "Oversight R.A.C. — Successor Trustee Activation", "generated": now_iso()[:10],
         "matter_id": MATTER_ID, "instrument_id": "ATL-HAR-00217-RAC-O-0003",
         "sections": [
             {"h": "Consequential conduct", "b": "Verified succession and released governed state v3.0 (officer: James Morgan)."},
             {"h": "Exceptions", "b": "Beneficiary notification obligation currently OPEN; monitor against expected window."},
             {"h": "Obligations remaining", "b": "1 open — notify affected beneficiaries (due 2026-06-08)."},
             {"h": "Evidence / confirmations", "b": "Source-linked instrument verified; state transition provenance recorded."},
             {"h": "Supervisory attention", "b": "Attention warranted only if notice remains open beyond the expected window."},
             {"h": "Next action owner", "b": "James Morgan (fiduciary officer)."},
         ]},
    ]

    # evidence instrument for v3
    doc["evidence_instruments"] = [e for e in doc["evidence_instruments"] if e["id"] != "ev_v3"] + [
        {"id": "ev_v3", "matter_id": MATTER_ID, "instrument_id": "ATL-HAR-00217-EV-0003",
         "title": "Successor Trustee Activation — Governed Transition", "state_version": "v3.0",
         "lifecycle": "RELEASED", "checkpoint_time": now_iso()[:10], "hash": "E7A3-9B2C-4F6D-A18B",
         "verification_class": "Human-verified · Source-linked", "prev_state": "v2.0", "successor_state": "—",
         "transition_type": "Successor trustee activation",
         "sources": ["Successor Acceptance & Resignation Instrument", "Trust Agreement.pdf"]}]

    doc["flow"]["changeset_approved"] = True
    await save_state(doc)
    return {"state": v3, "event": event, "obligation": obligation}


@api.post("/obligations/{ob_id}/action")
async def obligation_action(ob_id: str, body: ObligationAction):
    await ensure_seed()
    doc = await get_state()
    ob = next((o for o in doc["obligations"] if o["id"] == ob_id), None)
    if not ob:
        raise HTTPException(404, "Obligation not found.")
    ob.setdefault("history", [])
    act = body.action.lower()
    if act == "escalate":
        ob["status"] = "ESCALATED"
        doc["flow"]["obligation_escalated"] = True
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": "Escalated to fiduciary officer for resolution." + (f" Note: {body.note}" if body.note else "")})
    elif act == "assign":
        ob["owner"] = body.assignee or ob["owner"]
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": f"Assigned to {ob['owner']}."})
    elif act == "acknowledge":
        ob["history"].append({"time": now_iso(), "actor": "Patricia Vance", "action": "Acknowledged; monitoring."})
    elif act == "resolve":
        ob["status"] = "SATISFIED"
        doc["flow"]["obligation_resolved"] = True
        ob["completion_evidence"] = "Beneficiary notice delivered and recorded."
        ob["history"].append({"time": now_iso(), "actor": "James Morgan", "action": "Beneficiary notice sent; completion evidence attached. Obligation satisfied."})
        # release v4.0
        for s in doc["states"]:
            if s["status"] == "CURRENT":
                s["status"] = "SUPERSEDED"
        v4 = {"version": "v4.0", "status": "CURRENT", "title": "Beneficiary Notice Completed",
              "trustee": "Maya Harrington", "trustee_status": "CURRENT",
              "effective_time": now_iso()[:10], "recorded_time": now_iso()[:10],
              "verified_time": now_iso()[:10], "released_time": now_iso()[:10],
              "summary": "Beneficiary notification obligation satisfied. Relationship state updated to reflect completed notice.",
              "authority": "Fiduciary conduct record; completion evidence."}
        doc["states"].append(v4)
        doc["events"].append({
            "id": "evt_notice", "kind": "STATE_RELEASE", "title": "Beneficiary Notice Completed",
            "date": now_iso()[:10], "state_version": "v4.0",
            "summary": "Obligation satisfied. Oversight exception closed and Matter Timeline updated.",
            "icon": "check"})
        # add a communication log
        doc.setdefault("communications", []).append({
            "id": "comm_notice", "to": "Sarah Harrington", "type": "Beneficiary Notice",
            "date": now_iso()[:10], "status": "SENT",
            "summary": "Formal notice of trustee succession delivered to affected beneficiaries."})
    else:
        raise HTTPException(400, "Unknown action.")
    await save_state(doc)
    return {"obligation": ob}


@api.post("/elicited-context")
async def elicited_context(body: ElicitedContext):
    await ensure_seed()
    doc = await get_state()
    entry = {
        "id": f"ec_{len(doc['elicited_context'])+1}",
        "person": body.person, "text": body.text,
        "class": "ELICITED_CONTEXT", "status": "REQUIRES_REVIEW",
        "time": now_iso(),
        "note": "Stored as elicited context. Does not change governed state unless verified.",
    }
    doc["elicited_context"].append(entry)
    await save_state(doc)
    return {"entry": entry}


# Scripted MARGARET
def margaret_reply(audience, prompt):
    p = (prompt or "").lower()
    a = audience.lower()
    if a == "beneficiary":
        if "action" in p or "do i" in p or "need" in p:
            return {
                "text": "No action is required from you right now. Your beneficiary status and distribution rights are unchanged. Only your trustee point of contact has changed to Maya Harrington.",
                "sources": ["Governed State v3.0", "Beneficiary R.A.C. (current)"],
                "elicit": "Does this match how you understood the change?",
            }
        if "who" in p or "contact" in p or "trustee" in p:
            return {
                "text": "Maya Harrington is now serving as trustee, effective June 1, 2026. She is your point of contact for trustee matters. Your role as a beneficiary did not change.",
                "sources": ["Governed State v3.0", "Consequential Event: Successor Trustee Activation"],
                "elicit": "Your trustee changed, but your beneficiary status did not. Does this match how you understood the change?",
            }
        return {
            "text": "Your trustee changed on the current checkpoint: Maya Harrington is now serving as trustee. Your beneficiary status did not change, and no action is currently required from you.",
            "sources": ["Governed State v3.0", "Beneficiary R.A.C. (current)"],
            "elicit": "Your trustee changed, but your beneficiary status did not. Does this match how you understood the change?",
        }
    if a == "oversight":
        return {
            "text": "The Harrington Matter surfaced because the beneficiary-notice obligation created by the succession event remains open. Most overdue beneficiary notices in this portfolio followed successor-authority transitions.",
            "sources": ["Attention Queue", "Oversight R.A.C.", "Obligation: Notify affected beneficiaries"],
            "elicit": "Would you like to compare those Matters to determine whether the delay appears officer-specific or process-specific?",
        }
    # fiduciary
    return {
        "text": "The current governed checkpoint reflects the Successor Trustee Activation. One obligation is open: notify affected beneficiaries (due 2026-06-08). All supporting evidence is source-linked and verified.",
        "sources": ["Governed State v3.0", "Fiduciary R.A.C.", "Consequential Event: Successor Trustee Activation"],
        "elicit": "Would you like to generate the beneficiary communication now?",
    }


@api.post("/margaret")
async def ask_margaret(body: MargaretQuery):
    await ensure_seed()
    reply = margaret_reply(body.audience, body.prompt)
    return reply


@api.post("/reset")
async def reset_demo():
    await save_state(build_seed())
    return {"status": "reset", "matter_id": MATTER_ID}


app.include_router(api)


@app.on_event("startup")
async def startup():
    await ensure_seed()


@app.on_event("shutdown")
async def shutdown():
    client.close()
