"use client";

import { useState, useCallback } from "react";
import { ScoreGauge } from "@/components/portal/score-gauge";
import { Badge, Pill, Btn } from "@/components/portal/ui-primitives";
import { DigitsInput, CurrencyInput, ScoreInput, TenureInput } from "@/components/portal/inputs";
import { Check, AlertCircle, X, Shield, Activity, FileText } from "lucide-react";
import { toast } from "sonner";
import { useScoreBorrower } from "@/lib/hooks";
import type { ScoreResponse } from "@/lib/types";
import { scoreBorrowerSchema } from "@/lib/validations";

const C = {
  s1: "#0C1A30",
  s3: "#162C52",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  success: "#22C55E",
};

interface DisplayResult {
  score: number;
  confidence_interval: { lower: number; upper: number };
  confidence_band: string;
  data_coverage_pct: number;
  positive_factors: string[];
  negative_factors: string[];
  model_version: string;
  consent_token_ref: string;
  trace_id: string;
  computed_at: string;
}

function toDisplayResult(r: ScoreResponse): DisplayResult {
  return {
    score: r.score,
    confidence_interval: r.confidence_interval,
    confidence_band: r.confidence_band,
    data_coverage_pct: r.data_coverage_pct,
    positive_factors: r.positive_factors,
    negative_factors: r.negative_factors,
    model_version: r.model_version,
    consent_token_ref: r.consent_token_ref,
    trace_id: r.trace_id,
    computed_at: r.computed_at,
  };
}

const MOCK_RESULT: DisplayResult = {
  score: 712,
  confidence_interval: { lower: 688, upper: 736 },
  confidence_band: "HIGH",
  data_coverage_pct: 84,
  positive_factors: [
    "Consistent mobile money inflows for 14 consecutive months",
    "Zero missed utility payments in the last 12 months",
    "Stable airtime top-up patterns indicating regular employment income",
  ],
  negative_factors: [
    "Bureau shows 1 late payment from FirstCentral in Q3 2025",
    "Debt-to-income ratio elevated at 41% (threshold: 40%)",
    "Savings velocity declined 18% in past 3 months",
  ],
  model_version: "v2.3.1",
  consent_token_ref: "cst_xyz789",
  trace_id: "trc_k9mn23",
  computed_at: "2026-04-09T14:32:00Z",
};

export default function ScoreBorrowerPage() {
  const [form, setForm] = useState({
    bvn: "",
    phone: "",
    amount: "",
    tenure: "90",
    tiers: ["formal", "alternative", "psychographic"],
  });
  const [result, setResult] = useState<DisplayResult | null>(null);

  const scoreMutation = useScoreBorrower();
  const loading = scoreMutation.isPending;

  const handleSubmit = useCallback(() => {
    // Validate form with Zod
    const validationResult = scoreBorrowerSchema.safeParse({
      bvn: form.bvn,
      phone: form.phone,
      amount: form.amount,
      tenure: form.tenure,
      tiers: form.tiers,
    });

    if (!validationResult.success) {
      // Show the first validation error
      const firstError = validationResult.error.issues[0];
      toast.error(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    setResult(null);

    scoreMutation.mutate(
      {
        bvn: validationResult.data.bvn,
        phone: validationResult.data.phone,
        loan_amount: validationResult.data.amount ? Number(validationResult.data.amount) : undefined,
        tenure_days: Number(validationResult.data.tenure),
        tier_config: validationResult.data.tiers,
      },
      {
        onSuccess: (data) => {
          setResult(toDisplayResult(data));
          toast.success("Score computed successfully");
        },
        onError: () => {
          // Fallback to mock data when API is unavailable
          setResult(MOCK_RESULT);
          toast.warning("API unavailable — showing demo result");
        },
      }
    );
  }, [form, scoreMutation]);

  const toggleTier = (tier: string) => {
    setForm((f) => ({
      ...f,
      tiers: f.tiers.includes(tier)
        ? f.tiers.filter((t) => t !== tier)
        : [...f.tiers, tier],
    }));
  };

  return (
    <div>
      <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
        Score a Borrower
      </h1>
      <p className="text-credaly-muted text-[13px] m-0 mb-6">
        Submit borrower details to get a composite credit score in real time.
      </p>

      <div
        className={`grid gap-6 items-start ${result ? "grid-cols-[340px_1fr]" : "grid-cols-[420px_1fr]"}`}
      >
        {/* Form */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            Borrower Details
          </p>
          <DigitsInput label="BVN" id="score-bvn" value={form.bvn} onChange={(v) => setForm({ ...form, bvn: v })} placeholder="22412345678" maxLength={11} hint="11-digit Bank Verification Number" />
          <DigitsInput label="Phone Number" id="score-phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+234 801 234 5678" maxLength={14} allowPlus inputMode="tel" />
          <CurrencyInput label="Loan Amount" id="score-amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="150,000" maxDigits={8} hint="₦1 to ₦50,000,000" />
          <TenureInput
            value={form.tenure}
            onChange={(v) => setForm({ ...form, tenure: v })}
            id="score-tenure"
          />

          {/* Tier Config */}
          <div className="mb-5">
            <label className="text-[11px] text-credaly-muted block mb-2 tracking-[0.05em] uppercase">
              Data Tiers
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Data tier selection">
              {["formal", "alternative", "psychographic"].map((tier) => (
                <Pill key={tier} label={tier} active={form.tiers.includes(tier)} onClick={() => toggleTier(tier)} />
              ))}
            </div>
            <p className="text-[10px] text-credaly-faint m-0 mt-[6px]">
              More tiers = higher accuracy. Requires separate borrower consent per category.
            </p>
          </div>

          <Btn onClick={handleSubmit} disabled={loading || !form.bvn || !form.phone} size="lg" aria-label="Run Credit Score">
            {loading ? "Scoring..." : "Run Credit Score →"}
          </Btn>

          {loading && (
            <div className="mt-4 bg-credaly-s2 rounded-lg p-[14px]" role="status" aria-label="Scoring progress">
              {["Verifying BVN against NIMC...", "Pulling bureau data...", "Ingesting behavioral signals...", "Running ML ensemble..."].map((step, i) => (
                <p key={i} className="text-[11px] text-credaly-muted m-[3px_0] flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-credaly-amber inline-block opacity-80 animate-pulse" />
                  {step}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-[14px]">
            {/* Score Card */}
            <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6 text-center">
              <ScoreGauge score={result.score} />
              <div className="flex justify-center gap-[10px] mt-3">
                <Badge
                  label={`${result.confidence_band} CONFIDENCE`}
                  color={result.confidence_band === "HIGH" ? C.teal : result.confidence_band === "MEDIUM" ? C.amber : C.red}
                />
                <Badge label={`${result.data_coverage_pct}% DATA COVERAGE`} color={C.muted} />
              </div>
              <p className="text-[11px] text-credaly-muted m-0 mt-[10px]">
                95% CI: {result.confidence_interval.lower} – {result.confidence_interval.upper}
              </p>
            </div>

            {/* Decision Recommendation */}
            <div
              className={`rounded-xl p-[16px_20px] border ${
                result.confidence_band === "HIGH" && result.score >= 670
                  ? "bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.2)]"
                  : result.score < 580
                    ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)]"
                    : "bg-[rgba(245,166,35,0.1)] border-[rgba(245,166,35,0.2)]"
              }`}
            >
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[6px]">
                    Decision Recommendation
                  </p>
                  <p
                    className={`text-[14px] font-semibold m-0 ${
                      result.score >= 670 ? "text-credaly-success" : result.score >= 580 ? "text-credaly-amber" : "text-credaly-danger"
                    }`}
                  >
                    {result.score >= 700
                      ? "Approve — Strong credit profile with high confidence"
                      : result.score >= 620
                        ? "Conditional Approve — Review manually or reduce exposure"
                        : "Decline — Insufficient credit quality for this product"}
                  </p>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => { toast.info(`Human review request queued. Reference: ${result.trace_id}`); }} aria-label="Request Human Review">
                  Request Human Review
                </Btn>
              </div>
            </div>

            {/* Factors */}
            <div className="grid grid-cols-2 gap-[14px]">
              <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[18px]">
                <p className="text-[11px] font-semibold text-credaly-teal uppercase tracking-[0.06em] m-0 mb-3">
                  Positive Signals
                </p>
                {result.positive_factors.map((f, i) => (
                  <div key={i} className="flex gap-[10px] mb-2.5">
                    <Check size={14} className="text-credaly-teal shrink-0 mt-[3px]" />
                    <p className="text-[12px] text-credaly-muted m-0 leading-[1.5]">{f}</p>
                  </div>
                ))}
              </div>
              <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[18px]">
                <p className="text-[11px] font-semibold text-credaly-danger uppercase tracking-[0.06em] m-0 mb-3">
                  Risk Signals
                </p>
                {result.negative_factors.map((f, i) => (
                  <div key={i} className="flex gap-[10px] mb-2.5">
                    <AlertCircle size={14} className="text-credaly-danger shrink-0 mt-[3px]" />
                    <p className="text-[12px] text-credaly-muted m-0 leading-[1.5]">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata and Consent Matrix */}
            <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[18px_22px]">
              <div className="flex justify-between items-start mb-[18px] border-b border-[rgba(100,140,200,0.12)] pb-[14px] flex-wrap gap-3">
                <div>
                  <p className="text-[10px] text-credaly-muted m-0 mb-2 uppercase tracking-[0.05em]">Data Authorization Matrix (FR-011)</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { l: "Bureau", v: true, icon: Shield }, { l: "Telco", v: true, icon: Activity }, { l: "Mob. Money", v: true, icon: FileText }, { l: "Psychographic", v: false, icon: X }
                    ].map(m => {
                      const Icon = m.icon;
                      return (
                        <div key={m.l} className="flex items-center gap-[6px]">
                          <div className={`w-2 h-2 rounded-full ${m.v ? "bg-credaly-teal" : "bg-credaly-faint"}`} />
                          <span className={`text-[11px] ${m.v ? "text-credaly-text" : "text-credaly-muted"}`}>{m.l}</span>
                          {m.v ? <Check size={10} className="text-credaly-teal" /> : <Icon size={10} className="text-credaly-faint" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Btn variant="ghost" size="sm" aria-label="View Audit Logs">Audit Logs</Btn>
              </div>

              <div className="flex gap-6 flex-wrap">
                {[
                  { label: "Model Version", value: result.model_version },
                  { label: "Consent Token", value: result.consent_token_ref },
                  { label: "Trace ID", value: result.trace_id },
                  { label: "Computed At", value: new Date(result.computed_at).toLocaleTimeString("en-GB", { timeZone: "UTC" }) + " UTC" },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] text-credaly-faint m-0 mb-[2px] uppercase tracking-[0.04em]">{m.label}</p>
                    <p className="text-[11px] text-credaly-muted m-0 font-mono">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="flex flex-col justify-center items-center h-[320px] text-credaly-faint gap-3">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="31" stroke={C.s3} strokeWidth="2" />
              <path d="M20 44 A18 18 0 0 1 44 44" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="32" cy="26" r="8" stroke={C.faint} strokeWidth="2.5" fill="none" />
            </svg>
            <p className="text-[13px] text-credaly-faint m-0">Score result will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
