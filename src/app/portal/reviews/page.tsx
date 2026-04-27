"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge, Btn, Select, Input } from "@/components/portal/ui-primitives";
import { DigitsInput, ScoreInput } from "@/components/portal/inputs";
import { useRequestReview, useReviews } from "@/lib/hooks";
import { Lightbulb, CheckCircle, Loader2, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import type { ReviewEntry } from "@/lib/types";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  orange: "#F97316",
};

const REVIEW_OUTCOMES = [
  "upheld",
  "overturned",
  "partially_overturned",
  "insufficient_data",
];

const statusColor = (s: string) =>
  ({
    pending: C.amber,
    in_review: C.orange,
    completed: C.teal,
    cancelled: C.red,
  }[s] || C.muted);

const outcomeColor = (o: string) =>
  ({
    upheld: C.red,
    overturned: C.teal,
    partially_overturned: C.amber,
    insufficient_data: C.muted,
  }[o] || C.muted);

export default function ReviewsPage() {
  const [form, setForm] = useState({
    bvn: "",
    loanId: "",
    scoreAtDecision: "",
    decisionOutcome: "rejected",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const reviewMutation = useRequestReview();
  const { data: reviewsData, isLoading } = useReviews();

  const handleSubmit = useCallback(async () => {
    if (!form.bvn || !form.loanId || !form.reason || !form.scoreAtDecision) {
      toast.error("All fields are required");
      return;
    }

    const score = Number(form.scoreAtDecision);
    if (score < 300 || score > 850) {
      toast.error("Score must be between 300 and 850");
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        bvn: form.bvn,
        loan_id: form.loanId,
        reason: form.reason,
        score_at_decision: score,
        decision_outcome: form.decisionOutcome,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm({ bvn: "", loanId: "", scoreAtDecision: "", decisionOutcome: "rejected", reason: "" });
      toast.success("Human review request submitted. SLA: 5 business days.");
    } catch {
      toast.error("Failed to submit review request");
    }
  }, [form, reviewMutation]);

  const recentReviews = useMemo(() => {
    if (Array.isArray(reviewsData)) {
      return reviewsData.slice(0, 20);
    }
    return [];
  }, [reviewsData]);

  return (
    <div>
      <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
        Human Review Requests
      </h1>
      <p className="text-credaly-muted text-[13px] m-0 mb-6">
        Request human review of automated credit decisions per NDPA Section 34. Borrowers have the right to not be subject to solely automated decisions.
      </p>

      <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-[10px] p-[12px_16px] mb-5 flex gap-[10px] items-start">
        <Lightbulb size={18} className="text-credaly-amber shrink-0 mt-[2px]" />
        <p className="text-[12px] text-credaly-amber m-0 leading-[1.5]">
          Under NDPA Section 34, data subjects have the right to request human review of automated credit decisions. All review requests have an SLA of 5 business days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            Submit Review Request
          </p>

          {submitted && (
            <div className="bg-[rgba(0,201,167,0.1)] border border-[rgba(0,201,167,0.2)] rounded-lg p-[12px_14px] mb-4">
              <p className="text-[12px] text-credaly-teal m-0 font-semibold flex items-center gap-1.5">
                <CheckCircle size={14} /> Review request submitted successfully
              </p>
              <p className="text-[11px] text-credaly-muted m-0 mt-[3px]">SLA: 5 business days from submission.</p>
            </div>
          )}

          <Input label="Loan ID" value={form.loanId} onChange={(v) => setForm({ ...form, loanId: v })} placeholder="ln_1234567" />
          <DigitsInput label="Borrower BVN" value={form.bvn} onChange={(v) => setForm({ ...form, bvn: v })} placeholder="22412345678" maxLength={11} hint="11-digit Bank Verification Number" />
          <ScoreInput label="Score at Decision" value={form.scoreAtDecision} onChange={(v) => setForm({ ...form, scoreAtDecision: v })} placeholder="620" hint="Credit score used for the automated decision (300-850)" />
          <Select
            label="Decision Outcome"
            value={form.decisionOutcome}
            onChange={(v) => setForm({ ...form, decisionOutcome: v })}
            options={[
              { value: "rejected", label: "Rejected" },
              { value: "approved_with_conditions", label: "Approved with Conditions" },
              { value: "approved_lower_amount", label: "Approved — Lower Amount" },
            ]}
          />
          <div className="mb-5">
            <label className="text-[11px] text-credaly-muted block mb-2 tracking-[0.05em] uppercase">
              Reason for Review
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Explain why the borrower is requesting human review..."
              rows={4}
              className="w-full bg-credaly-s2 border border-[rgba(100,140,200,0.12)] rounded-lg px-3.5 py-2.5 text-sm text-credaly-text outline-none resize-none focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors placeholder:text-credaly-faint"
            />
          </div>

          <Btn
            onClick={handleSubmit}
            size="lg"
            disabled={reviewMutation.isPending || !form.bvn || !form.loanId || !form.reason}
            aria-label="Submit Review Request"
          >
            {reviewMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Review Request →"}
          </Btn>
        </div>

        {/* Recent reviews table */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
            <p className="text-sm font-semibold text-credaly-text m-0">Review History</p>
          </div>
          {isLoading ? (
            <div className="p-5 text-center text-credaly-faint text-sm">Loading reviews...</div>
          ) : recentReviews.length === 0 ? (
            <div className="p-12 text-center text-credaly-faint text-sm">
              No review requests submitted yet. Submit your first request to start tracking.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#112240]">
                    {["Loan ID", "Score", "Decision", "Status", "Outcome", "Submitted", "SLA Deadline"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-credaly-muted font-medium text-left text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((review: ReviewEntry) => (
                    <tr key={review.review_id} className="border-t border-[rgba(100,140,200,0.12)]">
                      <td className="px-4 py-3 text-credaly-muted font-mono text-[11px]">{review.loan_id}</td>
                      <td className="px-4 py-3 text-credaly-text">{review.score_at_decision}</td>
                      <td className="px-4 py-3 text-credaly-muted">{review.decision_outcome.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3">
                        <Badge label={review.status.toUpperCase()} color={statusColor(review.status)} />
                      </td>
                      <td className="px-4 py-3">
                        {review.outcome ? (
                          <Badge label={review.outcome.replace(/_/g, " ")} color={outcomeColor(review.outcome)} />
                        ) : (
                          <span className="text-credaly-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-credaly-muted text-[11px]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-credaly-muted text-[11px] flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(review.sla_deadline).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
