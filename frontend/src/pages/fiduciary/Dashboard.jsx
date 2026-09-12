import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Landmark, Users, Layers, Boxes, ClipboardList, FileText, ShieldCheck,
  GitBranch, ArrowRight, Clock, CheckCircle2, AlertCircle, Star, Network,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip, Btn } from "../../components/ui";
import { useMatter } from "../../App";
import { ESTATE_IMG, ESTATE_IMG_2 } from "../../assets";

export default function FiduciaryDashboard() {
  const { matter } = useMatter();
  const navigate = useNavigate();
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;

  const current = matter.states.find((s) => s.status === "CURRENT");
  const openOb = matter.obligations.filter((o) => o.status === "OPEN" || o.status === "ESCALATED").length;
  const pendingCS = matter.changesets.filter((c) => c.status === "PROPOSED").length;
  const flow = matter.flow;

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", matter.name]}>
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 rise">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${matter.image === "morgan" ? ESTATE_IMG_2 : ESTATE_IMG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,16,18,0.95) 30%, rgba(6,16,18,0.55) 70%, rgba(6,16,18,0.85))" }} />
        <div className="relative px-7 py-7 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-[34px] leading-none">{matter.name}</h1>
              <Star size={18} style={{ color: "#C69214" }} />
            </div>
            <div className="flex items-center gap-3 mt-3 text-[12.5px] muted-text">
              <StatusChip status="ACTIVE" />
              <span className="font-mono">{matter.matter_id}</span>
              <span>· {matter.people.length} People · {matter.structures.length} Structures · {matter.assets.length} Assets</span>
            </div>
          </div>
          <div className="text-right font-display italic text-[14px]" style={{ color: "#d9c48a", maxWidth: 260 }}>
            {matter.tagline}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Governed state */}
        <Card className="col-span-5 p-5" hover>
          <SectionTitle icon={Landmark} title="Current Governed State"
            action={<button onClick={() => navigate("/fiduciary/matter")}><ArrowRight size={18} style={{ color: "#19C37D" }} /></button>} />
          <div className="flex items-center gap-2 mb-3">
            <span className="font-display text-[19px]" style={{ color: "#19C37D" }}>{current.version}</span>
            <StatusChip status="CURRENT" />
            <span className="text-[12px] muted-text">· Released {current.released_time}</span>
          </div>
          <p className="text-[13px] muted-text mb-4">{current.summary}</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[[Users, matter.people.length, "People"], [Layers, matter.structures.length, "Structures"], [Boxes, matter.assets.length, "Assets"], [ClipboardList, 37, "Obligations"]].map(([I, v, l], i) => (
              <div key={i} className="rounded-xl py-3 text-center" style={{ background: "rgba(25,195,125,0.06)", border: "1px solid rgba(25,195,125,0.15)" }}>
                <I size={16} style={{ color: "#19C37D" }} className="mx-auto mb-1.5" />
                <div className="font-display text-[20px]">{v}</div>
                <div className="text-[10.5px] muted-text uppercase">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)" }}>
            <CheckCircle2 size={18} style={{ color: "#10B981" }} />
            <div><div className="text-[13px] font-semibold">No critical issues</div><div className="text-[11.5px] muted-text">Operations within governance parameters.</div></div>
          </div>
        </Card>

        {/* Relationship map */}
        <Card className="col-span-4 p-5" hover>
          <SectionTitle icon={Network} title="Relationship Map"
            action={<button onClick={() => navigate("/fiduciary/matter")} className="text-[12px]" style={{ color: "#19C37D" }}>Full map →</button>} />
          <RelationshipMap matter={matter} />
        </Card>

        {/* Recent changes */}
        <Card className="col-span-3 p-5" hover>
          <SectionTitle icon={Clock} title="Recent Changes" />
          <div className="space-y-3">
            {[...matter.events].reverse().slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: e.kind === "CONSEQUENTIAL" ? "#C69214" : "#19C37D" }} />
                <div>
                  <div className="text-[12.5px] leading-snug">{e.title}</div>
                  <div className="text-[11px] muted-text">{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Golden path prompt */}
      {matter.interactive && !flow.changeset_approved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-5 panel p-5 flex items-center gap-5" style={{ border: "1px solid rgba(25,195,125,0.4)" }}>
          <span className="grid place-items-center rounded-xl dotpulse" style={{ width: 48, height: 48, background: "rgba(25,195,125,0.14)", color: "#19C37D" }}>
            <GitBranch size={22} />
          </span>
          <div className="flex-1">
            <div className="font-display text-[17px]">{matter.pending_source?.headline || "A new source has arrived for this Matter"}</div>
            <div className="text-[13px] muted-text">{matter.pending_source?.description}</div>
          </div>
          <Btn onClick={() => navigate("/fiduciary/change")} data-testid="start-governed-change">Begin Governed Change <ArrowRight size={16} /></Btn>
        </motion.div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-4 gap-5 mt-5">
        <QuickCard icon={GitBranch} title="ChangeSet Review" sub="Review, verify, approve changes."
          stats={[[pendingCS, "Pending"], [matter.changesets.filter(c=>c.status==="APPROVED").length, "Approved"], [0, "Blocked"]]}
          cta="Review ChangeSets" onClick={() => navigate("/fiduciary/change")} />
        <QuickCard icon={FileText} title="Evidence Instruments" sub="Governed-state artifacts."
          stats={[[matter.evidence_instruments.length, "Total"], [matter.evidence_instruments.length, "Verified"], [0, "Pending"]]}
          cta="View Instruments" onClick={() => navigate("/fiduciary/rac")} />
        <QuickCard icon={ClipboardList} title="Obligations" sub="Track fiduciary duties."
          stats={[[matter.obligations.length, "Total"], [matter.obligations.filter(o=>o.status==="ON_TRACK").length, "On track"], [openOb, "Open"]]}
          cta="View Obligations" onClick={() => navigate("/fiduciary/obligations")} highlight={openOb>0} />
        <QuickCard icon={ShieldCheck} title="R.A.C. Statements" sub="Relationship-and-Conduct: record conduct & alignment."
          stats={[[matter.rac.filter(r=>r.audience==="fiduciary").length, "Fiduciary"], [matter.rac.length, "Total"], [0, "Overdue"]]}
          cta="View R.A.C." onClick={() => navigate("/fiduciary/rac")} />
      </div>
    </LensLayout>
  );
}

function QuickCard({ icon: Icon, title, sub, stats, cta, onClick, highlight }) {
  return (
    <Card className="p-5 flex flex-col" hover>
      <div className="flex items-center gap-2.5 mb-1">
        <Icon size={18} style={{ color: "#19C37D" }} />
        <div className="font-display text-[15.5px]">{title}</div>
      </div>
      <div className="text-[11.5px] muted-text mb-4">{sub}</div>
      <div className="grid grid-cols-3 gap-1 mb-4">
        {stats.map(([v, l], i) => (
          <div key={i} className="text-center">
            <div className="font-display text-[19px]" style={{ color: highlight && l === "Open" ? "#F59E0B" : undefined }}>{v}</div>
            <div className="text-[10px] muted-text">{l}</div>
          </div>
        ))}
      </div>
      <button onClick={onClick} className="mt-auto w-full text-[12.5px] font-semibold py-2 rounded-lg transition-all hover:brightness-110"
        style={{ color: "#19C37D", background: "rgba(25,195,125,0.1)", border: "1px solid rgba(25,195,125,0.25)" }}>
        {cta} →
      </button>
    </Card>
  );
}

function RelationshipMap({ matter }) {
  const trustees = matter.people.filter((p) => ["trustee", "successor"].includes(p.lens_role)).slice(0, 2);
  const bens = matter.people.filter((p) => p.lens_role === "beneficiary").slice(0, 3);
  const core = [...trustees, ...bens].slice(0, 5);
  const positions = [
    { x: 50, y: 12 }, { x: 88, y: 40 }, { x: 74, y: 84 }, { x: 26, y: 84 }, { x: 12, y: 40 },
  ];
  const colorFor = (p) => p.lens_role === "beneficiary" ? "#7C3AED" : p.status === "CURRENT" && p.role.includes("Trustee") ? "#19C37D" : p.status === "INACTIVE" ? "#6B7280" : "#3B82F6";
  return (
    <div className="relative" style={{ height: 210 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {core.map((p, i) => (
          <line key={i} x1="50" y1="48" x2={positions[i].x} y2={positions[i].y} stroke="rgba(25,195,125,0.25)" strokeWidth="0.4" />
        ))}
      </svg>
      <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full text-center"
        style={{ width: 72, height: 72, background: "rgba(25,195,125,0.12)", border: "1px solid rgba(25,195,125,0.4)" }}>
        <div className="text-[9px] leading-tight px-1">{matter.name}</div>
      </div>
      {core.map((p, i) => (
        <div key={p.id} className="ring-node absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}>
          <span className="grid place-items-center rounded-full text-[9px] font-semibold"
            style={{ width: 32, height: 32, color: colorFor(p), background: `${colorFor(p)}22`, border: `1px solid ${colorFor(p)}55` }}>
            {p.initials}
          </span>
          <span className="text-[8.5px] muted-text mt-1 text-center leading-tight max-w-[64px]">{p.name.split(" ")[0]}<br />{p.role.split(" ")[0]}</span>
        </div>
      ))}
    </div>
  );
}

export function Loader() {
  return <div className="grid place-items-center py-40"><div className="font-display text-[18px] muted-text animate-pulse">Loading Atlas…</div></div>;
}
