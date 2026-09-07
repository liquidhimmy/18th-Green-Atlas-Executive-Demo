import React, { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, ShieldAlert, FileCheck2 } from "lucide-react";
import { LENSES } from "../theme";
import api from "../api";
import { ClassTag } from "./ui";
import { useMatter } from "../App";

const SUGGESTED = {
  beneficiary: ["What does this trustee change mean for me?", "Do I need to do anything?", "Who is my trustee now?"],
  fiduciary: ["What is outstanding on this Matter?", "Summarize the current governed state"],
  oversight: ["Why did this Matter surface?", "Are these delays officer-specific?"],
};

export default function Margaret({ lens, onClose }) {
  const L = LENSES[lens];
  const { refresh, matterId, matter } = useMatter();
  const [msgs, setMsgs] = useState([
    { role: "margaret", text: "I make governed information understandable — and ask useful questions where the record alone cannot tell us enough. I do not establish governed truth.", intro: true },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [elicit, setElicit] = useState(null);
  const scroller = useRef(null);

  useEffect(() => { scroller.current?.scrollTo(0, scroller.current.scrollHeight); }, [msgs]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    if (elicit) {
      // treat as elicitation answer -> elicited context
      await api.elicitedContext(matterId, { person: lens === "beneficiary" ? (matter?.people?.find((p) => p.lens_role === "beneficiary")?.name || "Beneficiary") : "User", text: q });
      await refresh();
      setMsgs((m) => [...m, {
        role: "margaret", elicited: true,
        text: "Thank you. I've stored that as elicited context. It does not silently become institutional truth — if it's consequential, it enters the review and verification workflow.",
      }]);
      setElicit(null);
      setBusy(false);
      return;
    }
    const r = await api.askMargaret({ audience: lens, prompt: q, matter_id: matterId });
    setMsgs((m) => [...m, { role: "margaret", text: r.text, sources: r.sources, elicit: r.elicit }]);
    if (r.elicit) setElicit(r.elicit);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fadein" onClick={onClose} />
      <div className="relative w-[420px] max-w-full h-full flex flex-col rise"
        style={{ background: L.mode === "dark" ? "#0a1618" : "#ffffff", borderLeft: `1px solid ${L.accent}33` }}
        data-testid="margaret-panel">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: `${L.accent}22` }}>
          <span className="grid place-items-center rounded-xl" style={{ width: 40, height: 40, background: `${L.accent}1c`, border: `1px solid ${L.accent}44` }}>
            <Sparkles size={19} style={{ color: L.accent }} />
          </span>
          <div className="flex-1">
            <div className="font-display text-[17px]" style={{ color: L.mode === "dark" ? "#EAF2EF" : "#14202b" }}>MARGARET</div>
            <div className="text-[11.5px]" style={{ color: L.accent }}>Interpretation & elicitation layer</div>
          </div>
          <button onClick={onClose} data-testid="margaret-close"><X size={20} className="opacity-70 hover:opacity-100" style={{ color: L.mode === "dark" ? "#EAF2EF" : "#14202b" }} /></button>
        </div>

        <div ref={scroller} className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
          style={{ color: L.mode === "dark" ? "#dbe7e3" : "#1b2733" }}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed"
                style={m.role === "user"
                  ? { background: L.accent, color: "#04150f" }
                  : { background: L.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f4f6f8", border: `1px solid ${L.accent}22` }}>
                {m.elicited && <div className="mb-1.5"><ClassTag kind="ELICITED" /></div>}
                {m.text}
                {m.sources && (
                  <div className="mt-2.5 pt-2.5 border-t flex flex-wrap gap-1.5" style={{ borderColor: `${L.accent}22` }}>
                    {m.sources.map((s, j) => (
                      <span key={j} className="chip text-[10.5px]" style={{ color: L.accent, background: `${L.accent}14` }}>
                        <FileCheck2 size={11} /> {s}
                      </span>
                    ))}
                  </div>
                )}
                {m.elicit && (
                  <div className="mt-2.5 pt-2.5 border-t text-[12.5px] italic" style={{ borderColor: `${L.accent}22`, color: L.accent }}>
                    <ShieldAlert size={13} className="inline mr-1" />{m.elicit}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="text-[12px] muted-text italic">MARGARET is thinking…</div>}
          {msgs.length <= 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {(SUGGESTED[lens] || []).map((s) => (
                <button key={s} onClick={() => send(s)} data-testid="margaret-suggestion"
                  className="chip text-[12px]" style={{ color: L.accent, background: `${L.accent}12`, border: `1px solid ${L.accent}30` }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: `${L.accent}22` }}>
          {elicit && <div className="text-[11px] mb-2" style={{ color: L.accent }}>Your reply becomes elicited context (not governed truth).</div>}
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5"
            style={{ background: L.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f4f6f8", border: `1px solid ${L.accent}30` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              data-testid="margaret-input" placeholder="Ask MARGARET…"
              className="bg-transparent outline-none text-[13.5px] w-full" style={{ color: L.mode === "dark" ? "#EAF2EF" : "#14202b" }} />
            <button onClick={() => send()} data-testid="margaret-send" className="shrink-0"><Send size={17} style={{ color: L.accent }} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
