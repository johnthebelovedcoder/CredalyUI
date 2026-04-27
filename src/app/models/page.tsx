"use client";

import { useState, useCallback } from "react";
import { Badge, KpiCard, Btn } from "@/components/portal/ui-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useModelMetrics, usePSIAlerts, useScoreDistribution, useRetrainModel } from "@/lib/hooks";
import { formatNumber, getGiniLabel, getPSILabel, formatDate } from "@/lib/utils-format";
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
import { AlertTriangle, CheckCircle2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { useTasks } from "@/context/TaskContext";

const C = {
  s1: "#0C1A30",
  s2: "#112240",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  amberFaint: "rgba(245,166,35,0.1)",
  teal: "#00C9A7",
  success: "#22C55E",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  blue: "#3B82F6",
};

export default function ModelsPage() {
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useModelMetrics();
  const { data: alerts, isLoading: alertsLoading } = usePSIAlerts();
  const { data: scoreDist, isLoading: distLoading } = useScoreDistribution();
  const retrainMutation = useRetrainModel();
  const { addTask, updateTask } = useTasks();
  const [retraining, setRetraining] = useState(false);

  const psiData = Object.entries(metrics?.psi_per_feature || {}).map(([feature, value]) => ({
    feature: feature.replace(/_/g, " "),
    value: value as number,
    ...getPSILabel(value as number),
  }));

  const chartData = (scoreDist?.buckets || []).map((bucket: string, i: number) => ({
    bucket,
    count: scoreDist?.counts?.[i] || 0,
  }));

  const handleRetrain = useCallback(async () => {
    if (!metrics?.model_version) return;
    setRetraining(true);
    const taskId = addTask(`Model Retrain (v${metrics.model_version})`);

    try {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 20;
        if (prog >= 90) clearInterval(interval);
        else updateTask(taskId, prog);
      }, 800);

      const job = await retrainMutation.mutateAsync();
      clearInterval(interval);
      updateTask(taskId, 100, "success");
      toast.success(`Retraining job ${job.job_id} started: ${job.message}`);
    } catch (error: unknown) {
      updateTask(taskId, 0, "error");
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to start retraining job";
      toast.error(message);
    } finally {
      setRetraining(false);
    }
  }, [metrics, retrainMutation, addTask, updateTask]);

  const hasApiError = metricsError;
  const isLoading = metricsLoading || alertsLoading || distLoading;

  if (hasApiError && !metrics) {
    return (
      <div>
        <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">Model Performance</h1>
        <p className="text-credaly-muted text-[13px] m-0 mb-6">
          Monitor ML model quality, drift metrics, and score distributions.
        </p>
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-credaly-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-credaly-danger m-0">Failed to load model metrics</p>
            <p className="text-xs text-credaly-muted m-0 mt-1">
              The model metrics endpoint is unreachable. Ensure the scoring API and admin API are running.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = metrics && metrics.gini_coefficient !== undefined && metrics.gini_coefficient !== null;

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">
            Model Performance
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Monitor ML model quality, drift metrics, and score distributions.
          </p>
        </div>
        <Btn
          onClick={handleRetrain}
          disabled={retraining || !hasData}
          icon={retraining ? <RotateCw size={14} className="animate-spin" /> : <RotateCw size={14} />}
          aria-label="Retrain Model"
        >
          {retraining ? "Retraining..." : "Retrain Model"}
        </Btn>
      </div>

      {hasApiError && (
        <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-lg p-3 mb-5 flex gap-2.5 items-start">
          <AlertTriangle size={16} className="text-credaly-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-credaly-amber m-0">Partial data available</p>
            <p className="text-xs text-credaly-muted m-0 mt-0.5">Some metrics may be loading or unavailable.</p>
          </div>
        </div>
      )}

      {!hasData && (
        <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.15)] rounded-lg p-4 mb-5 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-credaly-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-credaly-amber m-0">No Model Data Available</p>
            <p className="text-xs text-credaly-muted m-0 mt-1">
              Model metrics (Gini, PSI, KS) are populated after the first model training cycle.
              Currently all values are null because no trained models exist yet.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="flex gap-3.5 mb-6 flex-wrap">
        <KpiCard
          label="Gini Coefficient"
          value={hasData ? metrics.gini_coefficient.toFixed(3) : "—"}
          delta={hasData ? { up: true, text: getGiniLabel(metrics.gini_coefficient) } : undefined}
        />
        <KpiCard
          label="KS Statistic"
          value={hasData ? metrics.ks_statistic.toFixed(3) : "—"}
          delta={hasData ? { up: metrics.ks_statistic >= 0.5, text: metrics.ks_statistic >= 0.5 ? "Excellent" : "Good" } : undefined}
          color={C.blue}
        />
        <KpiCard
          label="Scores Computed"
          value={hasData ? formatNumber(metrics.total_scores_computed) : "—"}
          delta={hasData ? { up: true, text: `v${metrics.model_version}` } : undefined}
          color={C.teal}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PSI per Feature */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
            <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0">PSI per Feature</p>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : psiData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-credaly-faint text-sm">
                No PSI data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={psiData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.06)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: C.muted }} domain={[0, 0.3]} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: C.muted }} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: "#0C1A30",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: C.text,
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {psiData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.value < 0.1 ? C.success : entry.value < 0.2 ? C.amber : C.red}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
            <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0">Score Distribution</p>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-credaly-faint text-sm">
                No score distribution data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.06)" />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 10, fill: C.muted }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10, fill: C.muted }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0C1A30",
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: C.text,
                    }}
                  />
                  <Bar dataKey="count" fill={C.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* PSI Drift Table */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
          <p className="text-sm font-semibold text-credaly-text m-0">PSI Drift Alerts</p>
        </div>
        {alertsLoading ? (
          <div className="p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </div>
        ) : !Array.isArray(alerts) || alerts.length === 0 ? (
          <div className="py-12 text-center text-credaly-muted">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: C.success }} />
            <p className="text-sm">All features are within stability thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#112240]">
                  {["Feature", "PSI Value", "Threshold", "Severity", "Detected"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-credaly-muted font-semibold text-xs uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, i) => (
                  <tr key={i} className="border-t border-[rgba(100,140,200,0.12)] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-credaly-text font-mono">{alert.feature}</td>
                    <td className="px-5 py-3.5 text-credaly-text font-semibold">{alert.psi_value.toFixed(3)}</td>
                    <td className="px-5 py-3.5 text-credaly-muted">{alert.threshold}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={alert.severity.toUpperCase()}
                        color={alert.severity === "critical" || alert.severity === "high" ? C.red : C.amber}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-credaly-muted">{formatDate(alert.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
