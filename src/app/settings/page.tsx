"use client";

import { Badge } from "@/components/ui/badge";
import { useHealthCheck } from "@/lib/hooks";
import { CheckCircle2, Globe, Server, Clock } from "lucide-react";

export default function SettingsPage() {
  const { data: health, isLoading } = useHealthCheck();

  return (
    <div className="space-y-6">
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-credaly-text m-0 mb-1">Settings</h2>
        <p className="text-credaly-muted text-[13px] m-0">Platform configuration and environment details</p>
      </div>

      {/* Environment */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(100,140,200,0.12)]">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-credaly-text m-0 uppercase tracking-[0.05em]">
            <Globe className="w-4 h-4" />
            Environment
          </h3>
        </div>
        <div className="p-5">
          <Badge
            className="text-xs"
            style={{
              background: "rgba(245,166,35,0.1)",
              color: "#F5A623",
              border: "1px solid rgba(245,166,35,0.2)",
            }}
          >
            {import.meta.env.VITE_ENVIRONMENT || "DEV"}
          </Badge>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(100,140,200,0.12)]">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-credaly-text m-0 uppercase tracking-[0.05em]">
            <Server className="w-4 h-4" />
            API Endpoints
          </h3>
          <p className="text-credaly-muted text-xs mt-1 ml-6">Base URLs for backend services</p>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-credaly-text m-0">Scoring API (FastAPI)</p>
              <p className="text-xs text-credaly-muted m-0">Handles scoring, consent, outcomes</p>
            </div>
            <code className="text-xs px-2 py-1 rounded bg-credaly-s2 text-credaly-muted font-mono">
              {import.meta.env.VITE_SCORING_API_URL || "http://localhost:8000"}
            </code>
          </div>
          <div className="h-px bg-[rgba(100,140,200,0.12)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-credaly-text m-0">Admin API (NestJS)</p>
              <p className="text-xs text-credaly-muted m-0">Pipeline health, model metrics, clients</p>
            </div>
            <code className="text-xs px-2 py-1 rounded bg-credaly-s2 text-credaly-muted font-mono">
              {import.meta.env.VITE_ADMIN_API_URL || "http://localhost:3001"}
            </code>
          </div>
        </div>
      </div>

      {/* Service Health */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(100,140,200,0.12)]">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-credaly-text m-0 uppercase tracking-[0.05em]">
            <CheckCircle2 className="w-4 h-4" />
            Service Health
          </h3>
          <p className="text-credaly-muted text-xs mt-1 ml-6">Current status of platform services</p>
        </div>
        <div className="p-5">
          {isLoading ? (
            <p className="text-sm text-credaly-faint m-0">Checking service health...</p>
          ) : health ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
              <div>
                <p className="text-sm font-medium capitalize text-credaly-text m-0">{health.service}</p>
                <p className="text-xs text-credaly-muted m-0">
                  Status: <span className="font-medium" style={{ color: "#22C55E" }}>{health.status}</span>
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-credaly-faint">
                <Clock className="w-3.5 h-3.5" />
                {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="text-sm text-credaly-faint m-0">Unable to reach health endpoint</p>
          )}
        </div>
      </div>
    </div>
  );
}
