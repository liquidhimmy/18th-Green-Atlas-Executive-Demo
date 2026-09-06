import React, { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { StatusChip } from "./ui";

export default function StateComparison({ matter, accent = "#19C37D" }) {
  const states = matter?.states || [];
  const current = states.find((s) => s.status === "CURRENT") || states[states.length - 1];
  const others = states.filter((s) => s.version !== current?.version);
  const [leftV, setLeftV] = useState(others.length ? others[others.length - 1].version : current?.version);
  const left = states.find((s) => s.version === leftV) || others[0];
  const right = current;
  if (!left || !right) return null;

  const rows = [
    ["Checkpoint", left.version, right.version],
    ["Trustee", left.trustee, right.trustee],
    ["Trustee status", left.trustee_status, right.trustee_status],
    ["Authority basis", left.authority, right.authority],
    ["Effective time", left.effective_time, right.effective_time],
    ["Recorded time", left.recorded_time, right.recorded_time],
    ["Verified time", left.verified_time, right.verified_time],
    ["Released time", left.released_time, right.released_time],
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[12.5px] muted-text">Compare checkpoint</span>
        <select value={leftV} onChange={(e) => setLeftV(e.target.value)} data-testid="state-compare-select"
          className="bg-transparent border hair rounded-lg px-3 py-1.5 text-[13px] outline-none"
          style={{ color: accent }}>
          {states.filter((s) => s.version !== current.version).map((s) => (
            <option key={s.version} value={s.version} style={{ color: "#000" }}>{s.version} — {s.title}</option>
          ))}
        </select>
        <ArrowRight size={16} style={{ color: accent }} />
        <span className="chip" style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}44` }}>
          {current.version} · Current
        </span>
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-[200px_1fr_1fr]">
          <div className="px-4 py-3 text-[11px] uppercase tracking-wide muted-text border-b hair">Field</div>
          <div className="px-4 py-3 text-[13px] font-semibold border-b border-l hair">{left.version} <span className="muted-text font-normal">· {left.status}</span></div>
          <div className="px-4 py-3 text-[13px] font-semibold border-b border-l hair" style={{ color: accent }}>{right.version} · Current</div>
          {rows.map(([label, a, b], i) => {
            const changed = String(a) !== String(b);
            return (
              <React.Fragment key={i}>
                <div className="px-4 py-3 text-[12.5px] muted-text border-b hair last:border-0">{label}</div>
                <div className="px-4 py-3 text-[13px] border-b border-l hair last:border-0">{a}</div>
                <div className="px-4 py-3 text-[13px] border-b border-l hair last:border-0"
                  style={changed ? { background: `${accent}12`, color: accent, fontWeight: 600 } : {}}>{b}</div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="text-[11.5px] muted-text mt-3 flex items-center gap-2">
        <Clock size={12} /> Atlas preserves distinct effective, recorded, verified, and released times — never collapsed into one date.
      </div>
    </div>
  );
}
