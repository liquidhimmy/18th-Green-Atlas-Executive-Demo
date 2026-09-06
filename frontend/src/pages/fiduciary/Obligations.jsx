import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle, User, Send, Paperclip, Loader2, History, Users,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip, Btn } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import api from "../../api";

export default function Obligations() {
  const { matter, refresh } = useMatter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;

  const notice = matter.obligations.find((o) => o.id === "ob_notice");
  const others = matter.obligations.filter((o) => o.id !== "ob_notice");

  const resolve = async () => {
    setBusy(true);
    await api.obligationAction("ob_notice", { action: "resolve" });
    await refresh();
    setBusy(false);
  };

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", "Harrington Family Estate", "Obligations"]}>
      <div className="mb-5">
        <h1 className="font-display text-[28px]">Obligations</h1>
        <div className="text-[13px] muted-text mt-1">Every obligation has ownership and lifecycle. Governed state creates operational responsibility.</div>
      </div>

      {notice && (
        <Card className="p-6 mb-5" style={{ border: `1px solid ${notice.status === "SATISFIED" ? "rgba(16,185,129,0.4)" : notice.status === "ESCALATED" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid place-items-center rounded-xl" style={{ width: 44, height: 44, background: "rgba(245,158,11,0.12)" }}>
                {notice.status === "SATISFIED" ? <CheckCircle2 size={22} style={{ color: "#10B981" }} /> : <AlertTriangle size={22} style={{ color: notice.status === "ESCALATED" ? "#EF4444" : "#F59E0B" }} />}
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-[18px]">{notice.title}</span>
                  <StatusChip status={notice.status} />
                </div>
                <div className="text-[13px] muted-text mt-1">{notice.detail}</div>
                <div className="flex items-center gap-4 mt-2 text-[12px] muted-text">
                  <span><User size={12} className="inline mr-1" />{notice.owner}</span>
                  <span><Clock size={12} className="inline mr-1" />Due {notice.due}</span>
                  <span>Created by Successor Trustee Activation</span>
                </div>
              </div>
            </div>
            {notice.status !== "SATISFIED" ? (
              <Btn onClick={resolve} disabled={busy} data-testid="resolve-obligation-btn">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Send Notice & Resolve
              </Btn>
            ) : (
              <span className="chip" style={{ color: "#10B981", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Paperclip size={12} /> Completion evidence attached
              </span>
            )}
          </div>

          {/* lifecycle */}
          <div className="mt-5 pt-4 border-t hair">
            <div className="text-[11px] uppercase tracking-wide muted-text mb-3 flex items-center gap-2"><History size={13} /> Lifecycle</div>
            <div className="space-y-2.5">
              {(notice.history || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-[12.5px]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#19C37D" }} />
                  <div><span className="font-medium">{h.actor}</span> <span className="muted-text">— {h.action}</span></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <SectionTitle icon={ClipboardList} title="All obligations" sub="Standing fiduciary duties on this Matter" />
      <div className="grid grid-cols-2 gap-4">
        {others.map((o) => (
          <Card key={o.id} className="p-4 flex items-start gap-3" hover>
            <span className="grid place-items-center rounded-lg mt-0.5" style={{ width: 34, height: 34, background: "rgba(25,195,125,0.1)" }}><ClipboardList size={16} style={{ color: "#19C37D" }} /></span>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="text-[14px] font-medium">{o.title}</span><StatusChip status={o.status} /></div>
              <div className="text-[12px] muted-text mt-1">{o.detail}</div>
              <div className="flex items-center gap-4 mt-1.5 text-[11.5px] muted-text"><span>{o.owner}</span><span>Due {o.due}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {matter.beneficiary_impacts.length > 0 && (
        <div className="mt-6">
          <SectionTitle icon={Users} title="Beneficiary impact" sub="Structured — never improvised" />
          {matter.beneficiary_impacts.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center gap-2 mb-3"><StatusChip status={b.impact_status} /><span className="text-[13px] muted-text">Sarah Harrington · Primary Beneficiary</span></div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <Field label="What changed" v={b.what_changed} />
                <Field label="What did not change" v={b.what_did_not_change} />
                <Field label="What it means" v={b.what_it_means} />
                <Field label="Action required" v={b.action_required} />
              </div>
              <button onClick={() => navigate("/beneficiary")} className="mt-4 text-[12.5px] font-semibold" style={{ color: "#19C37D" }}>View from beneficiary lens →</button>
            </Card>
          ))}
        </div>
      )}
    </LensLayout>
  );
}

function Field({ label, v }) {
  return <div><div className="text-[11px] uppercase tracking-wide muted-text mb-1">{label}</div><div>{v}</div></div>;
}
