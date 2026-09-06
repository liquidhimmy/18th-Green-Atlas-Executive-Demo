# 18th Green Atlas — Fiduciary Relationship Management (FRM) — Reference Demo

## Original Problem Statement
Build a functional reference demo of "18th Green Atlas", a Fiduciary Relationship Management (FRM) platform ("CRM for fiduciary professionals, built around the governed trust relationship"). Demonstrate **one Matter (Harrington Family Estate, ATL-HAR-00217), one governed causal history, three lenses** (Fiduciary, Beneficiary, Oversight). Show a single consequential event — Successor Trustee Activation — flow through the whole system. Begin and end on the Three-Lens Workflow north-star screen.

## User Choices
1. AI = scripted/deterministic (MARGARET + claim extraction; no LLM)
2. Auth = demo role/lens selector (no passwords)
3. Uploaded docs drive golden path + shape data
4. Full end-to-end first pass
5. Brand palette provided (Atlas Evergreen/Emerald green, Trust Violet, Governance Gold; dark for fiduciary/oversight, light for beneficiary). Fonts: Fraunces (display) + Hanken Grotesk.

## Architecture
- Frontend: React 18 + react-router + framer-motion + Tailwind. Lens-themed shell (LensLayout), shared instruments (MatterTimeline, StateComparison, EvidenceInstrument, RACStatement, Margaret). MatterContext loads /api/matter + /api/portfolio and refreshes after every mutation.
- Backend: FastAPI + MongoDB (motor). Single seeded demo document per Matter; golden-path endpoints mutate it; POST /api/reset re-seeds.
- Core rules honored: AI observation ≠ governed fact; Claim ≠ Verification; proposed ChangeSet ≠ current state; history superseded not overwritten; every state knows predecessor; obligations have owner+lifecycle; R.A.C. are projections; MARGARET elicits but never establishes truth; elicited context = Requires Review.

## Implemented (2026-06 / first pass — tested 100%)
- Three-Lens Workflow landing (compass hub + 3 lens columns, north-star).
- Fiduciary: Dashboard, Matter Overview (people/authority/structures/assets), Governed Change golden-path wizard (upload → extract/claims → verify → ChangeSet → establish v3.0), Matter Timeline (consequential-event drilldown + State Comparison), Obligations (OPEN→SATISFIED lifecycle, beneficiary impact), R.A.C. & Evidence Instruments.
- Beneficiary (light/violet): Relationship Home (What Changed / What Did Not, current checkpoint, role), Beneficiary R.A.C.
- Oversight (gold): Portfolio + Attention Queue (Harrington surfaces on open obligation), Matter Oversight (why surfaced, evidence & conduct, escalate/assign/acknowledge, Oversight R.A.C.).
- MARGARET slide-over (scripted, audience-aware, source chips, elicitation → Requires Review).
- Full closed loop: escalate (oversight) → resolve (fiduciary) → v4.0 + exception closed. Reset button.
- Consequential Event links source→verification→transition→conduct→obligation→beneficiary impact→evidence. Temporal semantics (effective/recorded/verified/released) preserved.

## Backend API
GET /api/matter, /api/portfolio, /api/health; POST /api/upload-source, /api/verify-claims, /api/create-changeset, /api/approve-changeset, /api/obligations/{id}/action, /api/margaret, /api/elicited-context, /api/reset.

## Backlog / Next (P1/P2)
- P1: Multi-Matter switcher (other portfolio trusts are summaries only; make one more Matter navigable).
- P1: Communication hub (send/preview beneficiary notice as its own screen).
- P2: Timeline checkpoint scrubber (view Matter as of any prior state).
- P2: Portfolio/Institutional intelligence panels (derived insights).
- P2: Downloadable Evidence Instrument / R.A.C. PDF export (currently on-screen only).
- Notes: MARGARET & claim extraction are MOCKED (scripted). Other portfolio matters besides Harrington are non-interactive summaries.
