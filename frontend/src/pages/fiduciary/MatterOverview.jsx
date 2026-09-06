import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark, Users, Layers, Boxes, ClipboardList, Scale, MapPin, Calendar,
  User, ShieldCheck, ArrowRight,
} from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip, InfoRow, Avatar, Btn } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import { statusColor } from "../../theme";

const TABS = ["Overview", "People & Authority", "Structures", "Assets"];
const money = (n) => "$" + n.toLocaleString();

export default function MatterOverview() {
  const { matter } = useMatter();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;
  const current = matter.states.find((s) => s.status === "CURRENT");
  const totalAssets = matter.assets.reduce((s, a) => s + a.value, 0);

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", "Harrington Family Estate", "Overview"]}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[28px]">Matter Overview</h1>
          <div className="text-[13px] muted-text mt-1">The Matter is the canonical operating root — one governed relationship.</div>
        </div>
        <Btn variant="outline" onClick={() => navigate("/fiduciary/change")} data-testid="overview-begin-change">Begin Governed Change <ArrowRight size={15} /></Btn>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t.toLowerCase().replace(/[^a-z]/g,"-")}`}
            className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
            style={tab === t ? { background: "rgba(25,195,125,0.14)", color: "#19C37D", border: "1px solid rgba(25,195,125,0.4)" }
              : { color: "#9fb3ad", border: "1px solid transparent" }}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-5 p-5">
            <SectionTitle icon={Landmark} title="Current Governed State" sub={`${current.version} · ${current.title}`} />
            <InfoRow icon={User} label="Current Trustee" value={<span className="flex items-center gap-2">{current.trustee} <StatusChip status={current.trustee_status} /></span>} />
            <InfoRow icon={Scale} label="Authority basis" value={current.authority} />
            <InfoRow icon={MapPin} label="Jurisdiction" value={matter.jurisdiction} />
            <InfoRow icon={Calendar} label="Effective / Released" value={`${current.effective_time} / ${current.released_time}`} />
            <InfoRow icon={ShieldCheck} label="Matter type" value={matter.matter_type} />
            <p className="text-[12.5px] muted-text mt-3">{current.summary}</p>
          </Card>
          <Card className="col-span-4 p-5">
            <SectionTitle icon={Boxes} title="Asset Summary" />
            <div className="font-display text-[30px]" style={{ color: "#19C37D" }}>{money(totalAssets)}</div>
            <div className="text-[12px] muted-text mb-4">Across {matter.assets.length} governed assets</div>
            <div className="space-y-2">
              {matter.assets.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[12.5px]">
                  <span className="muted-text">{a.name}</span><span className="font-mono">{money(a.value)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="col-span-3 p-5">
            <SectionTitle icon={ClipboardList} title="State Lineage" />
            <div className="space-y-2.5">
              {matter.states.map((s) => (
                <div key={s.version} className="flex items-center gap-2.5">
                  <span className="font-mono text-[12.5px]" style={{ color: s.status === "CURRENT" ? "#19C37D" : "#8FA6A0" }}>{s.version}</span>
                  <StatusChip status={s.status} />
                  <span className="text-[11px] muted-text truncate">{s.title}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/fiduciary/timeline")} className="mt-4 text-[12.5px] font-semibold" style={{ color: "#19C37D" }}>Open Matter Timeline →</button>
          </Card>
        </div>
      )}

      {tab === "People & Authority" && (
        <div className="grid grid-cols-2 gap-4">
          {matter.people.map((p) => (
            <Card key={p.id} className="p-4 flex items-start gap-3" hover>
              <Avatar initials={p.initials} color={statusColor(p.status)} size={42} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px]">{p.name}</span>
                  <StatusChip status={p.status} />
                </div>
                <div className="text-[12.5px]" style={{ color: "#19C37D" }}>{p.role}</div>
                <div className="text-[12px] muted-text mt-1">{p.detail}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Structures" && (
        <div className="grid grid-cols-2 gap-4">
          {matter.structures.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-3" hover>
              <span className="grid place-items-center rounded-xl" style={{ width: 42, height: 42, background: "rgba(25,195,125,0.12)" }}><Layers size={19} style={{ color: "#19C37D" }} /></span>
              <div className="flex-1">
                <div className="font-display text-[15px]">{s.name}</div>
                <div className="text-[12px] muted-text">{s.type} · Established {s.established}</div>
              </div>
              <StatusChip status="ACTIVE" label={s.status} />
            </Card>
          ))}
        </div>
      )}

      {tab === "Assets" && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_160px_140px_120px] px-5 py-3 text-[11px] uppercase tracking-wide muted-text border-b hair">
            <span>Asset</span><span>Type</span><span>Location</span><span className="text-right">Value</span>
          </div>
          {matter.assets.map((a) => (
            <div key={a.id} className="grid grid-cols-[1fr_160px_140px_120px] px-5 py-3.5 text-[13px] border-b hair last:border-0 items-center hover:bg-white/[0.02]">
              <span className="font-medium">{a.name}</span>
              <span className="muted-text">{a.type}</span>
              <span className="muted-text text-[12px]">{a.location}</span>
              <span className="text-right font-mono" style={{ color: "#19C37D" }}>{money(a.value)}</span>
            </div>
          ))}
        </Card>
      )}
    </LensLayout>
  );
}
