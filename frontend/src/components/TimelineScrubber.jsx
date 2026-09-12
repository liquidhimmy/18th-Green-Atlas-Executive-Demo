import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, User, Landmark, ClipboardList, Calendar, History } from "lucide-react";
import { Card, StatusChip } from "./ui";

export default function TimelineScrubber({ matter, accent = "#19C37D" }) {
  const states = useMemo(() => [...(matter?.states || [])], [matter?.states]);
  const [idx, setIdx] = useState(states.length - 1);
  useEffect(() => { setIdx(states.length - 1); }, [states, setIdx]);
  if (!states.length) return null;
  const sel = states[idx] || states[states.length - 1];
  const asOf = sel.released_time;

  const eventsAsOf = (matter.events || []).filter((e) => e.date <= asOf).sort((a, b) => (a.date > b.date ? 1 : -1));
  const obsAsOf = (matter.obligations || []).filter((o) => {
    const ev = (matter.events || []).find((e) => e.id === o.created_by);
    return ev ? ev.date <= asOf : true;
  });
  const isLatest = idx === states.length - 1;

  return (
    <div>
      <ScrubberRail states={states} idx={idx} setIdx={setIdx} accent={accent} />

      {/* Snapshot */}
      <motion.div key={sel.version} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-display text-[22px]" style={{ color: accent }}>{sel.version}</span>
          <StatusChip status={isLatest ? sel.status : "AS_OF"} label={isLatest ? sel.status : `As of ${asOf}`} />
          <span className="text-[13px] muted-text">{sel.title}</span>
        </div>
        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-5 p-5">
            <div className="text-[11px] uppercase tracking-wide muted-text mb-3">Governed state snapshot</div>
            <Row icon={User} label="Trustee" value={<span className="flex items-center gap-2">{sel.trustee} <StatusChip status={sel.trustee_status} /></span>} accent={accent} />
            <Row icon={Calendar} label="Effective" value={sel.effective_time} accent={accent} />
            <Row icon={Clock} label="Released" value={sel.released_time} accent={accent} />
            <Row icon={Landmark} label="Authority" value={sel.authority} accent={accent} />
            <p className="text-[12.5px] muted-text mt-3">{sel.summary}</p>
          </Card>
          <Card className="col-span-4 p-5">
            <div className="text-[11px] uppercase tracking-wide muted-text mb-3">Events up to this checkpoint</div>
            <div className="space-y-2.5">
              {eventsAsOf.map((e) => (
                <div key={e.id} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: e.kind === "CONSEQUENTIAL" ? "#C69214" : accent }} />
                  <div><div className="text-[12.5px]">{e.title}</div><div className="text-[10.5px] muted-text">{e.date} · {e.state_version}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="col-span-3 p-5">
            <div className="text-[11px] uppercase tracking-wide muted-text mb-3 flex items-center gap-2"><ClipboardList size={13} /> Obligations then</div>
            <div className="space-y-2">
              {obsAsOf.map((o) => (
                <div key={o.id} className="text-[12px]">
                  <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />{o.title}</div>
                </div>
              ))}
              {obsAsOf.length === 0 && <div className="text-[12px] muted-text">None recorded.</div>}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

function ScrubberRail({ states, idx, setIdx, accent }) {
  return (
    <Card className="p-6 mb-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>
          <History size={14} /> Checkpoint Scrubber
        </div>
        <span className="text-[12px] muted-text">Drag or click a checkpoint to view the Matter as it was then</span>
      </div>
      <div className="relative px-2">
        <div className="absolute left-2 right-2 top-[15px] h-[3px] rounded-full" style={{ background: "rgba(120,160,150,0.2)" }} />
        <div className="absolute left-2 top-[15px] h-[3px] rounded-full" style={{ background: accent, width: `calc(${(idx / Math.max(states.length - 1, 1)) * 100}% )` }} />
        <div className="relative flex justify-between">
          {states.map((s, i) => {
            const active = i === idx;
            const past = i <= idx;
            return (
              <button key={s.version} onClick={() => setIdx(i)} data-testid={`scrubber-node-${s.version}`}
                className="flex flex-col items-center gap-2 group" style={{ width: `${100 / states.length}%` }}>
                <motion.span animate={{ scale: active ? 1.25 : 1 }} className="grid place-items-center rounded-full z-[2]"
                  style={{ width: 32, height: 32, background: past ? accent : "rgba(8,20,20,0.95)", color: past ? "#04150f" : accent, border: `2px solid ${accent}${past ? "" : "55"}` }}>
                  <Landmark size={14} />
                </motion.span>
                <div className="text-center">
                  <div className="font-mono text-[12px]" style={{ color: active ? accent : undefined }}>{s.version}</div>
                  <div className="text-[10px] muted-text max-w-[110px] leading-tight">{s.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <input type="range" min={0} max={states.length - 1} value={idx} onChange={(e) => setIdx(Number(e.target.value))}
        data-testid="scrubber-range" className="w-full mt-5 accent-emerald" style={{ accentColor: accent }} />
    </Card>
  );
}

function Row({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b hair last:border-0">
      <div className="flex items-center gap-2.5 muted-text text-[13px]"><Icon size={15} style={{ color: accent }} /> {label}</div>
      <div className="text-[13px] font-medium text-right">{value}</div>
    </div>
  );
}
