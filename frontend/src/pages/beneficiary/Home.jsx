import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flag, CheckCircle2, XCircle, BookOpen, Sparkles, ShieldCheck, Clock,
  ArrowRight, Download, Home, Info,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, StatusChip, Btn } from "../../components/ui";
import { useMatter } from "../../App";
import { ESTATE_IMG_2 } from "../../assets";

function Loader() { return <div className="grid place-items-center py-40"><div className="font-display text-[18px] muted-text animate-pulse">Loading…</div></div>; }

export default function BeneficiaryHome() {
  const { matter } = useMatter();
  const navigate = useNavigate();
  if (!matter) return <LensLayout lens="beneficiary"><Loader /></LensLayout>;

  const current = matter.states.find((s) => s.status === "CURRENT");
  const impact = matter.beneficiary_impacts.find((b) => b.person_id === "p_sarah");
  const changed = matter.flow.changeset_approved;

  return (
    <LensLayout lens="beneficiary" crumbs={["Harrington Family Estate", "My Relationship"]}>
      {/* calm hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 rise" style={{ minHeight: 190 }}>
        <div className="absolute inset-0" style={{ backgroundImage: `url(${ESTATE_IMG_2})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.96) 34%, rgba(255,255,255,0.7) 62%, rgba(255,255,255,0.3))" }} />
        <div className="relative px-8 py-8">
          <h1 className="font-display text-[34px]">Welcome, Sarah</h1>
          <p className="text-[15px] mt-2 max-w-[520px]" style={{ color: "#465468" }}>
            Your trusted view into the Harrington Family Estate. Information, guidance, and support at every step.
          </p>
          <div className="flex items-center gap-3 mt-4 text-[12.5px]" style={{ color: "#465468" }}>
            <StatusChip status="ACTIVE" /> <span className="font-mono">{matter.matter_id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Current checkpoint */}
        <Card className="col-span-4 p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: "#7C3AED" }}><Flag size={14} /> Current Checkpoint</div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[24px]">{current.version}</span>
            <StatusChip status="CURRENT" label="Current" />
          </div>
          <div className="text-[13px] mt-2" style={{ color: "#465468" }}>Your trust relationship is up to date. Released {current.released_time}.</div>
          <div className="mt-4 rounded-xl p-4 flex items-center gap-3" style={{ background: "#EDE7FF" }}>
            <BookOpen size={18} style={{ color: "#7C3AED" }} />
            <div>
              <div className="text-[13px] font-semibold">Family Stewardship Guide</div>
              <button className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: "#7C3AED" }} data-testid="download-guide-btn"><Download size={12} /> Download PDF</button>
            </div>
          </div>
        </Card>

        {/* What changed / did not */}
        <Card className="col-span-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: "#7C3AED" }}><Info size={14} /> What Changed / What Did Not</div>
            <button onClick={() => navigate("/beneficiary/rac")} className="text-[12.5px] font-semibold" style={{ color: "#7C3AED" }}>Read full R.A.C. →</button>
          </div>
          {changed && impact ? (
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold mb-3" style={{ color: "#7C3AED" }}><CheckCircle2 size={16} /> What changed</div>
                <p className="text-[14px] leading-relaxed">{impact.what_changed}</p>
                <p className="text-[13px] mt-2" style={{ color: "#465468" }}>{impact.what_it_means}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold mb-3" style={{ color: "#10B981" }}><ShieldCheck size={16} /> What did not change</div>
                <p className="text-[14px] leading-relaxed">{impact.what_did_not_change}</p>
                <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2 text-[13px]" style={{ background: "#EEF2F4", color: "#0F5C4D" }}>
                  <CheckCircle2 size={15} /> {impact.action_required}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[14px]" style={{ color: "#465468" }}>Your relationship is currently up to date. There are no recent changes that affect you. We'll let you know here if anything changes.</div>
          )}
        </Card>

        {/* Ask MARGARET */}
        <Card className="col-span-7 p-6">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center rounded-xl" style={{ width: 46, height: 46, background: "#EDE7FF" }}><Sparkles size={22} style={{ color: "#7C3AED" }} /></span>
            <div className="flex-1">
              <div className="font-display text-[18px]">Ask MARGARET</div>
              <div className="text-[13px]" style={{ color: "#465468" }}>Get answers in plain language, with source-backed guidance.</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["What does this trustee change mean for me?", "Do I need to do anything?"].map((q) => (
              <div key={q} className="rounded-xl px-4 py-3 text-[13px] cursor-default" style={{ background: "#F6F7F9", border: "1px solid #EDE7FF" }}>“{q}”</div>
            ))}
          </div>
          <div className="text-[12px] mt-3" style={{ color: "#7C3AED" }}>Use the “Ask MARGARET” button in the top bar to start a conversation.</div>
        </Card>

        {/* Your role */}
        <Card className="col-span-5 p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: "#7C3AED" }}><Home size={14} /> Your Relationship</div>
          {[["Your role", "Beneficiary"], ["Current trustee", current.trustee], ["Trust type", matter.matter_type], ["Jurisdiction", matter.jurisdiction]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "#EEF2F4" }}>
              <span className="text-[13px]" style={{ color: "#465468" }}>{k}</span>
              <span className="text-[13.5px] font-medium">{v}</span>
            </div>
          ))}
        </Card>
      </div>
    </LensLayout>
  );
}
