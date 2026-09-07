import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileText, Sparkles, ShieldCheck, GitBranch, Landmark, CheckCircle2,
  ArrowRight, ArrowLeft, AlertTriangle, User, Check, Loader2, Users, ClipboardList,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, StatusChip, Btn, ClassTag } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import api from "../../api";

const STEPS = [
  { key: "upload", label: "Source Capture", icon: UploadCloud },
  { key: "extract", label: "Extract & Verify", icon: Sparkles },
  { key: "changeset", label: "ChangeSet Review", icon: GitBranch },
  { key: "establish", label: "Establish State", icon: Landmark },
];

function stepFromFlow(f) {
  if (!f.source_uploaded) return 0;
  if (!f.claims_verified) return 1;
  if (!f.changeset_created || !f.changeset_approved) return f.changeset_created ? 2 : 2;
  return 3;
}

export default function GovernedChange() {
  const { matter, refresh, matterId } = useMatter();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (matter) setStep(stepFromFlow(matter.flow)); }, [matter]);
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;
  const flow = matter.flow;

  if (!matter.interactive) {
    return (
      <LensLayout lens="fiduciary" crumbs={["Matters", matter.name, "Governed Change"]}>
        <Card className="p-10 text-center max-w-[680px] mx-auto">
          <Landmark size={40} style={{ color: "#19C37D" }} className="mx-auto mb-3" />
          <div className="font-display text-[22px]">No pending governed change</div>
          <div className="text-[13.5px] muted-text mt-2">{matter.name} has no source awaiting review. Its most recent consequential change is already governed at the current checkpoint. Explore its history in the Matter Timeline.</div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Btn variant="outline" onClick={() => navigate("/fiduciary/timeline")}>Open Matter Timeline <ArrowRight size={15} /></Btn>
            <Btn onClick={() => navigate("/fiduciary/obligations")}>View Obligations</Btn>
          </div>
        </Card>
      </LensLayout>
    );
  }

  const run = async (fn, next) => {
    setBusy(true);
    await fn();
    await refresh();
    if (next !== undefined) setStep(next);
    setBusy(false);
  };

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", "Harrington Family Estate", "Governed Change"]}>
      <div className="mb-6">
        <h1 className="font-display text-[28px]">Governed Change Workflow</h1>
        <div className="text-[13px] muted-text mt-1">An AI observation is not a governed fact. Consequential history is never silently overwritten.</div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((s, i) => {
          const done = i < step || (i === 3 && flow.changeset_approved);
          const active = i === step;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.key}>
              <button onClick={() => i <= step && setStep(i)} className="flex items-center gap-2.5" data-testid={`step-${s.key}`}>
                <span className="grid place-items-center rounded-full transition-all" style={{
                  width: 38, height: 38,
                  background: done ? "#19C37D" : active ? "rgba(25,195,125,0.16)" : "rgba(255,255,255,0.04)",
                  color: done ? "#04150f" : active ? "#19C37D" : "#7f9a92",
                  border: `1px solid ${active || done ? "#19C37D" : "rgba(120,160,150,0.2)"}`,
                }}>
                  {done ? <Check size={18} /> : <Icon size={17} />}
                </span>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wide muted-text">Step {i + 1}</div>
                  <div className="text-[13px] font-medium" style={{ color: active ? "#19C37D" : undefined }}>{s.label}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: i < step ? "#19C37D66" : "rgba(120,160,150,0.18)" }} />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          {step === 0 && <UploadStep busy={busy} onUpload={(file) => run(() => api.uploadSource(matterId, file), 1)} />}
          {step === 1 && <ExtractStep matter={matter} busy={busy} onVerify={() => run(() => api.verifyClaims(matterId), 2)} />}
          {step === 2 && <ChangeSetStep matter={matter} busy={busy}
            onCreate={() => run(() => api.createChangeset(matterId))}
            onApprove={() => run(() => api.approveChangeset(matterId), 3)} />}
          {step === 3 && <EstablishStep matter={matter} navigate={navigate} />}
        </motion.div>
      </AnimatePresence>
    </LensLayout>
  );
}

/* ---------- Step 1: Upload ---------- */
function UploadStep({ onUpload, busy }) {
  const [file, setFile] = useState(null);
  return (
    <Card className="p-8 max-w-[820px]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "#19C37D" }}>
        <UploadCloud size={15} /> Source Capture · Changes begin with source-linked evidence
      </div>
      <label className="block rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all hover:brightness-110"
        style={{ borderColor: "rgba(25,195,125,0.35)", background: "rgba(25,195,125,0.04)" }}>
        <input type="file" className="hidden" data-testid="source-file-input" onChange={(e) => setFile(e.target.files[0])} />
        <UploadCloud size={40} style={{ color: "#19C37D" }} className="mx-auto mb-3" />
        <div className="font-display text-[18px]">{file ? file.name : "Drag & drop the new governing source"}</div>
        <div className="text-[12.5px] muted-text mt-1.5">Successor Acceptance & Resignation Instrument · PDF, DOCX, JPG, PNG</div>
      </label>
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => onUpload(null)} className="text-[12.5px] muted-text link-underline" data-testid="use-demo-source">
          Use bundled demo source instead
        </button>
        <Btn onClick={() => onUpload(file)} disabled={busy} data-testid="upload-source-btn">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} Capture Source
        </Btn>
      </div>
    </Card>
  );
}

/* ---------- Step 2: Extract & Verify ---------- */
function ExtractStep({ matter, onVerify, busy }) {
  const verified = matter.flow.claims_verified;
  return (
    <div className="grid grid-cols-12 gap-5">
      <Card className="col-span-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: "#19C37D" }}>
            <Sparkles size={15} /> AI Extraction / Claims
          </div>
          <ClassTag kind={verified ? "GOVERNED" : "DERIVED"} />
        </div>
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <AlertTriangle size={17} style={{ color: "#F59E0B" }} />
          <div className="text-[12.5px]"><b>An AI observation is not a governed fact.</b> Atlas creates claims for review. The professional verifies against source authority.</div>
        </div>
        <div className="space-y-3">
          {matter.claims.map((c) => (
            <div key={c.id} className="rounded-xl p-4 border hair flex items-start gap-3">
              <span className="grid place-items-center rounded-lg mt-0.5" style={{ width: 30, height: 30, background: "rgba(25,195,125,0.1)" }}>
                {c.kind === "person" ? <User size={15} style={{ color: "#19C37D" }} /> : c.kind === "date" ? <FileText size={15} style={{ color: "#19C37D" }} /> : <ShieldCheck size={15} style={{ color: "#19C37D" }} />}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium">{c.field}</span>
                  <StatusChip status={c.status} />
                </div>
                <div className="text-[13px] mt-0.5" style={{ color: "#19C37D" }}>{c.observed}</div>
                <div className="text-[11.5px] muted-text mt-1">Authority: {c.authority} · {c.note}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] muted-text uppercase">Confidence</div>
                <div className="font-mono text-[13px]">{Math.round(c.confidence * 100)}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="col-span-4 p-6 h-fit">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "#19C37D" }}>
          <ShieldCheck size={15} /> Human Verification
        </div>
        <p className="text-[13px] muted-text mb-5">Human governance sits between AI extraction and institutional truth. Confirm the claims against the source authority to establish them as verified facts.</p>
        <div className="space-y-2 mb-6">
          {["Source document reviewed", "Authority basis confirmed", "Parties & roles validated", "Effective date confirmed"].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-[12.5px]">
              <CheckCircle2 size={15} style={{ color: verified ? "#10B981" : "#7f9a92" }} /> {t}
            </div>
          ))}
        </div>
        {verified ? (
          <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-[13px]" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
            <CheckCircle2 size={16} /> Claims verified & governed
          </div>
        ) : (
          <Btn className="w-full" onClick={onVerify} disabled={busy} data-testid="verify-claims-btn">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Verify Claims
          </Btn>
        )}
      </Card>
    </div>
  );
}

/* ---------- Step 3: ChangeSet ---------- */
function ChangeSetStep({ matter, onCreate, onApprove, busy }) {
  const cs = matter.changesets.find((c) => c.id === "cs_succession");
  const impactColor = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#3B82F6" };
  if (!cs) {
    return (
      <Card className="p-8 max-w-[640px] text-center">
        <GitBranch size={38} style={{ color: "#19C37D" }} className="mx-auto mb-3" />
        <div className="font-display text-[19px]">Assemble the ChangeSet</div>
        <div className="text-[13px] muted-text mt-2 mb-6">Verified claims become a proposed ChangeSet — a controlled proposal reviewed before it becomes current state.</div>
        <Btn onClick={onCreate} disabled={busy} data-testid="create-changeset-btn">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <GitBranch size={16} />} Create ChangeSet
        </Btn>
      </Card>
    );
  }
  return (
    <Card className="p-6 max-w-[900px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[19px]">{cs.title}</span>
            <StatusChip status={cs.status} />
          </div>
          <div className="text-[12.5px] muted-text mt-1">Authority: {cs.authority}</div>
        </div>
        <span className="chip muted-text">{cs.open_items} open items</span>
      </div>

      <div className="text-[11px] uppercase tracking-wide muted-text mb-2">Proposed changes</div>
      <div className="space-y-2.5 mb-6">
        {cs.changes.map((ch) => (
          <div key={ch.id} className="rounded-xl p-4 border hair flex items-center gap-4">
            <span className="chip" style={{ color: impactColor[ch.impact], background: `${impactColor[ch.impact]}18`, border: `1px solid ${impactColor[ch.impact]}44` }}>{ch.impact}</span>
            <span className="text-[13.5px] flex-1">{ch.label}</span>
            <span className="font-mono text-[12.5px] muted-text">{ch.before}</span>
            <ArrowRight size={15} style={{ color: "#19C37D" }} />
            <span className="font-mono text-[12.5px]" style={{ color: "#19C37D" }}>{ch.after}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(25,195,125,0.06)", border: "1px solid rgba(25,195,125,0.2)" }}>
        <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: "#19C37D" }}>If approved</div>
        {cs.consequences.map((c, i) => <div key={i} className="text-[12.5px] muted-text flex items-center gap-2 py-0.5"><CheckCircle2 size={13} style={{ color: "#19C37D" }} /> {c}</div>)}
      </div>

      {cs.status === "APPROVED" ? (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-[13px]" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
          <CheckCircle2 size={16} /> ChangeSet approved — new governed state established.
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Btn onClick={onApprove} disabled={busy} data-testid="approve-changeset-btn">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve & Establish State
          </Btn>
          <span className="text-[12px] muted-text">Prior state becomes superseded — not overwritten.</span>
        </div>
      )}
    </Card>
  );
}

/* ---------- Step 4: Establish ---------- */
function EstablishStep({ matter, navigate }) {
  const states = matter.states;
  const before = states.find((s) => s.status === "SUPERSEDED" && s.version === "v2.0");
  const after = states.find((s) => s.status === "CURRENT");
  return (
    <div>
      <div className="grid grid-cols-2 gap-5 mb-6">
        {[["Previous — Superseded", before, "#6B7280"], ["Current — Released", after, "#19C37D"]].map(([label, s, c], i) => (
          <Card key={i} className="p-5" style={i === 1 ? { border: "1px solid rgba(25,195,125,0.4)" } : {}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-[18px]" style={{ color: c }}>{s.version}</span>
              <StatusChip status={s.status} />
            </div>
            <div className="space-y-1.5 text-[13px]">
              <Row label="Trustee" value={s.trustee} c={i === 1 ? "#19C37D" : undefined} />
              <Row label="Trustee status" value={s.trustee_status} />
              <Row label="Effective" value={s.effective_time} />
              <Row label="Released" value={s.released_time} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6" style={{ border: "1px solid rgba(25,195,125,0.4)" }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="grid place-items-center rounded-xl" style={{ width: 44, height: 44, background: "rgba(25,195,125,0.14)" }}><CheckCircle2 size={22} style={{ color: "#19C37D" }} /></span>
          <div>
            <div className="font-display text-[19px]">Governed state established (v3.0)</div>
            <div className="text-[13px] muted-text">Atlas linked this into one Consequential Event and created downstream responsibilities.</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <ResultCard icon={GitBranch} title="Consequential Event" sub="Successor Trustee Activation" onClick={() => navigate("/fiduciary/timeline")} cta="View timeline" />
          <ResultCard icon={ClipboardList} title="Obligation created" sub="Notify affected beneficiaries · OPEN" onClick={() => navigate("/fiduciary/obligations")} cta="View obligation" />
          <ResultCard icon={Users} title="Beneficiary impact" sub="Informational · No action required" onClick={() => navigate("/beneficiary")} cta="Beneficiary lens" />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, c }) {
  return <div className="flex items-center justify-between border-b hair last:border-0 py-1.5"><span className="muted-text text-[12.5px]">{label}</span><span style={{ color: c, fontWeight: c ? 600 : 400 }}>{value}</span></div>;
}
function ResultCard({ icon: Icon, title, sub, onClick, cta }) {
  return (
    <button onClick={onClick} className="text-left rounded-xl p-4 border hair transition-all hover:brightness-110 hover:-translate-y-0.5" style={{ background: "rgba(25,195,125,0.05)" }} data-testid={`result-${title.toLowerCase().replace(/[^a-z]/g,"-")}`}>
      <Icon size={18} style={{ color: "#19C37D" }} />
      <div className="font-display text-[15px] mt-2">{title}</div>
      <div className="text-[12px] muted-text mt-0.5">{sub}</div>
      <div className="text-[12px] mt-2 font-semibold" style={{ color: "#19C37D" }}>{cta} →</div>
    </button>
  );
}
