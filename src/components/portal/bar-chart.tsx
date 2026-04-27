"use client";

const C = {
  amber: "#F5A623",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

interface BarChartDatum {
  label: string;
  v: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  color?: string;
}

export function BarChart({ data, color = C.amber }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.v));
  const W = 480,
    H = 120,
    padL = 0,
    padB = 24,
    barW = Math.floor((W - padL) / data.length - 4);

  const formatValue = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v);

  return (
    <svg viewBox={`0 0 ${W} ${H + padB}`} style={{ width: "100%" }}>
      {data.map((d, i) => {
        const bh = max > 0 ? Math.max(4, (d.v / max) * H) : 4;
        const x = padL + i * ((W - padL) / data.length);
        const y = H - bh;
        return (
          <g key={i}>
            <rect
              x={x + 2}
              y={y}
              width={barW}
              height={bh}
              rx="3"
              fill={color}
              opacity="0.85"
            />
            <text
              x={x + 2 + barW / 2}
              y={H + padB - 4}
              textAnchor="middle"
              fontSize="9"
              fill={C.faint}
              fontFamily="Outfit, sans-serif"
            >
              {d.label}
            </text>
            {d.v > 0 && (
              <text
                x={x + 2 + barW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="8"
                fill={C.muted}
                fontFamily="Outfit, sans-serif"
              >
                {formatValue(d.v)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
