import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, FileText, RefreshCw, CheckCircle2, ChevronDown, GitCommit,
  ShieldCheck, User, ClipboardList, Users, FileCheck2, Zap, Clock,
} from "lucide-react";
import { StatusChip, ClassTag } from "./ui";
import { Term } from "./Glossary";

const ICONS = { landmark: Landmark, "file-text": FileText, refresh: RefreshCw, check: CheckCircle2 };

export default function MatterTimeline({ matter, accent = "#19C37D", compact = false }) {
  const events = [...(matter?.events || [])].sort((a, b) => (a.date > b.date ? 1 : -1));
  const lastConseq = [...events].reverse().find((e) => e.kind === "CONSEQUENTIAL");
  const [open, setOpen] = useState(lastConseq?.id || null);

  return (
    <div className="relative pl-2">
      <div className="absolute left-[26px] top-2 bottom-2 w-px" style={{ background: `linear-gradient(${accent}66, ${accent}11)` }} />
      <div className="space-y-3">
        {events.map((e, i) => {
          const Icon = ICONS[e.icon] || GitCommit;
          const isConseq = e.kind === "CONSEQUENTIAL";
          const isOpen = open === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="relative">
              <div className="flex items-start gap-4">
                <span className="relative z-[2] grid place-items-center rounded-full shrink-0"
                  style={{ width: 34, height: 34, background: isConseq ? accent : "rgba(8,20,20,0.95)", color: isConseq ? "#04150f" : accent, border: `1px solid ${accent}66` }}>
                  <Icon size={16} />
                </span>
                <div className="flex-1 panel p-4" style={isConseq ? { border: `1px solid ${accent}55` } : {}}>
                  <button onClick={() => setOpen(isOpen ? null : e.id)} className="w-full flex items-center gap-3 text-left"
                    data-testid={`timeline-event-${e.id}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-[15.5px]">{e.title}</span>
                        {isConseq && <StatusChip status="INFO" label="Consequential Event" />}
                        <span className="chip muted-text text-[10.5px]">{e.state_version}</span>
                      </div>
                      <div className="text-[12px] muted-text mt-1">{e.summary}</div>
                    </div>
                    <span className="text-[11.5px] muted-text whitespace-nowrap">{e.date}</span>
                    {isConseq && <ChevronDown size={16} className="transition-transform" style={{ color: accent, transform: isOpen ? "rotate(180deg)" : "none" }} />}
                  </button>

                  <AnimatePresence>
                    {isOpen && isConseq && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <ConsequentialDetail e={e} matter={matter} accent={accent} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Node({ icon: Icon, label, children, accent }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b hair last:border-0">
      <span className="grid place-items-center rounded-lg shrink-0 mt-0.5" style={{ width: 30, height: 30, background: `${accent}18`, border: `1px solid ${accent}33` }}>
        <Icon size={15} style={{ color: accent }} />
      </span>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wide muted-text">{label}</div>
        <div className="text-[13px] mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ConsequentialDetail({ e, matter, accent }) {
  const ob = (matter.obligations || []).find((o) => o.id === e.obligation);
  const bi = (matter.beneficiary_impacts || []).find((b) => b.id === e.beneficiary_impact);
  return (
    <div className="mt-4 pt-4 border-t hair grid grid-cols-2 gap-x-6">
      <div>
        <div className="flex items-center gap-3 mb-1"><ClassTag kind="GOVERNED" /><span className="text-[11.5px] muted-text"><Term k="consequential-event" accent={accent}>What is a Consequential Event?</Term></span></div>
        <Node icon={Zap} label="Trigger" accent={accent}>{e.trigger}</Node>
        <Node icon={FileText} label="Governing Source" accent={accent}>{e.source}</Node>
        <Node icon={ShieldCheck} label="Verification" accent={accent}>{e.verification}</Node>
        <Node icon={GitCommit} label="State Transition" accent={accent}>
          <span className="font-mono text-[12px]">{e.transition.from} → {e.transition.to}</span>
          <ul className="mt-1.5 space-y-1">
            {e.transition.changes.map((c) => <li key={c} className="text-[12px] muted-text">• {c}</li>)}
          </ul>
        </Node>
      </div>
      <div>
        <Node icon={User} label="Conduct" accent={accent}>{e.conduct}</Node>
        {ob && (
          <Node icon={ClipboardList} label="Obligation Created" accent={accent}>
            <div className="flex items-center gap-2">{ob.title} <StatusChip status={ob.status} /></div>
            <div className="text-[11.5px] muted-text mt-1">Owner: {ob.owner} · Due {ob.due}</div>
          </Node>
        )}
        {bi && (
          <Node icon={Users} label="Beneficiary Impact" accent={accent}>
            <div className="flex items-center gap-2"><StatusChip status={bi.impact_status} /></div>
            <div className="text-[12px] mt-1">{bi.what_changed}</div>
          </Node>
        )}
        <Node icon={FileCheck2} label="Evidence" accent={accent}>Source-linked Evidence Instrument recorded ({e.evidence}).</Node>
        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] muted-text">
          <span><Clock size={11} className="inline mr-1" />Effective: {e.effective_time}</span>
          <span><Clock size={11} className="inline mr-1" />Recorded: {e.recorded_time}</span>
          <span><Clock size={11} className="inline mr-1" />Verified: {e.verified_time}</span>
          <span><Clock size={11} className="inline mr-1" />Released: {e.released_time}</span>
        </div>
      </div>
    </div>
  );
}
