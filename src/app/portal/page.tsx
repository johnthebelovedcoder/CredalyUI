"use client";

import { BarChart } from "@/components/portal/bar-chart";
import { Badge, KpiCard } from "@/components/portal/ui-primitives";
import { usePipelineHealth, useModelMetrics } from "@/lib/hooks";
import { BarChart3, Target, CheckCircle, Zap, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  orange: "#F97316",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  success: "#22C55E",
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

export default function PortalOverviewPage() {
  const { data: pipelines, isLoading: pipelineLoading } = usePipelineHealth();
  const { data: metrics, isLoading: metricsLoading } = useModelMetrics();

  const pipelineCount = useMemo(
    () => (Array.isArray(pipelines) ? pipelines.length : 0),
    [pipelines]
  );

  const totalScores = useMemo(
    () => (metrics?.total_scores_computed ? metrics.total_scores_computed.toLocaleString() : "—"),
    [metrics]
  );

  const avgGini = useMemo(
    () => (metrics?.gini_coefficient ? metrics.gini_coefficient.toFixed(3) : "—"),
    [metrics]
  );

  const recentScores = [
    { bvn: "224•••••678", score: 712, band: "HIGH", coverage: 84, ts: "2 min ago", amount: "₦150,000" },
    { bvn: "223•••••341", score: 648, band: "MEDIUM", coverage: 61, ts: "18 min ago", amount: "₦80,000" },
    { bvn: "225•••••902", score: 589, band: "MEDIUM", coverage: 72, ts: "41 min ago", amount: "₦200,000" },
    { bvn: "221•••••155", score: 731, band: "HIGH", coverage: 91, ts: "1 hr ago", amount: "₦50,000" },
    { bvn: "224•••••773", score: 450, band: "LOW", coverage: 43, ts: "2 hrs ago", amount: "₦120,000" },
  ];

  const weekData = [
    { label: "Mon", v: 312 }, { label: "Tue", v: 489 }, { label: "Wed", v: 401 },
    { label: "Thu", v: 617 }, { label: "Fri", v: 528 }, { label: "Sat", v: 203 }, { label: "Sun", v: 145 },
  ];

  const isLoading = pipelineLoading || metricsLoading;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-credaly-text m-0">
          Good morning, Ifeoma
        </h1>
        <p className="text-credaly-muted text-[13px] m-0 mt-1">
          Here&apos;s your credit intelligence overview for today
        </p>
      </div>

      {isLoading && (
        <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.15)] rounded-lg p-3 mb-5 flex gap-2.5 items-start">
          <AlertTriangle size={16} className="text-credaly-amber shrink-0 mt-0.5" />
          <p className="text-xs text-credaly-muted m-0">
            Loading metrics from backend. Some data may be delayed.
          </p>
        </div>
      )}

      {/* KPI Row */}
      <div className="flex gap-3.5 mb-6 flex-wrap">
        <KpiCard
          label="Active Sources"
          value={pipelineCount > 0 ? pipelineCount.toString() : "—"}
          delta={pipelineCount > 0 ? { up: true, text: "Data pipelines connected" } : { up: false, text: "No pipelines detected" }}
          icon={<BarChart3 size={18} />}
        />
        <KpiCard
          label="Total Scores"
          value={totalScores}
          delta={metrics?.model_version ? { up: true, text: `v${metrics.model_version}` } : undefined}
          color={C.teal}
          icon={<Target size={18} />}
        />
        <KpiCard
          label="Model Gini"
          value={avgGini}
          delta={metrics?.gini_coefficient ? { up: true, text: metrics.gini_coefficient > 0.4 ? "Excellent" : "Good" } : undefined}
          color={C.success}
          icon={<CheckCircle size={18} />}
        />
        <KpiCard
          label="Platform Status"
          value={pipelineLoading ? "—" : "Online"}
          delta={{ up: true, text: "All services operational" }}
          color={C.muted}
          icon={<Zap size={18} />}
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[20px_20px_12px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[12px] text-credaly-muted m-0 uppercase tracking-[0.05em]">API Calls</p>
              <p className="text-[20px] font-bold text-credaly-text m-0 mt-0.5">
                2,695 <span className="text-[12px] text-credaly-muted font-normal">this week</span>
              </p>
            </div>
            <Badge label="LIVE" color={C.teal} />
          </div>
          <BarChart data={weekData} color={C.amber} />
        </div>

        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5">
          <p className="text-[12px] text-credaly-muted m-0 mb-3.5 uppercase tracking-[0.05em]">Score Distribution</p>
          {[
            { label: "Excellent (780–850)", pct: 14, color: C.teal },
            { label: "Good (700–779)", pct: 29, color: C.success },
            { label: "Fair (620–699)", pct: 33, color: C.amber },
            { label: "Poor (540–619)", pct: 16, color: C.orange },
            { label: "Very Poor (<540)", pct: 8, color: C.red },
          ].map((item) => (
            <div key={item.label} className="mb-2.5">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-credaly-muted">{item.label}</span>
                <span className="text-[11px] font-semibold" style={{ color: item.color }}>{item.pct}%</span>
              </div>
              <div className="h-[5px] bg-credaly-s3 rounded-md overflow-hidden">
                <div className="h-full" style={{ width: `${item.pct}%`, backgroundColor: item.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)] flex justify-between items-center">
          <p className="text-sm font-semibold text-credaly-text m-0">Recent Score Requests</p>
          <Badge label="LIVE" color={C.teal} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#112240]">
                {["Borrower BVN", "Score", "Confidence", "Coverage", "Loan Ask", "Time"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-credaly-muted font-medium text-left text-[11px] tracking-[0.04em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentScores.map((row, i) => (
                <tr key={i} className="border-t border-[rgba(100,140,200,0.12)]">
                  <td className="px-4 py-3 text-credaly-text font-mono tracking-[0.05em]">{row.bvn}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ color: scoreColor(row.score) }}>{row.score}</span>
                    <span className="text-[10px] text-credaly-muted ml-1.5">{scoreBand(row.score)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={row.band} color={row.band === "HIGH" ? C.teal : row.band === "MEDIUM" ? C.amber : C.red} />
                  </td>
                  <td className="px-4 py-3 text-credaly-muted">{row.coverage}%</td>
                  <td className="px-4 py-3 text-credaly-text">{row.amount}</td>
                  <td className="px-4 py-3 text-credaly-faint">{row.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
