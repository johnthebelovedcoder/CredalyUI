"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/portal/ui-primitives";
import { Book, FlaskConical, Download, Copy, Send, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const C = {
  s1: "#0C1A30",
  s2: "#112240",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

interface Endpoint {
  method: string;
  path: string;
  desc: string;
  tag: string;
}

export default function DeveloperPortalPage() {
  const [openApiLoaded, setOpenApiLoaded] = useState(false);
  const [openApiError, setOpenApiError] = useState<string | null>(null);

  // Try to load the OpenAPI spec from the backend
  useEffect(() => {
    const scoringUrl = import.meta.env.VITE_SCORING_API_URL || "http://localhost:8000";
    axios.get(`${scoringUrl}/openapi.json`)
      .then(() => {
        setOpenApiLoaded(true);
        setOpenApiError(null);
      })
      .catch(() => {
        setOpenApiError("Scoring API is offline. OpenAPI spec unavailable.");
        setOpenApiLoaded(false);
      });
  }, []);

  const endpoints: Endpoint[] = [
    { method: "POST", path: "/v1/score", desc: "Request a real-time credit score for a borrower", tag: "P0" },
    { method: "GET", path: "/v1/score/{bvn}/history", desc: "Retrieve 12-month score history for a borrower", tag: "P1" },
    { method: "POST", path: "/v1/outcomes", desc: "Submit a repayment outcome for model training", tag: "P0" },
    { method: "POST", path: "/v1/consent", desc: "Record a new consent grant for a data subject", tag: "P0" },
    { method: "DELETE", path: "/v1/consent/{consent_id}", desc: "Revoke a consent token (withdrawal)", tag: "P0" },
    { method: "GET", path: "/v1/subject/{bvn}/data", desc: "Retrieve all data held on a subject (DSAR)", tag: "P1" },
  ];

  const methodColor = (m: string) =>
    ({ POST: C.teal, GET: C.amber, DELETE: C.red }[m] || C.muted);

  const handleCopyCurl = () => {
    const curl = `curl -X POST ${import.meta.env.VITE_SCORING_API_URL || "http://localhost:8000"}/v1/score \\
  -H "X-API-Key: sk_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22412345678",
    "phone": "+2348012345678",
    "tier_config": ["formal", "alternative", "psychographic"],
    "loan_amount_ngn": 150000,
    "loan_tenure_days": 90
  }'`;
    navigator.clipboard.writeText(curl);
    toast.success("cURL example copied to clipboard");
  };

  return (
    <div>
      <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
        Developer Portal
      </h1>
      <p className="text-credaly-muted text-[13px] m-0 mb-6">
        API reference, integration guides, and SDK downloads.
      </p>

      {openApiError && (
        <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.15)] rounded-lg p-3 mb-5 flex gap-2.5 items-start">
          <p className="text-xs text-credaly-amber m-0">
            <b>Notice:</b> {openApiError} Start the scoring API to access interactive docs.
          </p>
        </div>
      )}
      {openApiLoaded && (
        <div className="bg-[rgba(0,201,167,0.06)] border border-[rgba(0,201,167,0.15)] rounded-lg p-3 mb-5 flex gap-2.5 items-center">
          <span className="text-xs text-credaly-teal m-0">OpenAPI spec loaded from scoring API</span>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mb-6">
        {[
          {
            icon: <Book size={24} />,
            title: "API Reference",
            desc: `Full OpenAPI 3.0 spec${openApiLoaded ? " (loaded live)" : ""}`,
            href: `${import.meta.env.VITE_SCORING_API_URL || "http://localhost:8000"}/docs`,
          },
          {
            icon: <FlaskConical size={24} />,
            title: "Sandbox",
            desc: "100 synthetic borrower profiles. No consent required.",
            href: `${import.meta.env.VITE_SCORING_API_URL || "http://localhost:8000"}/docs`,
          },
          {
            icon: <Download size={24} />,
            title: "SDK Downloads",
            desc: "Python & JavaScript/TypeScript client libraries",
            href: "#",
          },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            target={card.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5 cursor-pointer transition-all duration-150 hover:border-[rgba(245,166,35,0.3)] no-underline block"
          >
            <span className="text-credaly-amber">{card.icon}</span>
            <div className="flex items-center gap-1 mt-[10px] mb-1">
              <p className="text-[13px] font-semibold text-credaly-text m-0">{card.title}</p>
              {card.href.startsWith("http") && <ChevronRight size={12} className="text-credaly-faint" />}
            </div>
            <p className="text-[12px] text-credaly-muted m-0 leading-[1.5]">{card.desc}</p>
          </a>
        ))}
      </div>

      {/* Endpoints */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
          <p className="text-sm font-semibold text-credaly-text m-0">Core Endpoints</p>
        </div>
        {endpoints.map((ep, i) => (
          <div key={i} className={`px-5 py-[14px] flex items-center gap-4 ${i > 0 ? "border-t border-[rgba(100,140,200,0.12)]" : ""}`}>
            <span
              className="text-[10px] font-bold font-mono px-2 py-[3px] rounded-md text-center min-w-[44px] inline-block"
              style={{
                color: methodColor(ep.method),
                background: `rgba(${hexToRgb(methodColor(ep.method))},0.12)`,
              }}
            >
              {ep.method}
            </span>
            <code className="text-[12px] text-credaly-amber flex-1">{ep.path}</code>
            <p className="text-[12px] text-credaly-muted m-0 flex-[2]">{ep.desc}</p>
            <Badge label={ep.tag} color={ep.tag === "P0" ? C.red : C.muted} />
          </div>
        ))}
      </div>

      {/* Sample request */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden mb-4">
        <div className="px-[14px] py-[14px] border-b border-[rgba(100,140,200,0.12)] flex items-center gap-[10px]">
          <Badge label="CURL SAMPLE" color={C.muted} />
          <span className="flex-1" />
          <button
            onClick={handleCopyCurl}
            className="bg-transparent border-none text-credaly-muted text-[11px] cursor-pointer font-sans flex items-center gap-1 hover:text-credaly-text transition-colors"
            aria-label="Copy curl example"
          >
            <Copy size={12} /> Copy
          </button>
        </div>
        <pre className="m-0 p-[16px_20px] text-[11px] text-credaly-muted leading-[1.7] bg-transparent font-mono overflow-auto">
{`curl -X POST ${import.meta.env.VITE_SCORING_API_URL || "https://api.credalyai.com"}/v1/score \\
  -H "X-API-Key: sk_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22412345678",
    "phone": "+2348012345678",
    "tier_config": ["formal", "alternative", "psychographic"],
    "loan_amount_ngn": 150000,
    "loan_tenure_days": 90
  }'`}
        </pre>
      </div>

      {/* Interactive Explorer */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-bold text-credaly-text m-0 mb-1">API Explorer (Sandbox)</h2>
            <p className="text-[12px] text-credaly-muted m-0">
              {openApiLoaded
                ? "Connected to live scoring API. Ready for testing."
                : "Test authentication and body parsing against our synthetic test suite."}
            </p>
          </div>
          <Badge label="v2.4" color={openApiLoaded ? C.teal : C.amber} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="bg-credaly-s2 rounded-lg p-[14px] mb-[14px]">
              <p className="text-[10px] text-credaly-faint m-0 mb-2 uppercase">Endpoint</p>
              <div className="flex gap-2 items-center">
                <Badge label="POST" color={C.teal} />
                <code className="text-[12px] text-credaly-text">/v1/score</code>
              </div>
            </div>
            <div className="bg-credaly-s2 rounded-lg p-[14px]">
              <p className="text-[10px] text-credaly-faint m-0 mb-2 uppercase">Request Body</p>
              <pre className="m-0 text-[11px] text-credaly-muted font-mono">
{`{
  "bvn": "22411122233",
  "phone": "08012345678",
  "tier_config": ["formal", "alternative"]
}`}
              </pre>
            </div>
            <div className="mt-[14px]">
              <button
                className="w-full bg-credaly-amber/80 text-[#06101E] border-none rounded-md py-[10px] px-[14px] text-[12px] font-bold cursor-not-allowed font-sans flex items-center justify-center gap-2"
                aria-label="Send Request (connect backend to enable)"
              >
                <Send size={12} /> Send Request (connect backend to enable)
              </button>
            </div>
          </div>

          <div className="bg-credaly-bg rounded-lg p-4 border border-[rgba(100,140,200,0.12)] flex flex-col">
            <p className="text-[10px] text-credaly-faint m-0 mb-3 uppercase">Server Response</p>
            <pre className="m-0 text-[11px] text-credaly-teal font-mono flex-1">
{`HTTP/1.1 200 OK
Content-Type: application/json

{
  "trace_id": "trc_99887766",
  "score": 745,
  "confidence_band": "HIGH",
  "confidence_interval": {"lower": 721, "upper": 769},
  "data_coverage_pct": 84,
  "positive_factors": ["..."],
  "negative_factors": ["..."],
  "model_version": "v2.4.1"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
