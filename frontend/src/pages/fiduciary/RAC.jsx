import React, { useState } from "react";
import { ShieldCheck, FileText } from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle, StatusChip } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import RACStatement from "../../components/RACStatement";
import EvidenceInstrument from "../../components/EvidenceInstrument";

export default function FiduciaryRAC() {
  const { matter } = useMatter();
  const [evId, setEvId] = useState(null);
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;

  const fidRac = matter.rac.find((r) => r.audience === "fiduciary");
  const selectedEv = matter.evidence_instruments.find((e) => e.id === evId) || matter.evidence_instruments[matter.evidence_instruments.length - 1];

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", "Harrington Family Estate", "R.A.C. & Evidence"]}>
      <div className="mb-5">
        <h1 className="font-display text-[28px]">R.A.C. & Evidence</h1>
        <div className="text-[13px] muted-text mt-1">One event can produce three R.A.C. perspectives without creating three versions of reality.</div>
      </div>

      <SectionTitle icon={ShieldCheck} title="Fiduciary R.A.C." sub="What did we do, under what authority, and what remains outstanding" />
      {fidRac ? <RACStatement rac={fidRac} accent="#19C37D" /> : (
        <Card className="p-8 text-center muted-text text-[13px]">No R.A.C. yet. Complete the Governed Change workflow to generate the Successor Trustee Activation R.A.C.</Card>
      )}

      <div className="mt-8">
        <SectionTitle icon={FileText} title="Evidence Instruments" sub="Portable, source-linked representations of governed state" />
        <div className="flex gap-2 mb-4">
          {matter.evidence_instruments.map((e) => (
            <button key={e.id} onClick={() => setEvId(e.id)} data-testid={`evidence-tab-${e.state_version}`}
              className="px-4 py-2 rounded-full text-[12.5px] font-medium transition-all"
              style={(selectedEv?.id === e.id) ? { background: "rgba(25,195,125,0.14)", color: "#19C37D", border: "1px solid rgba(25,195,125,0.4)" } : { color: "#9fb3ad", border: "1px solid transparent" }}>
              {e.state_version} · {e.transition_type}
            </button>
          ))}
        </div>
        <EvidenceInstrument instrument={selectedEv} accent="#19C37D" />
      </div>
    </LensLayout>
  );
}
