import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Users, Sparkles, Lock, ArrowRight, Landmark, Calendar, User,
  FileText, ClipboardList, GitBranch, Building2, Compass, Eye,
} from "lucide-react";
import AtlasMark, { Wordmark } from "../components/AtlasMark";
import { LENSES } from "../theme";
import { useTour } from "../components/TourCard";
import { GlossaryStrip } from "../components/Glossary";
import { Play } from "lucide-react";

const HUB_NODES = [
  { label: "Governed State", icon: Landmark },
  { label: "Conduct", icon: User },
  { label: "Obligations", icon: ClipboardList },
  { label: "Evidence", icon: FileText },
  { label: "R.A.C. Statement", icon: ShieldCheck },
  { label: "MARGARET AI", icon: Sparkles, gold: true },
  { label: "Beneficiary Impact", icon: Users },
  { label: "Consequential Events", icon: Calendar },
];

const FID_STEPS = [
  "Login / Secure Access", "Select Matter", "Upload Governing Source", "Extract Operational Facts",
  "Verify Claims / Review ChangeSet", "Establish Next Governed State", "Record Conduct & Obligations",
  "Generate R.A.C. / Evidence", "Communicate",
];
const BEN_STEPS = [
  "Secure Invitation", "View Relationship Summary", "See What Changed / What Did Not",
  "Read Beneficiary R.A.C.", "Ask MARGARET", "Confirm / Correct Context",
  "Receive Updates", "Contribute Context",
];
const OV_STEPS = [
  "Supervisor Access", "Portfolio / Queue", "Review Exceptions", "Track Handoffs & Transitions",
  "Inspect Source-Linked Evidence", "Approve / Escalate", "Oversight R.A.C.", "Feed Back Into Operations",
];

export default function ThreeLensWorkflow() {
  const navigate = useNavigate();
  const tour = useTour();
  return (
    <div className="grain min-h-screen atlas-dark relative overflow-hidden">
      {/* estate glow */}
      <div className="absolute top-0 right-0 w-[42%] h-[46%] opacity-[0.16] pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 20%, rgba(198,146,20,0.5), transparent 60%)" }} />

      <div className="relative z-[2] max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <Wordmark />
          <div className="text-center flex-1">
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="font-display text-[40px] leading-none">
              18th <span style={{ color: "#19C37D" }}>Green</span> Atlas <span className="text-[26px] opacity-80">— Three-Lens Workflow</span>
            </motion.h1>
            <div className="font-display italic text-[16px] mt-2" style={{ color: "#C69214" }}>
              One matter. One history. Three perspectives.
            </div>
          </div>
          <div className="text-right font-display italic text-[13px] muted-text max-w-[220px] leading-snug">
            Generations are linked by more than assets — they're bound by responsibility.
          </div>
        </div>

        {/* feature chips */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {[[ShieldCheck, "Secure & Encrypted"], [Users, "Fiduciary-Focused"], [Sparkles, "AI-Powered Insights"], [Lock, "Access Controlled"]].map(([I, t]) => (
            <span key={t} className="chip muted-text" style={{ border: "1px solid rgba(120,160,150,0.2)", padding: "6px 14px" }}>
              <I size={14} style={{ color: "#19C37D" }} /> {t}
            </span>
          ))}
          {!tour.active && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
              onClick={tour.start} data-testid="play-story-btn"
              className="chip font-semibold transition-all hover:brightness-110 hover:-translate-y-0.5"
              style={{ background: "#C69214", color: "#1c1405", padding: "8px 18px", boxShadow: "0 0 28px rgba(198,146,20,0.35)" }}>
              <Play size={14} /> Run the Trustee Succession Story
            </motion.button>
          )}
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-12 gap-5 mt-8 items-stretch">
          {/* Fiduciary */}
          <LensColumn className="col-span-3" lens="fiduciary" steps={FID_STEPS}
            icon={Users} onClick={() => navigate("/fiduciary")} audience="Fiduciaries · Trustees · Professionals" />

          {/* Hub */}
          <div className="col-span-6 flex flex-col">
            <div className="text-center mb-2">
              <div className="font-display text-[20px]">Atlas Matter Timeline</div>
              <div className="text-[12px] muted-text tracking-wide">Single Source of Truth</div>
            </div>
            <Hub />
            <div className="text-center text-[12px] muted-text mt-4">Unified history. Verifiable lineage. Trusted outcomes.</div>
            <div className="mx-auto mt-3 max-w-[460px] rounded-xl px-4 py-2.5 text-[12px] leading-snug text-center" data-testid="rac-definition"
              style={{ background: "rgba(25,195,125,0.06)", border: "1px solid rgba(25,195,125,0.2)", color: "#c3d3ce" }}>
              <b style={{ color: "#19C37D" }}>R.A.C. — Relationship-and-Conduct Statement.</b> A plain-language record of what happened, under what authority, on what evidence, and what it means for its reader — generated from the governed history for each audience.
            </div>
            <div className="mt-3"><GlossaryStrip /></div>
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] muted-text">
              {[["#19C37D", "People"], ["#3B82F6", "Structures"], ["#C69214", "Assets"], ["#7C3AED", "Obligations"]].map(([c, t]) => (
                <span key={t} className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 999, background: c }} /> {t}</span>
              ))}
            </div>
          </div>

          {/* Beneficiary */}
          <LensColumn className="col-span-3" lens="beneficiary" steps={BEN_STEPS}
            icon={Users} onClick={() => navigate("/beneficiary")} audience="Beneficiaries · Families · Related Parties" darkCard />
        </div>

        {/* Oversight full width */}
        <div className="mt-5">
          <OversightRow onClick={() => navigate("/oversight")} />
        </div>

        {/* impact legend */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            [Landmark, "Fiduciary actions update governed state."],
            [Users, "Beneficiary impact triggers communication & clarification."],
            [Eye, "Oversight monitors exceptions and conduct."],
            [Compass, "Every consequential change becomes shared causal history."],
          ].map(([I, t]) => (
            <div key={t} className="panel px-4 py-3 flex items-center gap-3 text-[12.5px] muted-text">
              <I size={16} style={{ color: "#19C37D" }} /> {t}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between text-[11.5px] muted-text border-t hair pt-5">
          <span className="font-display italic">Built for trust. Designed for stewardship.</span>
          <span>Functional Reference Experience · Fictional / synthetic data · Not production software.</span>
        </div>
      </div>
    </div>
  );
}

function Hub() {
  const R = 148;
  return (
    <div className="relative mx-auto" style={{ width: 400, height: 400 }}>
      {/* rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 320, height: 320, border: "1px solid rgba(25,195,125,0.16)" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 230, height: 230, border: "1px dashed rgba(198,146,20,0.2)" }} />
      {/* center compass */}
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full"
        style={{ width: 120, height: 120, background: "radial-gradient(circle,#0e2b25,#061613)", border: "2px solid rgba(25,195,125,0.4)", boxShadow: "0 0 50px rgba(25,195,125,0.25)" }}>
        <AtlasMark size={78} />
      </motion.div>
      {/* nodes */}
      {HUB_NODES.map((n, i) => {
        const ang = (i / HUB_NODES.length) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(ang) * R;
        const y = 200 + Math.sin(ang) * R;
        const Icon = n.icon;
        const c = n.gold ? "#C69214" : "#19C37D";
        return (
          <motion.div key={n.label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            className="ring-node absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: x, top: y, width: 92 }}>
            <span className="grid place-items-center rounded-xl"
              style={{ width: 44, height: 44, background: "rgba(8,20,20,0.9)", border: `1px solid ${c}66`, boxShadow: `0 0 18px ${c}33` }}>
              <Icon size={19} style={{ color: c }} />
            </span>
            <span className="text-[10.5px] text-center leading-tight" style={{ color: "#b9cdc6" }}>{n.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function LensColumn({ className, lens, steps, onClick, audience, darkCard }) {
  const L = LENSES[lens];
  return (
    <motion.button initial={{ opacity: 0, x: lens === "beneficiary" ? 24 : -24 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }} onClick={onClick} data-testid={`enter-${lens}`}
      className={`${className} text-left panel panel-hover p-5 group`}
      style={{ border: `1px solid ${L.accent}44` }}>
      <div className="flex items-center gap-2.5 mb-1">
        <Users size={20} style={{ color: L.accent }} />
        <div className="font-display text-[19px]" style={{ color: L.accent }}>{L.name}</div>
      </div>
      <div className="text-[12.5px] mb-1" style={{ color: L.accent2 }}>{L.verb}</div>
      <div className="text-[10px] uppercase tracking-[0.14em] muted-text mb-3">{audience}</div>
      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2.5 text-[12px] py-1.5 px-2.5 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="grid place-items-center rounded-full text-[10px] font-semibold shrink-0"
              style={{ width: 18, height: 18, background: `${L.accent}22`, color: L.accent }}>{i + 1}</span>
            <span style={{ color: "#c3d3ce" }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13px] font-semibold group-hover:gap-3 transition-all" style={{ color: L.accent }}>
        Enter lens <ArrowRight size={15} />
      </div>
    </motion.button>
  );
}

function OversightRow({ onClick }) {
  const L = LENSES.oversight;
  return (
    <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      onClick={onClick} data-testid="enter-oversight" className="w-full text-left panel panel-hover p-5"
      style={{ border: `1px solid ${L.accent}55` }}>
      <div className="flex items-center gap-3 mb-3">
        <ShieldCheck size={22} style={{ color: L.accent }} />
        <div className="font-display text-[19px]" style={{ color: L.accent }}>{L.name}</div>
        <div className="text-[12.5px]" style={{ color: L.accent2 }}>· {L.verb}</div>
        <div className="text-[10px] uppercase tracking-[0.14em] muted-text ml-auto">Supervisors · Committees · Institutions</div>
        <ArrowRight size={16} style={{ color: L.accent }} />
      </div>
      <div className="grid grid-cols-8 gap-2.5">
        {OV_STEPS.map((s, i) => (
          <div key={s} className="flex flex-col gap-1.5 text-[11.5px] py-2.5 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="grid place-items-center rounded-full text-[10px] font-semibold"
              style={{ width: 18, height: 18, background: `${L.accent}22`, color: L.accent }}>{i + 1}</span>
            <span style={{ color: "#c8cbb8" }}>{s}</span>
          </div>
        ))}
      </div>
    </motion.button>
  );
}
