import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, User, GitCommit, ClipboardList, Users, FileText, ShieldCheck,
  CheckCircle2, ArrowUpRight, UserCheck, Bell, Loader2, RefreshCw,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip } from "../../components/ui";
import { useMatter } from "../../App";
import { featuredEvent, featuredObligation } from "../../helpers";
import RACStatement from "../../components/RACStatement";
import api from "../../api";

const GOLD = "#C69214";

export default function OversightMatter() {
  const { matter, refresh, matterId } = useMatter();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  if (!matter) return <LensLayout lens="oversight"><div className="py-40 text-center muted-text">Loading…</div></LensLayout>;

  const event = featuredEvent(matter);
  const notice = featuredObligation(matter);
  const ovRac = matter.rac.find((r) => r.audience === "oversight");
  const resolved = !notice || notice.status === "SATISFIED";
  const comm = (matter.communications || [])[matter.communications.length - 1];

  if (!event) {
    return (
      <LensLayout lens="oversight" crumbs={["Oversight", matter.name]}>
        <Card className="p-10 text-center">
          <ShieldCheck size={40} style={{ color: GOLD }} className="mx-auto mb-3" />
          <div className="font-display text-[20px]">No exception on this Matter yet</div>
          <div className="text-[13px] muted-text mt-2">{matter.name} will surface here once a consequential change creates an open obligation.</div>
        </Card>
      </LensLayout>
    );
  }

  const act = async (action) => {
    setBusy(action);
    await api.obligationAction(matterId, notice.id, { action });
    await refresh();
    setBusy(null);
  };

  return (
    <LensLayout lens="oversight" crumbs={["Oversight", "Attention Queue", matter.name]}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[28px]">{matter.name} — Oversight</h1>
          <div className="text-[13px] muted-text mt-1">Understand why the Matter surfaced without reconstructing it manually.</div>
        </div>
        <StatusChip status={notice?.status} />
      </div>

      <Card className="p-5 mb-5" style={{ border: `1px solid ${resolved ? "rgba(16,185,129,0.4)" : "rgba(198,146,20,0.4)"}` }}>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center rounded-xl" style={{ width: 44, height: 44, background: resolved ? "rgba(16,185,129,0.12)" : "rgba(198,146,20,0.12)" }}>
            {resolved ? <CheckCircle2 size={22} style={{ color: "#10B981" }} /> : <AlertTriangle size={22} style={{ color: GOLD }} />}
          </span>
          <div>
            <div className="font-display text-[17px]">{resolved ? "Exception closed" : "Why this Matter surfaced"}</div>
            <div className="text-[13px] muted-text">{resolved
              ? "The obligation was resolved and completion evidence recorded. The exception has closed and the Matter Timeline updated."
              : `The obligation '${notice.title}' created by ${event.title} remains open beyond its expected window.`}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-5 gap-4 mb-5">
        <Fact icon={User} label="Responsible officer" value={notice?.owner || matter.officer} />
        <Fact icon={GitCommit} label="Triggering event" value={event.title} />
        <Fact icon={ClipboardList} label="Current obligation" value={<StatusChip status={notice?.status} />} />
        <Fact icon={RefreshCw} label="State transition" value={`${event.transition.from} → ${event.transition.to}`} />
        <Fact icon={Users} label="Beneficiary impact" value={(matter.beneficiary_impacts[0] || {}).impact_status || "—"} />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-7 p-6">
          <SectionTitle icon={FileText} title="Evidence & Conduct" sub="Source-linked fiduciary conduct" accent={GOLD} />
          <div className="space-y-3">
            {[
              ["Governing source", event.source, "VERIFIED"],
              ["Professional confirmation", event.verification, "VERIFIED"],
              ["Conduct record", event.conduct, "VERIFIED"],
              ["Obligation", notice?.title, notice?.status],
              ["Communication status", resolved ? (comm ? `${comm.type} delivered to ${comm.to}` : "Delivered") : "Pending delivery", resolved ? "SENT" : "OPEN"],
            ].map(([k, v, st], i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b hair last:border-0">
                <div className="flex-1"><div className="text-[11px] uppercase tracking-wide muted-text">{k}</div><div className="text-[13px] mt-0.5">{v}</div></div>
                <StatusChip status={st} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-5 p-6 h-fit">
          <SectionTitle icon={ShieldCheck} title="Supervisory Action" accent={GOLD} />
          {resolved ? (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-[13px]" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle2 size={16} /> Resolved by fiduciary. No further action required.
            </div>
          ) : (
            <>
              <p className="text-[12.5px] muted-text mb-4">Oversight is part of the operating loop — acknowledge, assign, or escalate. Guidance feeds back into fiduciary operations.</p>
              <div className="space-y-2.5">
                <ActionBtn icon={Bell} label="Acknowledge & monitor" onClick={() => act("acknowledge")} busy={busy === "acknowledge"} testid="oversight-acknowledge" />
                <ActionBtn icon={UserCheck} label="Assign to officer" onClick={() => act("assign")} busy={busy === "assign"} testid="oversight-assign" />
                <ActionBtn icon={ArrowUpRight} label="Escalate for resolution" primary onClick={() => act("escalate")} busy={busy === "escalate"} testid="oversight-escalate" />
              </div>
              {notice?.status === "ESCALATED" && (
                <div className="mt-4 rounded-xl px-4 py-3 text-[12.5px]" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
                  Escalated. Resolve in the Fiduciary lens → Communications to close the loop.
                  <button onClick={() => navigate("/fiduciary/communications")} className="block mt-1.5 font-semibold" style={{ color: GOLD }}>Go to Communication Hub →</button>
                </div>
              )}
            </>
          )}
          <div className="mt-5 pt-4 border-t hair">
            <div className="text-[11px] uppercase tracking-wide muted-text mb-2">Obligation lifecycle</div>
            {(notice?.history || []).map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[12px] py-1"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GOLD }} /><div><b>{h.actor}</b> <span className="muted-text">{h.action}</span></div></div>
            ))}
          </div>
        </Card>
      </div>

      {ovRac && (
        <div className="mt-6">
          <SectionTitle icon={ShieldCheck} title="Oversight R.A.C." sub="Conduct, exceptions, and supervisory attention" accent={GOLD} />
          <RACStatement rac={ovRac} accent={GOLD} />
        </div>
      )}
    </LensLayout>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <Icon size={16} style={{ color: GOLD }} />
      <div className="text-[10.5px] uppercase tracking-wide muted-text mt-2">{label}</div>
      <div className="text-[13.5px] font-medium mt-1">{value}</div>
    </Card>
  );
}
function ActionBtn({ icon: Icon, label, onClick, busy, primary, testid }) {
  return (
    <button onClick={onClick} disabled={busy} data-testid={testid}
      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all hover:brightness-110"
      style={primary ? { background: GOLD, color: "#1c1405" } : { background: "rgba(198,146,20,0.1)", color: GOLD, border: "1px solid rgba(198,146,20,0.3)" }}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />} {label}
    </button>
  );
}
