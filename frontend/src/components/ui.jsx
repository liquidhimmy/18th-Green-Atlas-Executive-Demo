import React from "react";
import { statusColor } from "../theme";

export function StatusChip({ status, label, testid }) {
  const c = statusColor(status);
  const text = label || (status || "").replace(/_/g, " ");
  return (
    <span className="chip" data-testid={testid}
      style={{ color: c, background: `${c}1f`, border: `1px solid ${c}44` }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c }} />
      {text}
    </span>
  );
}

export function Card({ children, className = "", hover = false, ...rest }) {
  return (
    <div className={`panel ${hover ? "panel-hover" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, sub, action, accent = "#19C37D" }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid place-items-center rounded-xl" style={{ width: 40, height: 40, background: `${accent}1a`, border: `1px solid ${accent}33` }}>
            <Icon size={19} style={{ color: accent }} />
          </span>
        )}
        <div>
          <div className="font-display text-[18px]" style={{ lineHeight: 1.1 }}>{title}</div>
          {sub && <div className="text-[12.5px] muted-text mt-0.5">{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Stat({ value, label, icon: Icon, accent = "#19C37D" }) {
  return (
    <div className="flex flex-col items-center text-center px-2 py-1">
      {Icon && <Icon size={18} style={{ color: accent }} className="mb-1.5" />}
      <div className="font-display text-[26px] leading-none">{value}</div>
      <div className="text-[11px] muted-text mt-1.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function Btn({ children, variant = "primary", accent = "#19C37D", className = "", ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold px-5 py-2.5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? { background: accent, color: "#04150f", border: `1px solid ${accent}` }
      : variant === "outline"
      ? { background: "transparent", color: accent, border: `1px solid ${accent}66` }
      : { background: "transparent", color: "inherit", border: "1px solid rgba(255,255,255,0.14)" };
  return (
    <button className={`${base} ${className} hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0`} style={styles} {...rest}>
      {children}
    </button>
  );
}

export function Avatar({ initials, color = "#19C37D", size = 34 }) {
  return (
    <span className="grid place-items-center rounded-full font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.36, color, background: `${color}22`, border: `1px solid ${color}44` }}>
      {initials}
    </span>
  );
}

export function InfoRow({ icon: Icon, label, value, accent = "#19C37D" }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b hair last:border-0">
      <div className="flex items-center gap-2.5 muted-text text-[13px]">
        {Icon && <Icon size={15} style={{ color: accent }} />} {label}
      </div>
      <div className="text-[13.5px] font-medium text-right">{value}</div>
    </div>
  );
}

export function ClassTag({ kind }) {
  const map = {
    GOVERNED: { c: "#10B981", t: "Governed Record" },
    DERIVED: { c: "#3B82F6", t: "Derived Intelligence" },
    ELICITED: { c: "#8B5CF6", t: "Elicited Context" },
    TRANSFORMED: { c: "#19C37D", t: "Governed Transformation" },
  };
  const m = map[kind] || map.GOVERNED;
  return (
    <span className="chip" style={{ color: m.c, background: `${m.c}18`, border: `1px solid ${m.c}3a` }}>
      {m.t}
    </span>
  );
}
