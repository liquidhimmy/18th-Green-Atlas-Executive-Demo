import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home, FolderKanban, Users, Layers, ClipboardList, ShieldCheck, GitBranch,
  FileText, BarChart3, Bell, Search, Settings, LogOut, RotateCcw, Sparkles,
  Compass, ChevronDown, Moon, Send, Check, Play,
} from "lucide-react";
import { LENSES } from "../theme";
import { Wordmark } from "./AtlasMark";
import Margaret from "./Margaret";
import { useMatter } from "../App";
import { useTour } from "./TourCard";
import { primaryBeneficiary } from "../helpers";

const NAV = {
  fiduciary: [
    { to: "/fiduciary", label: "Dashboard", icon: Home },
    { to: "/fiduciary/matter", label: "Matter Overview", icon: FolderKanban },
    { to: "/fiduciary/change", label: "Governed Change", icon: GitBranch, badge: "flow" },
    { to: "/fiduciary/timeline", label: "Matter Timeline", icon: BarChart3 },
    { to: "/fiduciary/obligations", label: "Obligations", icon: ClipboardList },
    { to: "/fiduciary/communications", label: "Communications", icon: Send },
    { to: "/fiduciary/rac", label: "R.A.C. & Evidence", icon: ShieldCheck },
  ],
  oversight: [
    { to: "/oversight", label: "Portfolio", icon: Layers },
    { to: "/oversight/matter", label: "Matter Oversight", icon: FolderKanban },
  ],
  beneficiary: [
    { to: "/beneficiary", label: "My Relationship", icon: Home },
    { to: "/beneficiary/rac", label: "R.A.C. Statement", icon: ShieldCheck },
  ],
};

export default function LensLayout({ lens, children, subtitle, crumbs = [] }) {
  const L = LENSES[lens];
  const dark = L.mode === "dark";
  const nav = NAV[lens] || [];
  const navigate = useNavigate();
  const location = useLocation();
  const { resetDemo, matter, matters, matterId, switchMatter } = useMatter();
  const tour = useTour();
  const [margaretOpen, setMargaretOpen] = useState(false);
  const [mSel, setMSel] = useState(false);
  const [resetting, setResetting] = useState(false);

  const doReset = async () => { setResetting(true); await resetDemo(); setResetting(false); };

  return (
    <div className={`grain min-h-screen ${dark ? "atlas-dark" : "atlas-light"}`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-[248px] shrink-0 border-r hair flex flex-col py-5 px-4"
          style={{ background: dark ? "rgba(6,16,18,0.5)" : "rgba(255,255,255,0.7)" }}>
          <Link to="/"><Wordmark light={!dark} /></Link>

          <div className="mt-7 mb-2 px-2 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: L.accent }}>
            {L.name}
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              const Icon = n.icon;
              return (
                <button key={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`}
                  onClick={() => navigate(n.to)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 text-left"
                  style={{
                    background: active ? L.soft : "transparent",
                    color: active ? L.accent : dark ? "#c8d6d1" : "#3c4a57",
                    border: active ? `1px solid ${L.accent}44` : "1px solid transparent",
                  }}>
                  <Icon size={17} /> <span className="flex-1">{n.label}</span>
                  {n.badge === "flow" && <span className="dotpulse" style={{ color: L.accent }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: L.accent, display: "block" }} /></span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t hair">
            <div className="px-2 mb-2 text-[10.5px] uppercase tracking-[0.16em] muted-text">Switch lens</div>
            <div className="flex flex-col gap-1">
              {Object.values(LENSES).filter((x) => x.key !== lens).map((x) => (
                <button key={x.key} data-testid={`switch-${x.key}`}
                  onClick={() => navigate(x.key === "fiduciary" ? "/fiduciary" : x.key === "beneficiary" ? "/beneficiary" : "/oversight")}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all hover:brightness-110"
                  style={{ color: x.accent }}>
                  <Compass size={15} /> {x.name}
                </button>
              ))}
            </div>
            <div className="mt-3 px-2 font-display italic text-[13px] muted-text leading-snug">
              One matter.<br />One history.<br />Three perspectives.
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 relative z-[2]">
          {/* Topbar */}
          <header className="h-16 shrink-0 flex items-center gap-4 px-7 border-b hair"
            style={{ background: dark ? "rgba(8,18,20,0.35)" : "rgba(255,255,255,0.6)" }}>
            <div className="flex items-center gap-2 text-[13px] muted-text min-w-0">
              {crumbs.map((c, i) => (
                <React.Fragment key={i}>
                  <span className="truncate" style={{ color: i === crumbs.length - 1 ? (dark ? "#EAF2EF" : "#14202b") : undefined }}>{c}</span>
                  {i < crumbs.length - 1 && <span className="opacity-40">/</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="relative">
              <button onClick={() => setMSel(!mSel)} data-testid="matter-selector"
                className="flex items-center gap-2 px-3 py-2 rounded-full border hair text-[13px]"
                style={{ background: dark ? "rgba(255,255,255,0.03)" : "#fff", color: L.accent }}>
                <FolderKanban size={14} />
                <span className="font-medium">{matter?.name || "Select Matter"}</span>
                <ChevronDown size={14} className={mSel ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {mSel && (
                <div className="absolute z-30 mt-2 w-[280px] rounded-2xl p-2 fadein"
                  style={{ background: dark ? "#0a1618" : "#fff", border: `1px solid ${L.accent}33`, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
                  {matters.map((m) => (
                    <button key={m.id} data-testid={`matter-option-${m.id}`}
                      onClick={() => { switchMatter(m.id); setMSel(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-white/[0.04]"
                      style={m.id === matterId ? { background: L.soft } : {}}>
                      <FolderKanban size={16} style={{ color: L.accent }} />
                      <div className="flex-1">
                        <div className="text-[13px] font-medium" style={{ color: dark ? "#EAF2EF" : "#14202b" }}>{m.name}</div>
                        <div className="text-[11px] muted-text font-mono">{m.id} · {m.checkpoint}</div>
                      </div>
                      {m.id === matterId && <Check size={15} style={{ color: L.accent }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 max-w-[300px] hidden xl:flex items-center gap-2 px-3 py-2 rounded-full border hair"
              style={{ background: dark ? "rgba(255,255,255,0.03)" : "#fff" }}>
              <Search size={15} className="muted-text" />
              <input placeholder="Search…"
                className="bg-transparent outline-none text-[13px] w-full muted-text" />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border hair muted-text">⌘K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              {!tour.active && (
                <button data-testid="topbar-play-story-btn" onClick={tour.start}
                  className="chip" style={{ color: "#C69214", background: "rgba(198,146,20,0.12)", border: "1px solid rgba(198,146,20,0.4)" }}>
                  <Play size={13} /> Run Succession Story
                </button>
              )}
              <button data-testid="ask-margaret-btn" onClick={() => setMargaretOpen(true)}
                className="chip" style={{ color: L.accent, background: L.soft, border: `1px solid ${L.accent}44` }}>
                <Sparkles size={13} /> Ask MARGARET
              </button>
              <button data-testid="reset-demo-btn" onClick={doReset} disabled={resetting}
                className="chip muted-text" style={{ border: "1px solid rgba(150,160,160,0.25)" }}>
                <RotateCcw size={13} className={resetting ? "animate-spin" : ""} /> Reset
              </button>
              <span className="w-px h-6 hair border-l" />
              <Moon size={16} className="muted-text" />
              <UserBadge lens={lens} />
            </div>
          </header>

          {subtitle}
          <main className="flex-1 overflow-y-auto px-7 py-6" style={tour.active ? { paddingBottom: 220 } : {}}>{children}</main>
        </div>
      </div>

      {margaretOpen && <Margaret lens={lens} onClose={() => setMargaretOpen(false)} />}
    </div>
  );
}

function UserBadge({ lens }) {
  const L = LENSES[lens];
  const { matter } = useMatter();
  const ben = primaryBeneficiary(matter);
  const person = {
    fiduciary: { n: matter?.officer || "James Morgan", r: "Fiduciary Officer", i: "JM" },
    beneficiary: { n: ben.name, r: "Beneficiary", i: ben.initials },
    oversight: { n: "Patricia Vance", r: "Oversight Supervisor", i: "PV" },
  }[lens];
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid place-items-center rounded-full font-semibold"
        style={{ width: 34, height: 34, fontSize: 12, color: L.accent, background: `${L.accent}22`, border: `1px solid ${L.accent}55` }}>
        {person.i}
      </span>
      <div className="leading-tight hidden md:block">
        <div className="text-[13px] font-semibold">{person.n}</div>
        <div className="text-[11px] muted-text">{person.r}</div>
      </div>
    </div>
  );
}
