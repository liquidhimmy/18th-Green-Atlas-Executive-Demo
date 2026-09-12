import React, { useState } from "react";
import { BookOpen, X } from "lucide-react";

export const TERMS = {
  "consequential-event": { title: "Consequential Event",
    def: "An occurrence that could change authority, rights, obligations, assets or beneficiary impact.",
    proves: "It links trigger, source, verification, state transition, conduct, obligation, beneficiary impact and evidence into one causal record." },
  changeset: { title: "ChangeSet",
    def: "Source-linked modifications proposed to move a Matter from its current governed state to its next governed state.",
    proves: "A ChangeSet is a proposal — it becomes current state only when a human approves it, and the prior state is superseded, never overwritten." },
  "evidence-instrument": { title: "Evidence Instrument",
    def: "A verifiable artifact recording the source, review, approval, communication or completion of a governed change.",
    proves: "Each instrument knows its predecessor state, its verification class and its integrity hash, so a partner can take it away and inspect it." },
  rac: { title: "R.A.C. — Relationship-and-Conduct Statement",
    def: "A plain-language record of what happened, under what authority, on what evidence, and what it means for its reader.",
    proves: "It proves that conduct was recorded against governed history for a specific audience — it explains conduct, it does not adjudicate it." },
};

// Clickable / tappable definition. Works on touch devices; stays available after first contact.
export function Term({ k, children, accent = "#19C37D", className = "" }) {
  const [open, setOpen] = useState(false);
  const t = TERMS[k];
  return (
    <span className={`relative inline-block ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} data-testid={`term-${k}`} aria-expanded={open}
        className="inline-flex items-center gap-1 cursor-help" style={{ borderBottom: `1px dotted ${accent}`, color: "inherit", font: "inherit" }}>
        {children}<BookOpen size={11} style={{ color: accent, opacity: 0.8 }} />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
          <span role="dialog" data-testid={`term-popover-${k}`}
            className="absolute z-[60] left-0 top-full mt-2 w-[320px] rounded-xl p-4 text-left normal-case tracking-normal"
            style={{ background: "#0a1618", color: "#EAF2EF", border: `1px solid ${accent}55`, boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
            <span className="flex items-start justify-between gap-3">
              <span className="font-display text-[15px] leading-snug" style={{ color: accent }}>{t.title}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close definition"><X size={14} style={{ color: "#8FA6A0" }} /></button>
            </span>
            <span className="block text-[12.5px] mt-2 leading-relaxed">{t.def}</span>
            <span className="block text-[12px] mt-2 leading-relaxed" style={{ color: "#b9cdc6" }}>{t.proves}</span>
          </span>
        </>
      )}
    </span>
  );
}

export function GlossaryStrip({ accent = "#19C37D" }) {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-[12px]" data-testid="glossary-strip" style={{ color: "#c3d3ce" }}>
      <span className="muted-text uppercase tracking-[0.14em] text-[10.5px]">Atlas language · tap to define</span>
      {Object.keys(TERMS).map((k) => <Term key={k} k={k} accent={accent}>{TERMS[k].title.split(" — ")[0]}</Term>)}
    </div>
  );
}
