"use client";

import { useState, useCallback } from "react";
import { Badge, Btn, Input } from "@/components/portal/ui-primitives";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldAlert, Info, Check, X, Clock, FileText } from "lucide-react";

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

interface ConsentCategory {
  id: string;
  label: string;
  description: string;
  purpose: string;
  retention: string;
  thirdParties: string[];
  isRequired: boolean;
}

const CONSENT_CATEGORIES: ConsentCategory[] = [
  {
    id: "bureau",
    label: "Credit Bureau Data",
    description: "Your credit history from CRC, FirstCentral, and CreditRegistry",
    purpose: "To assess your existing credit relationships and repayment history",
    retention: "24 months from last credit event",
    thirdParties: ["CRC International", "FirstCentral Credit Bureau", "CreditRegistry"],
    isRequired: true,
  },
  {
    id: "bank",
    label: "Bank Statement Data",
    description: "Transaction history and account balances from your bank accounts",
    purpose: "To verify income stability, spending patterns, and debt-to-income ratio",
    retention: "24 months from collection date",
    thirdParties: ["Mono", "Okra", "OnePipe"],
    isRequired: true,
  },
  {
    id: "telco",
    label: "Telco Usage Data",
    description: "Airtime top-up frequency, data subscription patterns, and call metadata",
    purpose: "To identify behavioral signals that correlate with creditworthiness",
    retention: "18 months from collection date",
    thirdParties: ["MTN Nigeria", "Airtel Nigeria", "Glo Mobile"],
    isRequired: false,
  },
  {
    id: "mobile_money",
    label: "Mobile Money Data",
    description: "Transaction history from your mobile money wallet",
    purpose: "To track inflow/outflow patterns and financial velocity",
    retention: "24 months from last transaction",
    thirdParties: ["OPay", "PalmPay"],
    isRequired: false,
  },
  {
    id: "utility",
    label: "Utility Payment Data",
    description: "Prepayment and bill payment history from your electricity provider",
    purpose: "To assess payment consistency and financial responsibility",
    retention: "24 months from last payment",
    thirdParties: ["EKEDC", "IKEDC"],
    isRequired: false,
  },
  {
    id: "psychographic",
    label: "Psychographic Data",
    description: "App usage signals, address stability, and psychometric survey responses",
    purpose: "To supplement credit assessment with behavioral and lifestyle signals",
    retention: "12 months from collection date",
    thirdParties: [],
    isRequired: false,
  },
];

export default function ConsentPage() {
  const [consentState, setConsentState] = useState<Record<string, boolean>>({
    bureau: true,
    bank: true,
    telco: false,
    mobile_money: false,
    utility: false,
    psychographic: false,
  });
  const [processing, setProcessing] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [consentTokens, setConsentTokens] = useState<Record<string, string>>({});

  const handleToggleConsent = useCallback(async (categoryId: string) => {
    const currentlyGranted = consentState[categoryId];
    const category = CONSENT_CATEGORIES.find((c) => c.id === categoryId);

    if (!category) return;

    // Don't allow revoking required consent
    if (currentlyGranted && category.isRequired) {
      toast.error(
        `Cannot revoke ${category.label} consent — it's required for credit scoring. Contact support if you wish to delete your account entirely.`
      );
      return;
    }

    setProcessing(categoryId);

    try {
      // TODO: Call real consent endpoints when available
      // POST /v1/consent for grant
      // DELETE /v1/consent/{token_id} for revoke
      //
      // For now, simulate with delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newState = !currentlyGranted;
      setConsentState((prev) => ({ ...prev, [categoryId]: newState }));

      if (newState) {
        // Generate a mock consent token (in production, this comes from backend)
        const token = `cst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
        setConsentTokens((prev) => ({ ...prev, [categoryId]: token }));
        toast.success(`Consent granted for ${category.label}. Token: ${token.substring(0, 16)}...`);
      } else {
        setConsentTokens((prev) => {
          const next = { ...prev };
          delete next[categoryId];
          return next;
        });
        toast.warning(`Consent revoked for ${category.label}. Downstream lenders will be notified.`);
      }
    } catch {
      toast.error(`Failed to update consent for ${category.label}`);
    } finally {
      setProcessing(null);
    }
  }, [consentState]);

  const grantedCount = Object.values(consentState).filter(Boolean).length;
  const requiredCount = CONSENT_CATEGORIES.filter((c) => c.isRequired).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-2">
          Data Consent Management
        </h1>
        <p className="text-credaly-muted text-[13px] m-0 mb-3">
          Control which data categories Credaly can access for credit scoring. Each category requires separate, explicit consent under Nigeria's Data Protection Act (NDPA) 2023.
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <Badge
            label={`${grantedCount}/${CONSENT_CATEGORIES.length} categories active`}
            color={C.teal}
          />
          <Badge
            label={`${requiredCount} required`}
            color={C.amber}
          />
          <Badge
            label="NDPA Section 34 Compliant"
            color={C.muted}
          />
        </div>
      </div>

      {/* Important Notice */}
      <div
        className="rounded-xl p-4 mb-6 flex gap-3 items-start"
        style={{
          background: "rgba(245,166,35,0.06)",
          border: "1px solid rgba(245,166,35,0.2)",
        }}
        role="alert"
        aria-label="Important notice about consent"
      >
        <Info size={18} className="text-credaly-amber shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] text-credaly-amber m-0 font-semibold mb-1">
            Your Right to Control Your Data
          </p>
          <p className="text-[12px] text-credaly-muted m-0 leading-relaxed">
            Under NDPA 2023, you have the right to grant or withdraw consent for each data category independently.
            Withdrawing consent will not affect your existing credit scores immediately, but new scores will be computed
            with less data, which may reduce accuracy. Lenders who have accessed your data based on this consent will be
            notified within 24 hours.
          </p>
        </div>
      </div>

      {/* Consent Categories */}
      <div className="space-y-4">
        {CONSENT_CATEGORIES.map((category) => {
          const isGranted = consentState[category.id];
          const isProcessing = processing === category.id;
          const showCategoryDetails = showDetails === category.id;

          return (
            <div
              key={category.id}
              className="rounded-xl overflow-hidden border transition-colors"
              style={{
                background: C.s1,
                borderColor: isGranted ? "rgba(0,201,167,0.2)" : C.border,
              }}
              role="region"
              aria-label={`${category.label} consent section`}
            >
              {/* Category Header */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleConsent(category.id)}
                    disabled={isProcessing || (isGranted && category.isRequired)}
                    className="relative w-12 h-7 rounded-full shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isGranted ? C.teal : C.s2,
                      border: `1px solid ${isGranted ? C.teal : C.border}`,
                    }}
                    role="switch"
                    aria-checked={isGranted}
                    aria-label={`${isGranted ? 'Revoke' : 'Grant'} consent for ${category.label}`}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                      style={{
                        transform: isGranted ? "translateX(20px)" : "translateX(0)",
                      }}
                    />
                  </button>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-credaly-text m-0">
                        {category.label}
                      </p>
                      {category.isRequired && (
                        <Badge label="REQUIRED" color={C.red} />
                      )}
                    </div>
                    <p className="text-[12px] text-credaly-muted m-0 mt-0.5 truncate">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="shrink-0">
                  {isGranted ? (
                    <Check size={20} className="text-credaly-teal" />
                  ) : (
                    <X size={20} className="text-credaly-faint" />
                  )}
                </div>
              </div>

              {/* Expandable Details */}
              {isGranted && (
                <div className="border-t" style={{ borderColor: C.border }}>
                  <button
                    onClick={() => setShowDetails(showCategoryDetails ? null : category.id)}
                    className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-credaly-s2/30 transition-colors"
                    aria-expanded={showCategoryDetails}
                    aria-controls={`consent-details-${category.id}`}
                  >
                    <p className="text-[11px] text-credaly-muted m-0 uppercase tracking-wide font-semibold">
                      View Consent Details
                    </p>
                    <svg
                      className={`transition-transform ${showCategoryDetails ? "rotate-180" : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke={C.muted}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {showCategoryDetails && (
                    <div
                      id={`consent-details-${category.id}`}
                      className="px-5 pb-5 space-y-4"
                      role="region"
                      aria-label={`Details for ${category.label}`}
                    >
                      {/* Purpose */}
                      <div>
                        <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">
                          Purpose of Collection
                        </p>
                        <p className="text-[12px] text-credaly-text m-0 leading-relaxed">
                          {category.purpose}
                        </p>
                      </div>

                      {/* Retention */}
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-credaly-amber" />
                        <p className="text-[12px] text-credaly-muted m-0">
                          Data retained for <span className="text-credaly-text font-medium">{category.retention}</span>
                        </p>
                      </div>

                      {/* Third Parties */}
                      {category.thirdParties.length > 0 && (
                        <div>
                          <p className="text-[10px] text-credaly-faint m-0 mb-2 uppercase tracking-wider">
                            Authorized Third Parties
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {category.thirdParties.map((tp) => (
                              <span
                                key={tp}
                                className="text-[11px] px-2 py-1 rounded-md bg-credaly-s2 text-credaly-muted border"
                                style={{ borderColor: C.border }}
                              >
                                {tp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Consent Token */}
                      {consentTokens[category.id] && (
                        <div>
                          <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">
                            Cryptographic Consent Token
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] bg-credaly-s2 px-3 py-2 rounded-md font-mono text-credaly-amber flex-1 overflow-hidden text-ellipsis">
                              {consentTokens[category.id]}
                            </code>
                            <Btn
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(consentTokens[category.id]);
                                toast.success("Token copied to clipboard");
                              }}
                              aria-label="Copy consent token"
                            >
                              <FileText size={14} />
                            </Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mt-8 rounded-xl p-5 border"
        style={{ background: C.s1, borderColor: C.border }}
      >
        <h3 className="text-sm font-semibold text-credaly-text m-0 mb-3">
          Your Data Rights Under NDPA 2023
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Shield,
              title: "Right to Access",
              desc: "Request a copy of all data held about you",
            },
            {
              icon: ShieldCheck,
              title: "Right to Correction",
              desc: "Request correction of inaccurate data",
            },
            {
              icon: ShieldAlert,
              title: "Right to Erasure",
              desc: "Request deletion of your data (30-day process)",
            },
            {
              icon: Info,
              title: "Right to Human Review",
              desc: "Request human review of automated credit decisions",
            },
          ].map((right) => {
            const Icon = right.icon;
            return (
              <div key={right.title} className="flex gap-3 items-start">
                <Icon size={16} className="text-credaly-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-credaly-text m-0">{right.title}</p>
                  <p className="text-[11px] text-credaly-muted m-0">{right.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-credaly-faint m-0 mt-4">
          To exercise any of these rights, contact our Data Protection Officer at{" "}
          <span className="text-credaly-muted">dpo@credaly.io</span> or submit a request through your lender.
        </p>
      </div>
    </div>
  );
}
