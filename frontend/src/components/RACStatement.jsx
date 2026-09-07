import React from "react";
import { ShieldCheck, FileText, Download } from "lucide-react";
import { exportPdf } from "../pdf";

export default function RACStatement({ rac, accent = "#19C37D", light = false }) {
  if (!rac) return null;
  const download = () => exportPdf({
    title: rac.title, subtitle: `R.A.C. Statement · ${rac.audience || ""}`.trim(),
    instrumentId: rac.instrument_id, matterName: rac.matter_id,
    sections: rac.sections,
    disclaimer: "R.A.C. is a projection of governed history for an authorized audience. It explains conduct — it does not adjudicate whether conduct was lawful, prudent, or compliant.",
  });
  return (
    <div className="rounded-2xl overflow-hidden" style={light
      ? { background: "#fff", border: "1px solid #D8DDE6", color: "#14202b" }
      : { border: `1px solid ${accent}33`, background: "rgba(255,255,255,0.02)" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: light ? "#D8DDE6" : `${accent}22` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]" style={{ color: accent }}>
            <ShieldCheck size={14} /> R.A.C. Statement
          </div>
          <div className="flex items-center gap-3">
            <button onClick={download} data-testid="rac-export-btn" className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: accent }}>
              <Download size={13} /> PDF
            </button>
            <span className="font-mono text-[11px]" style={{ color: light ? "#465468" : "#8FA6A0" }}>{rac.instrument_id}</span>
          </div>
        </div>
        <div className="font-display text-[21px] mt-3">{rac.title}</div>
        <div className="text-[12px] mt-1" style={{ color: light ? "#465468" : "#8FA6A0" }}>
          Relationship-and-Conduct Statement · Generated {rac.generated} · {rac.matter_id}
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">
        {rac.sections.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-[190px] shrink-0 text-[13px] font-semibold flex items-start gap-2" style={{ color: accent }}>
              <FileText size={14} className="mt-0.5 shrink-0" /> {s.h}
            </div>
            <div className="text-[13.5px] leading-relaxed" style={{ color: light ? "#1b2733" : "#d3e0db" }}>{s.b}</div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t text-[11px]" style={{ borderColor: light ? "#D8DDE6" : `${accent}22`, color: light ? "#465468" : "#8FA6A0" }}>
        R.A.C. is a projection of governed history for an authorized audience. It explains conduct — it does not adjudicate whether conduct was lawful, prudent, or compliant.
      </div>
    </div>
  );
}
