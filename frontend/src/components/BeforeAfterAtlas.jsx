import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Scale } from "lucide-react";

const ROWS = {
  "ATL-HAR-00217": {
    event: "Robert Harrington can no longer serve as trustee, and Maya becomes successor trustee.",
    rows: [
      ["Maya appears in several systems as trustee", "Maya's authority is source-linked and verified"],
      ["Transition evidence is scattered", "One causal history connects the entire transition"],
      ["Completion depends on staff recollection", "Obligations have recorded owners, status and evidence"],
      ["The firm believes everyone was notified", "Delivery and acknowledgment are independently inspectable"],
      ["An auditor reconstructs what happened", "Atlas produces the governed record directly"],
    ],
    before: "the firm could show that Maya was named trustee.",
    after: "it can prove when her authority became effective, why it was valid, who verified it, what responsibilities changed, who was notified, and whether every downstream record matched the new governed state.",
  },
  "ATL-MOR-00456": {
    event: "Daniel Morgan requests a discretionary distribution; the trustee approves it under the HEMS standard.",
    rows: [
      ["A wire confirmation shows the funds moved", "The distribution is source-linked to the trustee resolution and Article V §2.4"],
      ["The HEMS rationale lives in an email thread", "The verified standard and who confirmed it are recorded"],
      ["Cash balances are updated by hand", "The asset change is part of the governed state transition"],
      ["Someone recalls the beneficiary was told", "Delivery of the distribution explanation is inspectable evidence"],
      ["A reviewer rebuilds the pattern from statements", "Portfolio intelligence surfaces the pattern from operational metadata"],
    ],
    before: "the firm could show that a distribution was paid.",
    after: "it can prove under what authority it was approved, who verified the standard, what changed in the governed state, and whether the beneficiary was properly informed.",
  },
};

export default function BeforeAfterAtlas({ matter, from, to, accent = "#19C37D" }) {
  const d = ROWS[matter.matter_id] || ROWS["ATL-HAR-00217"];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden mb-6 border hair" data-testid="before-after-atlas">
      <div className="px-5 py-4 border-b hair flex items-start gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
        <Scale size={18} style={{ color: "#C69214" }} className="mt-0.5 shrink-0" />
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "#C69214" }}>The consequential event · before the transition to Governed State {to}</div>
          <div className="font-display text-[17px] mt-1">{d.event}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 text-[11px] uppercase tracking-wide border-b hair">
        <div className="px-5 py-2.5 muted-text">Before Atlas</div>
        <div className="px-5 py-2.5 border-l hair font-semibold" style={{ color: accent }}>After Atlas</div>
      </div>
      {d.rows.map(([b, a], i) => (
        <div key={i} className="grid grid-cols-2 text-[13px] border-b hair last:border-0" data-testid={`before-after-row-${i}`}>
          <div className="px-5 py-3 muted-text">{b}</div>
          <div className="px-5 py-3 border-l hair flex items-start gap-2" style={{ background: `${accent}08` }}>
            <ArrowRight size={14} className="mt-0.5 shrink-0" style={{ color: accent }} /> {a}
          </div>
        </div>
      ))}
      <div className="px-5 py-4 text-[13px] leading-relaxed border-t hair" style={{ background: "rgba(198,146,20,0.06)" }}>
        <span className="muted-text">Before Atlas, {d.before}</span>{" "}
        <span style={{ color: "#EAF2EF" }}>After Atlas — once {from} is superseded by {to} — {d.after}</span>
      </div>
    </motion.div>
  );
}
