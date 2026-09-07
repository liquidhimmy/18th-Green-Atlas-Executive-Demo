import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, FolderKanban, UserCog, Workflow } from "lucide-react";
import { Card, SectionTitle, StatusChip, ClassTag } from "./ui";
import api from "../api";

const GOLD = "#C69214";
const ICON = { MATTER: FolderKanban, OFFICER: UserCog, PROCESS: Workflow };
const SIGNAL = { PRESENT: "#EF4444", DIFFERENTIATED: "#3B82F6", PARTIAL: "#F59E0B", "NOT PRESENT": "#10B981", INSUFFICIENT: "#6B7280" };

export default function PortfolioIntelligence({ refreshKey }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.getIntelligence().then(setData).catch(() => setData(null)); }, [refreshKey]);
  if (!data) return null;
  const [h, m] = data.matters;
  const rows = [
    ["Officer", (x) => x.officer], ["Checkpoint", (x) => <span className="font-mono">{x.checkpoint}</span>],
    ["Consequential event", (x) => x.event], ["Transition", (x) => <span className="font-mono">{x.transition}</span>],
    ["Open obligation", (x) => x.obligation], ["Status", (x) => <StatusChip status={x.obligation_status} />],
    ["Days open", (x) => `${x.days_open}d`], ["Communications", (x) => x.comms],
  ];
  return (
    <div className="mt-6" data-testid="portfolio-intelligence">
      <SectionTitle icon={BrainCircuit} title="Portfolio Intelligence" accent={GOLD}
        sub="Is the delay about this Matter, this officer, or this process? Compared from authorized operational metadata only."
        action={<ClassTag kind="DERIVED" />} />
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-5 overflow-hidden">
          <div className="grid grid-cols-[130px_1fr_1fr] text-[11px] uppercase tracking-wide muted-text border-b hair">
            <div className="px-4 py-2.5">Metadata</div>
            <div className="px-3 py-2.5 border-l hair" style={{ color: GOLD }}>Harrington</div>
            <div className="px-3 py-2.5 border-l hair" style={{ color: GOLD }}>Morgan</div>
          </div>
          {rows.map(([label, fn]) => (
            <div key={label} className="grid grid-cols-[130px_1fr_1fr] text-[12.5px] border-b hair last:border-0" data-testid={`intel-row-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              <div className="px-4 py-2.5 muted-text">{label}</div>
              <div className="px-3 py-2.5 border-l hair">{fn(h)}</div>
              <div className="px-3 py-2.5 border-l hair">{fn(m)}</div>
            </div>
          ))}
        </Card>
        <div className="col-span-7 grid grid-cols-3 gap-4">
          {data.patterns.map((p, i) => {
            const Icon = ICON[p.kind];
            const c = SIGNAL[p.signal] || GOLD;
            return (
              <motion.div key={p.kind} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="p-4 h-full flex flex-col" data-testid={`intel-pattern-${p.kind.toLowerCase()}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} style={{ color: GOLD }} />
                    <span className="font-display text-[15px]">{p.label}</span>
                  </div>
                  <span className="chip self-start text-[10px]" style={{ color: c, background: `${c}18`, border: `1px solid ${c}44` }} data-testid={`intel-signal-${p.kind.toLowerCase()}`}>{p.signal}</span>
                  <p className="text-[12px] mt-2.5 leading-relaxed" style={{ color: "#c8cbb8" }}>{p.reading}</p>
                  <div className="mt-auto pt-3 space-y-1">
                    {p.evidence.map((e, j) => <div key={j} className="text-[10.5px] muted-text font-mono truncate">· {e}</div>)}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="text-[11px] muted-text mt-3">{data.basis} Patterns are derived intelligence for supervisory attention — they do not adjudicate conduct.</div>
    </div>
  );
}
