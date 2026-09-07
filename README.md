# 18th Green Atlas — Executive Demo

**Fiduciary Relationship Management (FRM).** A functional reference experience for the governed trust relationship: *one Matter, one causal history, three perspectives.*

> Functional reference experience · Fictional / synthetic data · Not production software.

---

## What the demo shows

A single consequential event — the **Successor Trustee Activation** on the Harrington Family Estate (`ATL-HAR-00217`) — flows through the whole system:

```
upload source → AI claims (not governed truth) → human verification → ChangeSet (proposal)
→ approve → new governed state v3.0 (prior state superseded, never overwritten)
→ Consequential Event + OPEN obligation + beneficiary impact + three R.A.C. statements + Evidence Instrument
→ oversight surfaces the exception → escalate → beneficiary notice sent → obligation satisfied → v4.0
```

The app begins and ends on the **Three-Lens Workflow** north-star screen.

### Three lenses, one truth

| Lens | Audience | Palette | Screens |
|---|---|---|---|
| **Fiduciary** | Trust officers, trustees | Dark · Atlas Green | Dashboard, Matter Overview, Governed Change wizard, Matter Timeline (causal history · checkpoint scrubber · state comparison), Obligations, Communication Hub, R.A.C. & Evidence |
| **Beneficiary** | Families, related parties | Light · Trust Violet | My Relationship (what changed / what did not), Beneficiary R.A.C., Ask MARGARET |
| **Oversight** | Supervisors, committees | Dark · Governance Gold | Portfolio & Attention Queue, Matter Oversight (why surfaced, evidence & conduct, acknowledge / assign / escalate), Oversight R.A.C. |

### Two fully navigable Matters

| Matter | ID | Scripted golden path |
|---|---|---|
| Harrington Family Estate | `ATL-HAR-00217` | Successor trustee activation · v2.0 → v3.0 → v4.0 |
| Morgan Family Trust | `ATL-MOR-00456` | Discretionary distribution ($250k, HEMS) · v4.0 → v5.0 → v6.0 |

Switch Matters from the top-bar selector. Four additional trusts appear in the Oversight portfolio as non-interactive summaries.

### Play the story (guided autoplay)

Press **Play the story** on the landing page (or **Play story** in any lens top bar). A narration card walks a partner through all fifteen beats — resetting the demo, running the Harrington golden path across the three lenses, and returning to the north-star. Autoplay advances every 9 seconds; use *Pause*, *Back*, *Next*, or *Exit* at any time.

### Other features

- **Communication Hub** — preview/edit the beneficiary notice, send (simulated), letter recorded as completion evidence and a new Evidence Instrument.
- **Timeline Scrubber** — slide across governed checkpoints and see the Matter exactly as it was at any prior state.
- **Evidence Export** — any R.A.C. statement or Evidence Instrument exports to an audit-styled PDF (browser print → Save as PDF).
- **Portfolio Intelligence** (Oversight → Portfolio) — a compact side-by-side of Harrington and Morgan built only from authorized operational metadata (obligation lifecycle, transition type, officer assignment, communication record). Three derived readings — *Matter-specific*, *Officer-specific*, *Process-specific* — show whether a delay belongs to the Matter, the desk, or the step. Labelled *Derived Intelligence*; it never adjudicates conduct and recomputes as the story progresses.
- **MARGARET** — audience-aware AI assistant. Elicits context, never establishes truth; elicited context is stored as *Requires Review*.
- **Reset** — returns both Matters to their clean starting checkpoint.

---

## Core rules the demo honors

- An AI observation is **not** a governed fact. A claim is **not** a verification.
- A proposed ChangeSet is **not** the current state.
- History is **superseded, never overwritten**; every state knows its predecessor.
- Effective, recorded, verified, and released times are kept **distinct**.
- Every obligation has an **owner and a lifecycle**.
- R.A.C. statements are **projections** of governed history for an audience — they explain conduct, they do not adjudicate it.
- MARGARET **elicits** but never establishes truth.

---

## Tech stack

- **Frontend** — React 18, react-router 6, framer-motion, Tailwind, lucide-react. Fonts: Fraunces (display) + Hanken Grotesk.
- **Backend** — FastAPI + Motor (MongoDB). One seeded document per Matter; per-Matter scripted golden paths (`SCRIPTS` in `server.py`); `POST /api/reset` re-seeds.
- **AI / integrations** — MARGARET replies and claim extraction are **scripted and deterministic** (no LLM). Communication send is **simulated**.

## Project layout

```
backend/
  server.py            # FastAPI app, seeds, scripted golden paths, routes
  tests/               # pytest suites (backend_test.py, test_iteration3.py)
frontend/src/
  App.js               # MatterContext + routes + TourCard
  tour.js              # "Play the story" script (15 beats)
  api.js               # axios client (REACT_APP_BACKEND_URL + /api)
  theme.js             # per-lens palette & status colors
  pdf.js               # print-to-PDF export
  components/          # LensLayout, TourCard, PortfolioIntelligence, MatterTimeline, TimelineScrubber,
                       # StateComparison, EvidenceInstrument, RACStatement, Margaret, ui
  pages/
    ThreeLensWorkflow.jsx
    fiduciary/         # Dashboard, MatterOverview, GovernedChange, TimelinePage,
                       # Obligations, Communications, RAC
    beneficiary/       # Home, RAC
    oversight/         # Portfolio, MatterOversight
memory/PRD.md          # product requirements & implementation log
```

## API

All routes are prefixed with `/api`. Mutation endpoints accept `?matter_id=` (default `ATL-HAR-00217`).

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | liveness |
| GET | `/matters` | navigable Matter summaries |
| GET | `/matter?matter_id=` | full Matter document |
| GET | `/portfolio` | book of trusts, attention queue, summary |
| GET | `/intelligence` | derived Harrington × Morgan comparison (Matter / officer / process patterns) |
| POST | `/upload-source` | capture source → scripted claims |
| POST | `/verify-claims` | human verification |
| POST | `/create-changeset` | assemble proposed ChangeSet |
| POST | `/approve-changeset` | release next governed state + consequential event |
| POST | `/obligations/{id}/action` | `acknowledge` · `assign` · `escalate` · `resolve` |
| POST | `/communications/send` | simulated send → obligation satisfied, new state, evidence |
| POST | `/margaret` | scripted assistant reply |
| POST | `/elicited-context` | store beneficiary context as *Requires Review* |
| POST | `/reset` | re-seed both Matters |

## Running locally

```bash
# backend
cd backend
pip install -r requirements.txt
# .env → MONGO_URL=mongodb://localhost:27017  DB_NAME=atlas_frm  CORS_ORIGINS=*
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# frontend
cd frontend
yarn install
# .env → REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

Tests: `cd backend && pytest tests/`.

---

*Built for trust. Designed for stewardship.*
