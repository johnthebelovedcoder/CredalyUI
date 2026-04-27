"use client";

import React from "react";

const C = {
  bg: "#06101E",
  s1: "#0C1A30",
  s2: "#112240",
  s3: "#162C52",
  border: "rgba(100,140,200,0.12)",
  borderHover: "rgba(100,140,200,0.22)",
  amber: "#F5A623",
  amberFaint: "rgba(245,166,35,0.1)",
  amberGlow: "rgba(245,166,35,0.2)",
  teal: "#00C9A7",
  tealFaint: "rgba(0,201,167,0.1)",
  red: "#EF4444",
  redFaint: "rgba(239,68,68,0.1)",
  orange: "#F97316",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  success: "#22C55E",
  successFaint: "rgba(34,197,94,0.1)",
};

function scoreColor(s: number) {
  if (s >= 780) return C.teal;
  if (s >= 700) return C.success;
  if (s >= 620) return C.amber;
  if (s >= 540) return C.orange;
  return C.red;
}

function scoreBand(s: number) {
  if (s >= 780) return "Excellent";
  if (s >= 700) return "Good";
  if (s >= 620) return "Fair";
  if (s >= 540) return "Poor";
  return "Very Poor";
}

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge = React.memo(function ScoreGauge({ score }: ScoreGaugeProps) {
  const pct = Math.max(0, Math.min(1, (score - 300) / 550));
  const cx = 120, cy = 108, r = 82;
  const angle = Math.PI * (1 - pct);
  const eX = cx + r * Math.cos(angle);
  const eY = cy - r * Math.sin(angle);
  const color = scoreColor(score);

  const zones = [
    { start: 0, end: (540 - 300) / 550, color: C.red },
    { start: (540 - 300) / 550, end: (620 - 300) / 550, color: C.orange },
    { start: (620 - 300) / 550, end: (700 - 300) / 550, color: C.amber },
    { start: (700 - 300) / 550, end: (780 - 300) / 550, color: C.success },
    { start: (780 - 300) / 550, end: 1, color: C.teal },
  ];

  const arcPath = (p1: number, p2: number, radius: number) => {
    const a1 = Math.PI * (1 - p1);
    const a2 = Math.PI * (1 - p2);
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy - radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy - radius * Math.sin(a2);
    const large = p2 - p1 > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="0 0 240 130" className="w-full max-w-[280px]" role="img" aria-label={`Credit score gauge showing ${score}`}>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={C.s3}
        strokeWidth="16"
        strokeLinecap="round"
      />
      {zones.map((z, i) => (
        <path
          key={i}
          d={arcPath(z.start, z.end, r + 12)}
          fill="none"
          stroke={z.color}
          strokeWidth="3"
          opacity="0.35"
        />
      ))}
      {pct > 0.01 && (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${eX} ${eY}`}
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
        />
      )}
      {pct > 0.01 && <circle cx={eX} cy={eY} r={5} fill={color} />}
      <text
        x={cx}
        y={cy + 3}
        textAnchor="middle"
        fontSize="36"
        fontWeight="700"
        fill={C.text}
        fontFamily="Outfit, sans-serif"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fontSize="10"
        fill={color}
        fontFamily="Outfit, sans-serif"
        fontWeight="600"
        letterSpacing="1"
      >
        {scoreBand(score).toUpperCase()}
      </text>
      <text
        x={cx - r + 2}
        y={cy + 16}
        fontSize="8.5"
        fill={C.faint}
        fontFamily="Outfit, sans-serif"
      >
        300
      </text>
      <text
        x={cx + r - 14}
        y={cy + 16}
        fontSize="8.5"
        fill={C.faint}
        fontFamily="Outfit, sans-serif"
      >
        850
      </text>
    </svg>
  );
});
