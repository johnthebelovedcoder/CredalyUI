"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge, Btn } from "@/components/portal/ui-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { usePipelineHealth, usePipelineHistory, usePipelineUptime } from "@/lib/hooks";
import { formatNumber, formatPercent, formatDate, getStatusDot } from "@/lib/utils-format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, ArrowLeft, Info, Shield } from "lucide-react";

const C = {
  s1: "#0C1A30",
  s2: "#112240",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  success: "#22C55E",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

export default function PipelinesPage() {
  const { data: pipelines, isLoading, isError } = usePipelineHealth();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [uptimeHours, setUptimeHours] = useState(24);

  const fallbackCount = useMemo(
    () =>
      Array.isArray(pipelines)
        ? pipelines.filter((s) => s.status === "warning" || s.records_ingested === 0).length
        : 0,
    [pipelines]
  );

  if (isError) {
    return (
      <div>
        <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">Pipeline Health</h1>
        <p className="text-credaly-muted text-[13px] m-0 mb-6">
          Monitor data ingestion pipelines and source latency (FR-010).
        </p>
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle size={18} className="text-credaly-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-credaly-danger m-0">Failed to load pipeline data</p>
            <p className="text-xs text-credaly-muted m-0 mt-1">
              The backend may be offline or unreachable. Please check service health.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">
            Pipeline Health
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Monitor data ingestion pipelines and source latency (FR-010).
          </p>
        </div>
      </div>

      {selectedSource ? (
        <SourceDetail source={selectedSource} onBack={() => setSelectedSource(null)} />
      ) : (
        <>
          {/* Top KPIs */}
          <div className="flex gap-3.5 mb-6 flex-wrap">
            <UptimeCard hours={uptimeHours} onHoursChange={setUptimeHours} isLoading={isLoading} />
            <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[18px_20px] flex-1 min-w-[200px]">
              <p className="text-[11px] text-credaly-muted m-0 tracking-[0.05em] uppercase">Graceful Degradation</p>
              <p className="text-[28px] font-bold text-credaly-text mt-2 mb-1" style={{ color: fallbackCount > 0 ? C.amber : C.teal }}>
                {isLoading ? "—" : fallbackCount > 0 ? `${fallbackCount} Sources` : "Inactive"}
              </p>
              <p className="text-[11px] m-0" style={{ color: fallbackCount > 0 ? C.amber : C.teal }}>
                {fallbackCount > 0 ? "Fallback Active" : "All Real-time"}
              </p>
            </div>
          </div>

          {/* Pipeline Table */}
          <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(100,140,200,0.12)]">
              <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0">Data Sources</p>
            </div>
            {isLoading ? (
              <div className="p-5">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}
              </div>
            ) : !Array.isArray(pipelines) || pipelines.length === 0 ? (
              <div className="p-12 text-center text-credaly-faint text-sm">
                <Info size={24} className="mx-auto mb-2 opacity-50" />
                No pipeline data available. Start the data ingestion service to see sources.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#112240]">
                      {["Source", "Mode", "Status", "Last Run", "Errors", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-medium text-credaly-muted uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pipelines.map((s) => (
                      <tr
                        key={s.source_name}
                        className="border-t border-[rgba(100,140,200,0.12)] cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setSelectedSource(s.source_name)}
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-credaly-text">{s.source_name}</td>
                        <td className="px-5 py-3.5">
                          <Badge
                            label={s.status === "warning" ? "FALLBACK" : "REAL-TIME"}
                            color={s.status === "warning" ? C.amber : C.teal}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot(s.status)}`} />
                            <span className="text-xs text-credaly-text">{s.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-credaly-muted">{formatDate(s.last_run)}</td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: s.error_count > 0 ? C.red : C.muted }}>
                          {s.error_count}
                        </td>
                        <td className="px-5 py-3.5">
                          <Btn variant="ghost" size="sm" aria-label={`Inspect ${s.source_name}`}>Inspect</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function UptimeCard({ hours, onHoursChange, isLoading }: { hours: number; onHoursChange: (h: number) => void; isLoading: boolean }) {
  const { data, isLoading: uptimeLoading } = usePipelineUptime(hours);

  return (
    <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5 flex-2 min-w-[400px]" style={{ flex: 2 }}>
      <div className="flex justify-between items-center mb-5">
        <p className="text-[11px] font-semibold text-credaly-muted m-0 uppercase tracking-[0.05em]">
          Global Uptime ({hours}h)
        </p>
        <div className="flex gap-1 bg-credaly-s2 p-0.5 rounded-md">
          {[24, 168, 720].map((h) => (
            <button
              key={h}
              onClick={(e) => {
                e.stopPropagation();
                onHoursChange(h);
              }}
              className={`text-[10px] px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-credaly-amber/50 ${
                hours === h
                  ? "bg-credaly-s1 text-credaly-text"
                  : "bg-transparent text-credaly-muted hover:text-credaly-text"
              }`}
              aria-label={`View ${h === 24 ? "24 hours" : h === 168 ? "7 days" : "30 days"} uptime`}
            >
              {h === 24 ? "24H" : h === 168 ? "7D" : "30D"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-8">
        <p className="text-[32px] font-extrabold m-0" style={{ color: C.success }}>
          {uptimeLoading || !data ? "—" : formatPercent(data.uptime_percentage || 0)}
        </p>
        <div className="grid grid-cols-3 gap-5">
          <div>
            <p className="text-[10px] text-credaly-muted m-0 mb-0.5">Success</p>
            <p className="text-base font-bold text-credaly-text m-0">
              {uptimeLoading || !data ? "—" : data.successful_runs}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-credaly-muted m-0 mb-0.5">Runs</p>
            <p className="text-base font-bold text-credaly-text m-0">
              {uptimeLoading || !data ? "—" : data.total_runs}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-credaly-muted m-0 mb-0.5">Loss</p>
            <p className="text-base font-bold text-credaly-danger m-0">
              {uptimeLoading || !data ? "—" : (data.total_runs || 0) - (data.successful_runs || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceDetail({ source, onBack }: { source: string; onBack: () => void }) {
  const { data: history, isLoading } = usePipelineHistory(source, !!source);
  const h = history?.data || [];

  const chartData = useMemo(
    () =>
      h
        .slice(0, 15)
        .reverse()
        .map((run) => ({
          id: run.id,
          records: run.records_ingested,
          errors: run.error_count,
          time: formatDate(run.started_at),
        })),
    [h]
  );

  return (
    <div>
      <Btn
        variant="ghost"
        size="sm"
        onClick={onBack}
        style={{ marginBottom: 16 }}
        icon={<ArrowLeft size={14} />}
        aria-label="Back to all pipelines"
      >
        Back to All Pipelines
      </Btn>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
            <p className="text-sm font-semibold text-credaly-text m-0">{source} Performance</p>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.06)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: C.muted }} />
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
                  <Line type="monotone" dataKey="records" stroke={C.teal} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="errors" stroke={C.red} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </div>
          ) : h.length === 0 ? (
            <div className="p-12 text-center text-credaly-faint text-sm">No run history for this source.</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#112240]">
                  {["Run ID", "Status", "Records", "Errors", "Timestamp"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-credaly-muted font-semibold text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {h.map((run) => (
                  <tr key={run.id} className="border-t border-[rgba(100,140,200,0.12)] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-credaly-text">{run.id}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={run.status.toUpperCase()} color={run.status === "success" ? C.teal : C.red} />
                    </td>
                    <td className="px-5 py-3.5 text-credaly-text">{formatNumber(run.records_ingested)}</td>
                    <td className="px-5 py-3.5" style={{ color: run.error_count > 0 ? C.red : C.muted }}>
                      {run.error_count}
                    </td>
                    <td className="px-5 py-3.5 text-credaly-muted">{formatDate(run.started_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
