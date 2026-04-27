"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge, Btn, Select, Input } from "@/components/portal/ui-primitives";
import { DigitsInput, CurrencyInput, ScoreInput } from "@/components/portal/inputs";
import { useSubmitOutcome, useOutcomes } from "@/lib/hooks";
import { Lightbulb, CheckCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { outcomeSubmissionSchema } from "@/lib/validations";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  amberFaint: "rgba(245,166,35,0.1)",
  teal: "#00C9A7",
  tealFaint: "rgba(0,201,167,0.1)",
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

const OUTCOMES = [
  "REPAID_ON_TIME",
  "REPAID_LATE",
  "DEFAULTED",
  "RESTRUCTURED",
  "WRITTEN_OFF",
] as const;

export default function OutcomesPage() {
  const [form, setForm] = useState({
    loanId: "",
    bvn: "",
    outcome: "REPAID_ON_TIME" as (typeof OUTCOMES)[number],
    disbursementDate: "",
    dueDate: "",
    outcomeDate: "",
    amount: "",
    score: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useSubmitOutcome();
  const { data: outcomesData, isLoading } = useOutcomes();

  const handleSubmit = useCallback(async () => {
    // Validate with Zod
    const validationResult = outcomeSubmissionSchema.safeParse({
      loanId: form.loanId,
      bvn: form.bvn,
      outcome: form.outcome,
      disbursementDate: form.disbursementDate,
      dueDate: form.dueDate,
      scoreAtOrigination: form.score,
      outcomeDate: form.outcomeDate || new Date().toISOString().split("T")[0],
      amount: form.amount,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    try {
      await submitMutation.mutateAsync({
        loan_id: validationResult.data.loanId,
        borrower_bvn: validationResult.data.bvn,
        outcome: validationResult.data.outcome,
        outcome_date: validationResult.data.outcomeDate || new Date().toISOString().split("T")[0],
        disbursement_date: validationResult.data.disbursementDate,
        due_date: validationResult.data.dueDate,
        score_at_origination: Number(validationResult.data.scoreAtOrigination),
        amount: Number(validationResult.data.amount),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm({ loanId: "", bvn: "", outcome: "REPAID_ON_TIME", disbursementDate: "", dueDate: "", outcomeDate: new Date().toISOString().split("T")[0], amount: "", score: "" });
      toast.success("Outcome recorded and queued for model retraining");
    } catch {
      toast.error("Failed to submit outcome");
    }
  }, [form, submitMutation]);

  const outcomeColor = (o: string) =>
    ({
      REPAID_ON_TIME: C.teal,
      REPAID_LATE: C.amber,
      DEFAULTED: C.red,
      RESTRUCTURED: C.orange,
      WRITTEN_OFF: C.red,
    }[o] || C.muted);

  const outcomeLabel = (o: string) => o.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const recentOutcomes = useMemo(() => {
    // Show API data if available, otherwise empty
    if (Array.isArray(outcomesData)) {
      return outcomesData.slice(0, 10);
    }
    return [];
  }, [outcomesData]);

  return (
    <div>
      <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
        Submit Loan Outcomes
      </h1>
      <p className="text-credaly-muted text-[13px] m-0 mb-6">
        Contribute repayment outcomes to improve model accuracy for the entire network.
      </p>

      <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-[10px] p-[12px_16px] mb-5 flex gap-[10px] items-start">
        <Lightbulb size={18} className="text-credaly-amber shrink-0 mt-[2px]" />
        <p className="text-[12px] text-credaly-amber m-0 leading-[1.5]">
          Outcome data is the core of your data contribution agreement. Each submission directly improves score accuracy for all platform partners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            Loan Outcome
          </p>

          {submitted && (
            <div className="bg-[rgba(0,201,167,0.1)] border border-[rgba(0,201,167,0.2)] rounded-lg p-[12px_14px] mb-4">
              <p className="text-[12px] text-credaly-teal m-0 font-semibold flex items-center gap-1.5">
                <CheckCircle size={14} /> Outcome recorded successfully
              </p>
              <p className="text-[11px] text-credaly-muted m-0 mt-[3px]">This data point has been queued for model retraining.</p>
            </div>
          )}

          <Input label="Loan ID" value={form.loanId} onChange={(v) => setForm({ ...form, loanId: v })} placeholder="ln_1234567" />
          <DigitsInput label="Borrower BVN" value={form.bvn} onChange={(v) => setForm({ ...form, bvn: v })} placeholder="22412345678" maxLength={11} hint="11-digit Bank Verification Number" />
          <Select
            label="Outcome"
            value={form.outcome}
            onChange={(v) => setForm({ ...form, outcome: v as (typeof OUTCOMES)[number] })}
            options={OUTCOMES.map((o) => ({ value: o, label: outcomeLabel(o) }))}
          />
          <Input label="Disbursement Date" value={form.disbursementDate} onChange={(v) => setForm({ ...form, disbursementDate: v })} type="date" />
          <Input label="Due Date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} type="date" />
          <Input label="Outcome Date" value={form.outcomeDate} onChange={(v) => setForm({ ...form, outcomeDate: v })} type="date" />
          <CurrencyInput label="Loan Amount" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="150,000" maxDigits={8} />
          <ScoreInput label="Score at Origination" value={form.score} onChange={(v) => setForm({ ...form, score: v })} placeholder="712" hint="Credit score at loan origination (300-850)" />

          <Btn
            onClick={handleSubmit}
            size="lg"
            disabled={submitMutation.isPending || !form.loanId || !form.bvn}
            aria-label="Submit Outcome"
          >
            {submitMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Outcome →"}
          </Btn>
          <p className="text-[10px] text-credaly-faint m-0 mt-[10px]">Bulk CSV upload available via the batch API endpoint.</p>
        </div>

        {/* Recent outcomes table */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)] flex justify-between items-center">
            <p className="text-sm font-semibold text-credaly-text m-0">Recent Submissions</p>
            <button className="bg-transparent border-none text-credaly-muted text-[11px] cursor-pointer font-sans flex items-center gap-1" aria-label="Export CSV">
              <Download size={10} /> Export CSV
            </button>
          </div>
          {isLoading ? (
            <div className="p-5 text-center text-credaly-faint text-sm">Loading outcomes...</div>
          ) : recentOutcomes.length === 0 ? (
            <div className="p-12 text-center text-credaly-faint text-sm">
              No outcomes submitted yet. Submit your first loan outcome to start contributing to the model.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#112240]">
                    {["Loan ID", "Borrower BVN", "Outcome", "Date", "Amount"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-credaly-muted font-medium text-left text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOutcomes.map((row: Record<string, unknown>, i: number) => (
                    <tr key={i} className="border-t border-[rgba(100,140,200,0.12)]">
                      <td className="px-4 py-3 text-credaly-muted font-mono text-[11px]">{String(row.loan_id || "")}</td>
                      <td className="px-4 py-3 text-credaly-text font-mono tracking-[0.04em]">{String(row.borrower_bvn || "")}</td>
                      <td className="px-4 py-3">
                        <Badge label={outcomeLabel(String(row.outcome || ""))} color={outcomeColor(String(row.outcome || ""))} />
                      </td>
                      <td className="px-4 py-3 text-credaly-muted">{String(row.outcome_date || "")}</td>
                      <td className="px-4 py-3 text-credaly-text">{row.amount ? `₦${Number(row.amount).toLocaleString()}` : "—"}</td>
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
