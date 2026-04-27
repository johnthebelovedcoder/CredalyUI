"use client";

import { Badge, KpiCard, Btn } from "@/components/portal/ui-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useModelMetrics,
  usePSIAlerts,
  usePipelineHealth,
  usePipelineUptime,
  useScoreDistribution,
  useClients,
} from "@/lib/hooks";
import { formatNumber, formatPercent, formatDate, getGiniLabel, getStatusDot } from "@/lib/utils-format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, TrendingUp, ShieldCheck, AlertTriangle, Users, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { mockModelMetrics, mockPSIAlerts, mockPipelineHealth, mockUptime, mockScoreDistribution, mockClients } from "@/lib/mock-data";

const C = {
  bg: "#06101E",
  s1: "#0C1A30",
  s2: "#112240",
  border: "rgba(100,140,200,0.12)",
  teal: "#00C9A7",
  success: "#22C55E",
  amber: "#F5A623",
  orange: "#F97316",
  red: "#EF4444",
  blue: "#3B82F6",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useModelMetrics();
  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = usePSIAlerts();
  const { data: pipelines, isLoading: pipelinesLoading, isError: pipelinesError } = usePipelineHealth();
  const { data: uptime, isError: uptimeError } = usePipelineUptime(24);
  const { data: scoreDist, isError: scoreDistError } = useScoreDistribution();
  const { data: clients, isError: clientsError } = useClients();

  const m = metrics || mockModelMetrics;
  const a = Array.isArray(alerts) ? alerts : mockPSIAlerts || [];
  const p = Array.isArray(pipelines) ? pipelines : mockPipelineHealth || [];
  const u = uptime || mockUptime;
  const sd = (scoreDist && scoreDist.buckets) ? scoreDist : (mockScoreDistribution && mockScoreDistribution.buckets) ? mockScoreDistribution : { buckets: [], counts: [] };
  const cl = Array.isArray(clients) ? clients : mockClients || [];

  const hasApiError = metricsError || alertsError || pipelinesError || uptimeError || scoreDistError || clientsError;

  const chartData = sd.buckets.map((bucket, i) => ({
    bucket,
    count: sd.counts?.[i] || 0,
  }));

  const activeClientsCount = cl.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, fontFamily: "Outfit, sans-serif" }}>
            Platform Overview
          </h1>
          <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>
            Real-time monitoring of model performance and data pipelines.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" size="sm">Download Status Report</Btn>
            <Btn icon="⚡">System Health</Btn>
        </div>
      </div>

      {hasApiError && (
        <div style={{ background: "rgba(245,166,35,0.06)", border: `1px solid rgba(245,166,35,0.2)`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <AlertTriangle color={C.amber} size={18} />
          <div>
            <p style={{ fontSize: 13, color: C.amber, fontWeight: 600, margin: 0 }}>Backend Connectivity Warning</p>
            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Showing simulated metrics while API endpoints synchronize.</p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard 
          label="Active Partners" 
          value={activeClientsCount.toString()} 
          delta={{ up: true, text: `${cl.length} Registered` }} 
          icon={<Users size={16} />} 
          color={C.blue}
        />
        <KpiCard 
          label="Pipeline Uptime" 
          value={formatPercent(u?.uptime_percentage)} 
          delta={{ up: true, text: `${u?.successful_runs}/${u?.total_runs} (24h)` }} 
          icon={<Activity size={16} />} 
          color={C.teal}
        />
        <KpiCard 
          label="Model Gini" 
          value={m?.gini_coefficient?.toFixed(3) ?? "—"} 
          delta={{ up: true, text: getGiniLabel(m?.gini_coefficient ?? 0) }} 
          icon={<TrendingUp size={16} />} 
          color={C.amber}
        />
        <KpiCard 
          label="Cumulative Scores" 
          value={formatNumber(m?.total_scores_computed)} 
          delta={{ up: true, text: `v${m?.model_version}` }} 
          icon={<ShieldCheck size={16} />} 
          color={C.success}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        {/* Score Distribution Chart */}
        <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score Distribution</h3>
            <Badge label="Aggregate Data" color={C.blue} />
          </div>
          <div style={{ height: 280, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.06)" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: C.faint }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.faint }} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: "rgba(255,255,255,0.03)" }}
                   contentStyle={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
                   itemStyle={{ color: C.text }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                      <Cell key={index} fill={index > 5 ? C.teal : C.amber} opacity={0.8} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Quick List */}
        <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Source Availability</h3>
            <Link to="/pipelines" style={{ fontSize: 11, color: C.amber, textDecoration: "none" }}>Manage</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {p.slice(0, 6).map((item) => (
              <div key={item.source_name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: C.s2, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`} />
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item.source_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: C.muted }}>{formatNumber(item.records_ingested)} recs</span>
                  <Badge label={item.status.toUpperCase()} color={item.status === "healthy" ? C.teal : C.amber} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PSI Alerts Section */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Database size={16} color={C.amber} />
            <h3 style={{ fontSize: 12, fontWeight: 600, color: C.text, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Stability Watchlist (PSI Alerts)</h3>
          </div>
          <Badge label={`${a.length} Active Alerts`} color={a.length > 0 ? C.red : C.teal} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.s2 }}>
                {["Feature", "Drift (PSI)", "Threshold", "Severity", "Detected"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, color: C.muted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.map((alert, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: C.text, fontFamily: "monospace" }}>{alert.feature}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: C.red, fontWeight: 600 }}>{alert.psi_value.toFixed(3)}</td>
                  <td style={{ padding: "14px 20px", fontSize: 11, color: C.muted }}>{alert.threshold}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <Badge label={alert.severity.toUpperCase()} color={alert.severity === "critical" ? C.red : C.amber} />
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 11, color: C.faint }}>{formatDate(alert.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {a.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: C.faint, fontSize: 13 }}>
              All features are within stability thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

