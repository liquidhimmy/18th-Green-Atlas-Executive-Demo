import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, X, Loader2, Sparkles } from "lucide-react";
import { STORY } from "../tour";
import { LENSES } from "../theme";
import { useMatter } from "../App";

const TourContext = createContext(null);
export const useTour = () => useContext(TourContext);
const AUTO_MS = 9000;

export function TourProvider({ children }) {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [busy, setBusy] = useState(false);
  const start = useCallback(() => { setIdx(0); setActive(true); setAuto(true); }, []);
  const stop = useCallback(() => { setActive(false); setAuto(false); }, []);
  return (
    <TourContext.Provider value={{ active, idx, setIdx, auto, setAuto, busy, setBusy, start, stop }}>
      {children}
    </TourContext.Provider>
  );
}

export default function TourCard() {
  const tour = useTour();
  const { refresh, switchMatter } = useMatter();
  const navigate = useNavigate();
  const { active, idx, setIdx, auto, setAuto, busy, setBusy, stop } = tour;
  const step = STORY[idx];
  const lastRun = useRef(-1);

  useEffect(() => {
    if (!active || lastRun.current === idx) return;
    lastRun.current = idx;
    navigate(step.route);
    if (!step.action) return;
    let cancelled = false;
    setBusy(true);
    step.action({ refresh, switchMatter }).catch(() => {}).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line
  }, [active, idx]);

  useEffect(() => { if (!active) lastRun.current = -1; }, [active]);

  useEffect(() => {
    if (!active || !auto || busy) return;
    if (idx >= STORY.length - 1) { setAuto(false); return; }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, STORY.length - 1)), AUTO_MS);
    return () => clearTimeout(t);
  }, [active, auto, busy, idx, setIdx, setAuto]);

  if (!active) return null;
  const L = LENSES[step.lens];
  const last = idx === STORY.length - 1;

  return (
    <AnimatePresence>
      <motion.div key="tour" initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 40, x: "-50%" }}
        className="fixed left-1/2 bottom-6 z-[80] w-[min(720px,92vw)]" data-testid="tour-card">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(7,17,19,0.92)", backdropFilter: "blur(18px)", border: `1px solid ${L.accent}66`, boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 40px ${L.accent}22`, color: "#EAF2EF" }}>
          <div className="h-[3px] w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full" animate={{ width: `${((idx + 1) / STORY.length) * 100}%` }} style={{ background: L.accent }} />
          </div>
          <div className="px-6 pt-4 pb-5">
            <div className="flex items-center gap-3 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: L.accent }}>
              <Sparkles size={13} /> Play the story · {L.name}
              <span className="ml-auto font-mono normal-case tracking-normal" style={{ color: "#8FA6A0" }} data-testid="tour-step-counter">{idx + 1} / {STORY.length}</span>
              <button onClick={stop} className="rounded-full p-1 hover:bg-white/10" data-testid="tour-exit-btn" aria-label="Exit story"><X size={15} style={{ color: "#8FA6A0" }} /></button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                <div className="font-display text-[20px] mt-2.5 leading-snug" data-testid="tour-step-title">{step.title}</div>
                <p className="text-[13.5px] mt-1.5 leading-relaxed" style={{ color: "#c3d3ce" }} data-testid="tour-step-text">{step.text}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setAuto(!auto)} data-testid="tour-autoplay-btn"
                className="chip" style={{ color: L.accent, background: L.soft, border: `1px solid ${L.accent}55` }}>
                {auto ? <Pause size={13} /> : <Play size={13} />} {auto ? "Pause" : "Autoplay"}
              </button>
              {busy && <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8FA6A0" }} data-testid="tour-busy"><Loader2 size={13} className="animate-spin" /> Atlas is working…</span>}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0 || busy} data-testid="tour-back-btn"
                  className="chip disabled:opacity-40" style={{ color: "#c3d3ce", border: "1px solid rgba(150,160,160,0.25)" }}><ChevronLeft size={14} /> Back</button>
                {last ? (
                  <button onClick={stop} data-testid="tour-finish-btn" className="chip font-semibold" style={{ background: L.accent, color: "#0b1410" }}>Finish</button>
                ) : (
                  <button onClick={() => setIdx(idx + 1)} disabled={busy} data-testid="tour-next-btn"
                    className="chip font-semibold disabled:opacity-60" style={{ background: L.accent, color: "#0b1410" }}>Next <ChevronRight size={14} /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
