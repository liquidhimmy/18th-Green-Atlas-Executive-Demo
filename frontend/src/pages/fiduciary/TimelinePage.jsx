import React, { useState } from "react";
import { BarChart3, GitCompare } from "lucide-react";
import LensLayout from "../../components/LensLayout";
import { Card, SectionTitle } from "../../components/ui";
import { Loader } from "./Dashboard";
import { useMatter } from "../../App";
import MatterTimeline from "../../components/MatterTimeline";
import StateComparison from "../../components/StateComparison";

export default function TimelinePage() {
  const { matter } = useMatter();
  const [view, setView] = useState("timeline");
  if (!matter) return <LensLayout lens="fiduciary"><Loader /></LensLayout>;

  return (
    <LensLayout lens="fiduciary" crumbs={["Matters", "Harrington Family Estate", "Matter Timeline"]}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[28px]">Atlas Matter Timeline</h1>
          <div className="text-[13px] muted-text mt-1">The source-linked causal history of consequential events — not an activity feed.</div>
        </div>
        <div className="flex gap-2">
          {[["timeline", "Causal History", BarChart3], ["compare", "State Comparison", GitCompare]].map(([k, l, I]) => (
            <button key={k} onClick={() => setView(k)} data-testid={`timeline-view-${k}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all"
              style={view === k ? { background: "rgba(25,195,125,0.14)", color: "#19C37D", border: "1px solid rgba(25,195,125,0.4)" } : { color: "#9fb3ad", border: "1px solid transparent" }}>
              <I size={15} /> {l}
            </button>
          ))}
        </div>
      </div>

      {view === "timeline" ? (
        <Card className="p-6"><MatterTimeline matter={matter} accent="#19C37D" /></Card>
      ) : (
        <StateComparison matter={matter} accent="#19C37D" />
      )}
    </LensLayout>
  );
}
