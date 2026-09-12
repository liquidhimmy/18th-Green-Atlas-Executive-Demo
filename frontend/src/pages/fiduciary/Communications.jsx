import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Mail, Paperclip, CheckCircle2, Loader2, FileText, Download, Inbox } from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip, Btn } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import { featuredObligation, featuredEvent, primaryBeneficiary } from "../../helpers";
import { exportPdf } from "../../pdf";
import api from "../../api";

const HAR = "ATL-HAR-00217";

function draftFor(matter) {
  const evt = featuredEvent(matter);
  const ben = primaryBeneficiary(matter);
  const impact = matter.beneficiary_impacts[0] || {};
  const subject = matter.matter_id === HAR ? `Notice of Trustee Succession — ${matter.name}` : `Explanation of Discretionary Distribution — ${matter.name}`;
  const body = evt
    ? `Dear ${ben.name},\n\nWe are writing to inform you of a governed change on your trust relationship: ${evt.title}. ${evt.transition ? evt.transition.changes.join(" ") + "." : ""}\n\nWhat this means for you: ${impact.what_it_means || "Please review your relationship home for details."}\n\nAction required: ${impact.action_required || "None."}\n\nThis notice is issued under ${evt.authority}. A source-linked R.A.C. statement is available for your records.\n\nSincerely,\n${matter.officer}, Fiduciary Officer`
    : `Dear ${ben.name},\n\nThis is a communication regarding your trust relationship.\n\nSincerely,\n${matter.officer}`;
  return { subject, body };
}

// Seeds the editable draft once the matter is loaded; user edits are preserved afterwards.
function useDraft(matter) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const seeded = useRef(false);
  useEffect(() => {
    if (!matter || seeded.current) return;
    const d = draftFor(matter);
    setSubject(d.subject); setBody(d.body);
    seeded.current = true;
  }, [matter, setSubject, setBody]);
  return { subject, setSubject, body, setBody };
}

export default function Communications() {
  const { matter, refresh, matterId } = useMatter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { subject, setSubject, body, setBody } = useDraft(matter);
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;

  const ob = featuredObligation(matter);
  const ben = primaryBeneficiary(matter);
  const ctype = matter.matter_id === HAR ? "Beneficiary Notice" : "Distribution Explanation";
  const open = ob && ob.status !== "SATISFIED";

  const send = async () => {
    setBusy(true);
    await api.sendCommunication(matterId, { to: ben.name, type: ctype, summary: subject });
    await refresh();
    setBusy(false);
  };

  const downloadLetter = () => exportPdf({
    title: subject, subtitle: `${ctype} · To ${ben.name}`, instrumentId: `${matter.matter_id}-COMM`,
    matterName: matter.name,
    sections: body.split("\n\n").map((p) => ({ h: "", b: p })),
    disclaimer: "Reference demo communication. Synthetic data.",
  });

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", matter.name, "Communications"]}>
      <div className="mb-5">
        <h1 className="font-display text-[28px]">Communication Hub</h1>
        <div className="text-[13px] muted-text mt-1">Preview and send beneficiary communications. Sent letters are recorded as source-linked evidence.</div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Composer / preview */}
        <Card className="col-span-8 p-0 overflow-hidden">
          <div className="px-5 py-3 border-b hair flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: "#19C37D" }}><Mail size={14} /> {open ? "Compose & Preview" : "Sent Communication"}</div>
            <StatusChip status={open ? "DRAFT" : "SENT"} />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-[12.5px] muted-text mb-3">
              <span className="font-medium" style={{ color: "#EAF2EF" }}>To:</span> {ben.name} · Primary Beneficiary
            </div>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!open} data-testid="comm-subject"
              className="w-full bg-transparent border hair rounded-xl px-4 py-3 text-[15px] font-display outline-none mb-4"
              style={{ color: "#EAF2EF" }} />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} disabled={!open} data-testid="comm-body"
              rows={12} className="w-full bg-transparent border hair rounded-xl px-4 py-3 text-[13.5px] leading-relaxed outline-none resize-none"
              style={{ color: "#cfe0da", whiteSpace: "pre-wrap" }} />
            <div className="flex items-center justify-between mt-5">
              <button onClick={downloadLetter} className="inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#19C37D" }} data-testid="comm-download-btn">
                <Download size={15} /> Download letter (PDF)
              </button>
              {open ? (
                <Btn onClick={send} disabled={busy} data-testid="comm-send-btn">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Send & attach as evidence
                </Btn>
              ) : (
                <span className="chip" style={{ color: "#10B981", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <CheckCircle2 size={13} /> Sent & recorded
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Side: obligation + sent log */}
        <div className="col-span-4 space-y-5">
          <LinkedObligation ob={ob} />
          <CommunicationLog comms={matter.communications || []} onEvidence={() => navigate("/fiduciary/rac")} />
        </div>
      </div>
    </LensLayout>
  );
}

function LinkedObligation({ ob }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={Paperclip} title="Linked obligation" />
      {ob ? (
        <div>
          <div className="flex items-center gap-2 mb-1"><span className="text-[13.5px] font-medium">{ob.title}</span></div>
          <StatusChip status={ob.status} />
          <div className="text-[12px] muted-text mt-2">Sending this communication satisfies the obligation and attaches the letter as completion evidence.</div>
        </div>
      ) : <div className="text-[13px] muted-text">No open communication obligation on this Matter.</div>}
    </Card>
  );
}

function CommunicationLog({ comms, onEvidence }) {
  return (
    <Card className="p-5">
      <SectionTitle icon={Inbox} title="Communication log" />
      {comms.length === 0 && <div className="text-[13px] muted-text">No communications sent yet.</div>}
      <div className="space-y-3">
        {comms.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 border hair">
            <div className="flex items-center gap-2"><FileText size={14} style={{ color: "#19C37D" }} /><span className="text-[13px] font-medium">{c.type}</span><StatusChip status={c.status} /></div>
            <div className="text-[12px] muted-text mt-1">To {c.to} · {c.date}</div>
            <div className="text-[12px] mt-1">{c.summary}</div>
            <button onClick={onEvidence} className="text-[11.5px] mt-2 font-semibold" style={{ color: "#19C37D" }}>View attached evidence →</button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
