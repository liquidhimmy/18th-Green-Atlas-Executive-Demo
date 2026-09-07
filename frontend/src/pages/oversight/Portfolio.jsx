import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Layers, AlertTriangle, CheckCircle2, Bell, ShieldCheck, ArrowRight, Users, Boxes, ClipboardList, FileText,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip } from "../../components/ui";
import { useMatter } from "../../App";
import { statusColor } from "../../theme";

const GOLD = "#C69214";

export default function OversightPortfolio() {
  const { portfolio, matter, switchMatter } = useMatter();
  const navigate = useNavigate();
  if (!portfolio || !matter) return <LensLayout lens="oversight"><div className="py-40 text-center muted-text">Loading…</div></LensLayout>;
  const s = portfolio.summary;
  const total = portfolio.portfolio.length;
  const seg = [["#10B981", s.on_track], ["#F59E0B", s.needs_attention], ["#EF4444", s.exception + s.escalated]];

  return (
    <LensLayout lens="oversight" crumbs={["Oversight", "Portfolio"]}>
      <div className="mb-5">
        <h1 className="font-display text-[28px]">Portfolio Overview</h1>
        <div className="text-[13px] muted-text mt-1">Supervision by exception, not reconstruction — where does human supervisory attention belong?</div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-8 p-6">
          <div className="grid grid-cols-4 gap-4 items-center">
            {[[Layers, s.trusts, "Trusts", GOLD], [Users, 12, "Entities", "#3B82F6"], [ClipboardList, s.obligations, "Obligations", "#7C3AED"], [FileText, s.evidence_items, "Evidence Items", "#10B981"]].map(([I, v, l, c], i) => (
              <div key={i} className="text-center">
                <I size={18} style={{ color: c }} className="mx-auto mb-1.5" />
                <div className="font-display text-[26px]">{v}</div>
                <div className="text-[10.5px] muted-text uppercase">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t hair flex items-center gap-6">
            <Donut segments={seg} total={total} />
            <div className="space-y-2">
              {[["#10B981", "On Track", s.on_track], ["#F59E0B", "Needs Attention", s.needs_attention], ["#EF4444", "Exception / Escalated", s.exception + s.escalated]].map(([c, l, v]) => (
                <div key={l} className="flex items-center gap-2.5 text-[13px]"><span style={{ width: 10, height: 10, borderRadius: 999, background: c }} /> {l} <span className="ml-auto font-mono muted-text">{v}</span></div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="col-span-4 p-6">
          <SectionTitle icon={CheckCircle2} title="Conduct Snapshot" accent={GOLD} />
          {["All key documents sourced", "Distribution policies enforced", "Audit trail complete"].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-[13px] py-1.5"><CheckCircle2 size={15} style={{ color: "#10B981" }} /> {t}</div>
          ))}
          <div className="mt-3 rounded-xl px-4 py-3 text-[12.5px]" style={{ background: "rgba(198,146,20,0.1)", border: "1px solid rgba(198,146,20,0.3)", color: GOLD }}>
            {portfolio.harrington_flagged ? "1 matter requires supervisory attention" : "No matters currently require escalation"}
          </div>
        </Card>
      </div>

      {/* Attention queue */}
      <div className="mt-6">
        <SectionTitle icon={Bell} title="Attention Queue" sub="Matters surfaced by exception" accent={GOLD} />
        <Card className="overflow-hidden">
          {portfolio.attention.length === 0 && <div className="px-5 py-6 text-[13px] muted-text">No exceptions in the queue.</div>}
          {portfolio.attention.map((m, i) => {
            const c = statusColor(m.health);
            const nav = m.navigable;
            const open = () => { if (nav) { switchMatter(m.id); navigate("/oversight/matter"); } };
            return (
              <motion.button key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={open} data-testid={`attention-${m.id}`}
                className="w-full text-left grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 border-b hair last:border-0 hover:bg-white/[0.02] transition-colors"
                style={nav ? { background: "rgba(198,146,20,0.05)" } : {}}>
                <AlertTriangle size={18} style={{ color: c }} />
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-medium">{m.name}</span>
                    {nav && <span className="chip text-[10px]" style={{ color: GOLD, background: `${GOLD}18` }}>Navigable</span>}
                    <StatusChip status={m.health} />
                  </div>
                  <div className="text-[12px] muted-text mt-0.5">{m.reason} · Officer: {m.officer}</div>
                </div>
                <span className="text-[12.5px]" style={{ color: c }}>{m.days_flag} days open</span>
                {nav ? <ArrowRight size={16} style={{ color: GOLD }} /> : <span className="w-4" />}
              </motion.button>
            );
          })}
        </Card>
      </div>
    </LensLayout>
  );
}

function Donut({ segments, total }) {
  const R = 42, C = 2 * Math.PI * R;
  let offset = 0;
  const sum = segments.reduce((a, [, v]) => a + v, 0) || 1;
  return (
    <div className="relative" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {segments.map(([c, v], i) => {
          const len = (v / sum) * C;
          const el = <circle key={i} cx="60" cy="60" r={R} fill="none" stroke={c} strokeWidth="14"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center"><div className="font-display text-[24px]">{total}</div><div className="text-[10px] muted-text uppercase">Matters</div></div>
      </div>
    </div>
  );
}
