import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card } from "../../components/ui";
import { useMatter } from "../../App";
import RACStatement from "../../components/RACStatement";

export default function BeneficiaryRAC() {
  const { matter } = useMatter();
  if (!matter) return <LensLayout lens="beneficiary"><div className="py-40 text-center muted-text">Loading…</div></LensLayout>;
  const rac = matter.rac.find((r) => r.audience === "beneficiary");

  return (
    <LensLayout lens="beneficiary" crumbs={[matter.name, "R.A.C. Statement"]}>
      <div className="mb-5">
        <h1 className="font-display text-[28px]">Your R.A.C. Statement</h1>
        <p className="text-[14px] mt-1" style={{ color: "#465468" }}>A plain-language record of what happened, why it mattered, and what it means for you.</p>
      </div>
      {rac ? <RACStatement rac={rac} accent="#7C3AED" light /> : (
        <Card className="p-8 text-center" style={{ color: "#465468" }}>
          There are no recent changes affecting you. When something changes, your R.A.C. Statement will appear here.
        </Card>
      )}
      <div className="mt-5 rounded-2xl p-5 flex items-center gap-3" style={{ background: "#EDE7FF" }}>
        <Sparkles size={20} style={{ color: "#7C3AED" }} />
        <div className="text-[13.5px]" style={{ color: "#3b2a5c" }}>
          Have a question about this statement? Ask MARGARET — she explains in plain language and can pass along anything that needs professional review.
        </div>
      </div>
    </LensLayout>
  );
}
