"use client";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: { label: string; v: number }[];
  color?: string;
}

export function LineChart({ data, color = "#F5A623" }: LineChartProps) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,140,200,0.08)" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#6B84A8", fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            hide={true} 
            domain={[300, 850]}
          />
          <Tooltip
            contentStyle={{
              background: "#0C1A30",
              border: "1px solid rgba(100,140,200,0.12)",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
            itemStyle={{ color: color, fontSize: 13, fontWeight: 600 }}
            labelStyle={{ color: "#6B84A8", fontSize: 11, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: "#E2EAF4", strokeWidth: 2 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
