import React from "react";

// 18th Green Atlas compass-rose mark
export default function AtlasMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <circle cx="50" cy="50" r="47" stroke="#19C37D" strokeWidth="2.5" fill="#072B24" />
      <circle cx="50" cy="50" r="38" stroke="rgba(198,146,20,0.5)" strokeWidth="1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const long = deg % 90 === 0;
        const len = long ? 40 : 26;
        const w = long ? 8 : 5;
        const rad = (deg * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * len;
        const y = 50 - Math.cos(rad) * len;
        const px = 50 + Math.cos(rad) * (w / 2);
        const py = 50 + Math.sin(rad) * (w / 2);
        const px2 = 50 - Math.cos(rad) * (w / 2);
        const py2 = 50 - Math.sin(rad) * (w / 2);
        return (
          <polygon
            key={i}
            points={`${x},${y} ${px},${py} ${px2},${py2}`}
            fill={long ? (i % 4 === 0 ? "#C69214" : "#19C37D") : "rgba(25,195,125,0.55)"}
          />
        );
      })}
      <circle cx="50" cy="50" r="6" fill="#C69214" />
      <circle cx="50" cy="50" r="2.5" fill="#072B24" />
    </svg>
  );
}

export function Wordmark({ light = false, tagline = true }) {
  return (
    <div className="flex items-center gap-3">
      <AtlasMark size={38} />
      <div className="leading-none">
        <div className="font-display text-[19px] tracking-tight" style={{ color: light ? "#0b1220" : "#EAF2EF" }}>
          18th <span style={{ color: "#19C37D" }}>Green</span> Atlas
        </div>
        {tagline && (
          <div className="text-[10px] tracking-[0.18em] uppercase mt-1" style={{ color: light ? "#8a94a3" : "#7f9a92" }}>
            powered by SLIM
          </div>
        )}
      </div>
    </div>
  );
}
