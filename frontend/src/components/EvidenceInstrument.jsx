import React from "react";
import { QrCode, FileText, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { StatusChip } from "./ui";
import { exportPdf } from "../pdf";
import { Term } from "./Glossary";

export default function EvidenceInstrument({ instrument, accent = "#19C37D", matterName }) {
  if (!instrument) return null;
  const meta = [
    ["Matter ID", instrument.matter_id],
    ["Instrument ID", instrument.instrument_id],
    ["State version", instrument.state_version],
    ["Lifecycle status", instrument.lifecycle],
    ["Checkpoint / release", instrument.checkpoint_time],
    ["Transition type", instrument.transition_type],
    ["Previous state", instrument.prev_state],
    ["Successor state", instrument.successor_state],
    ["Verification class", instrument.verification_class],
    ["Integrity hash", instrument.hash],
  ];
  const download = () => exportPdf({
    title: instrument.title, subtitle: `Evidence Instrument · ${instrument.state_version}`,
    instrumentId: instrument.instrument_id, matterName: matterName || instrument.matter_id,
    sections: [
      { h: "Transition type", b: instrument.transition_type },
      { h: "Verification class", b: instrument.verification_class },
      { h: "Source authority", b: (instrument.sources || []).join(", ") },
    ],
    meta, disclaimer: "This reference demo illustrates the intended architecture. Production cryptographic verification, institutional security controls, and regulatory requirements would be implemented and validated in the production system.",
  });
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Human layer */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#F6F7F9", color: "#14202b", border: "1px solid #D8DDE6" }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: "#D8DDE6", background: "#fff" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: "#0F5C4D" }}>
              <FileText size={14} /> <Term k="evidence-instrument" accent="#0F5C4D">Evidence Instrument</Term>
            </div>
            <span className="chip" style={{ color: "#10B981", background: "#10B98118", border: "1px solid #10B98144" }}>
              <CheckCircle2 size={12} /> Verified
            </span>
          </div>
          <div className="font-display text-[22px] mt-3">{instrument.title}</div>
          <div className="text-[12.5px] mt-1" style={{ color: "#465468" }}>{matterName || "Matter"} · {instrument.matter_id}</div>
        </div>
        <div className="px-6 py-5 space-y-2.5">
          {["Document summary", "Authority verified", "Participants confirmed", "Checkpoint history", "Source-linked provenance"].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-[13px]"><CheckCircle2 size={15} style={{ color: "#10B981" }} /> {t}</div>
          ))}
          <div className="flex items-end justify-between pt-4 mt-2 border-t" style={{ borderColor: "#D8DDE6" }}>
            <div>
              <div className="text-[10.5px] uppercase tracking-wide" style={{ color: "#465468" }}>Scan to verify</div>
              <div className="font-mono text-[13px] mt-1" style={{ color: "#0F5C4D" }}>{instrument.hash}</div>
            </div>
            <div className="grid place-items-center rounded-lg" style={{ width: 72, height: 72, background: "#fff", border: "1px solid #D8DDE6" }}>
              <QrCode size={54} style={{ color: "#081018" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Machine layer */}
      <div className="panel p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: accent }}>
          <ShieldCheck size={14} /> Structured Provenance
        </div>
        <div className="rounded-xl overflow-hidden border hair">
          {meta.map(([k, v], i) => (
            <div key={i} className="grid grid-cols-[160px_1fr] text-[12.5px] border-b hair last:border-0">
              <div className="px-3 py-2.5 muted-text">{k}</div>
              <div className="px-3 py-2.5 font-mono" style={{ color: k.includes("hash") || k.includes("ID") ? accent : undefined }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
          <ShieldCheck size={14} /> Verification architecture placeholder — production cryptographic verification & institutional security controls pending.
        </div>
        <button onClick={download} className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: accent }} data-testid="evidence-export-btn">
          <Download size={15} /> Export portable instrument (PDF)
        </button>
      </div>
    </div>
  );
}
