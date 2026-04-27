"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge, Btn, Select, Input } from "@/components/portal/ui-primitives";
import { DigitsInput } from "@/components/portal/inputs";
import { useSubmitBatchScore, useBatchScoreJob } from "@/lib/hooks";
import { Lightbulb, CheckCircle, Loader2, Download, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import type { BatchScoreEntry } from "@/lib/types";

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

export default function BatchScoringPage() {
  const [entries, setEntries] = useState<BatchScoreEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    bvn: "",
    phone: "",
    tier_config: ["formal", "alternative", "psychographic"] as string[],
    external_ref: "",
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const batchMutation = useSubmitBatchScore();
  const { data: jobData } = useBatchScoreJob(currentJobId || "", !!currentJobId);

  const handleAddEntry = useCallback(() => {
    if (!currentEntry.bvn || !currentEntry.phone) {
      toast.error("BVN and phone number are required");
      return;
    }
    if (currentEntry.bvn.length !== 11 || !/^\d+$/.test(currentEntry.bvn)) {
      toast.error("BVN must be 11 digits");
      return;
    }
    setEntries((prev) => [...prev, { ...currentEntry }]);
    setCurrentEntry({ bvn: "", phone: "", tier_config: ["formal", "alternative", "psychographic"], external_ref: "" });
    toast.success(`Entry added (${entries.length + 1} total)`);
  }, [currentEntry, entries.length]);

  const handleRemoveEntry = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitJob = useCallback(async () => {
    if (entries.length === 0) {
      toast.error("Add at least one borrower entry");
      return;
    }
    if (entries.length > 10000) {
      toast.error("Maximum 10,000 entries per batch");
      return;
    }

    try {
      const job = await batchMutation.mutateAsync(entries);
      setCurrentJobId(job.job_id);
      toast.success(`Batch job submitted: ${job.job_id}`);
    } catch {
      toast.error("Failed to submit batch scoring job");
    }
  }, [entries, batchMutation]);

  const handleCsvUpload = useCallback(() => {
    // CSV upload would open a file picker and parse
    toast.info("CSV upload — integrate with file parser for production");
  }, []);

  const toggleTier = (tier: string) => {
    setCurrentEntry((prev) => ({
      ...prev,
      tier_config: prev.tier_config.includes(tier)
        ? prev.tier_config.filter((t) => t !== tier)
        : [...prev.tier_config, tier],
    }));
  };

  const jobStats = useMemo(() => {
    if (!jobData) return null;
    return {
      total: jobData.total_entries,
      completed: jobData.completed_entries,
      failed: jobData.failed_entries,
      status: jobData.status,
      pct: jobData.total_entries > 0 ? Math.round((jobData.completed_entries / jobData.total_entries) * 100) : 0,
    };
  }, [jobData]);

  return (
    <div>
      <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
        Batch Scoring
      </h1>
      <p className="text-credaly-muted text-[13px] m-0 mb-6">
        Score up to 10,000 borrowers in a single batch for portfolio review. Per PRD US-005: 10,000+ records/hour throughput.
      </p>

      <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-[10px] p-[12px_16px] mb-5 flex gap-[10px] items-start">
        <Lightbulb size={18} className="text-credaly-amber shrink-0 mt-[2px]" />
        <p className="text-[12px] text-credaly-amber m-0 leading-[1.5]">
          Batch scoring is designed for portfolio review use cases. Jobs are processed asynchronously and you can monitor progress in real time.
        </p>
      </div>

      {/* Job Progress */}
      {jobData && jobStats && (
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-credaly-text m-0 flex items-center gap-2">
              <FileText size={16} className="text-credaly-amber" />
              Job: {currentJobId}
            </p>
            <Badge
              label={jobStats.status.toUpperCase()}
              color={jobStats.status === "completed" ? C.teal : jobStats.status === "processing" ? C.amber : C.red}
            />
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-credaly-s2 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${jobStats.pct}%`,
                background: jobStats.status === "completed" ? C.teal : C.amber,
              }}
            />
          </div>

          <div className="flex gap-6 flex-wrap">
            <div>
              <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">Total</p>
              <p className="text-sm text-credaly-text m-0 font-semibold">{jobStats.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">Completed</p>
              <p className="text-sm text-credaly-teal m-0 font-semibold">{jobStats.completed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">Failed</p>
              <p className="text-sm text-credaly-red m-0 font-semibold">{jobStats.failed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">Progress</p>
              <p className="text-sm text-credaly-text m-0 font-semibold">{jobStats.pct}%</p>
            </div>
            {jobData.estimated_completion_seconds && jobStats.status === "processing" && (
              <div>
                <p className="text-[10px] text-credaly-faint m-0 mb-1 uppercase tracking-wider">Est. Remaining</p>
                <p className="text-sm text-credaly-muted m-0 font-semibold">
                  {Math.round(jobData.estimated_completion_seconds / 60)} min
                </p>
              </div>
            )}
          </div>

          {jobStats.status === "completed" && jobData.results && (
            <div className="mt-4 pt-4 border-t border-[rgba(100,140,200,0.12)] flex gap-3">
              <Btn variant="ghost" size="sm" aria-label="Download Results">
                <Download size={12} /> Download Results
              </Btn>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        {/* Add Borrower Form */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            Add Borrower ({entries.length} in batch)
          </p>

          <DigitsInput label="BVN" value={currentEntry.bvn} onChange={(v) => setCurrentEntry({ ...currentEntry, bvn: v })} placeholder="22412345678" maxLength={11} hint="11-digit Bank Verification Number" />
          <DigitsInput label="Phone Number" value={currentEntry.phone} onChange={(v) => setCurrentEntry({ ...currentEntry, phone: v })} placeholder="+234 801 234 5678" maxLength={14} allowPlus inputMode="tel" />
          <Input label="External Reference (optional)" value={currentEntry.external_ref} onChange={(v) => setCurrentEntry({ ...currentEntry, external_ref: v })} placeholder="Your internal borrower ID" />

          {/* Tier Config */}
          <div className="mb-5">
            <label className="text-[11px] text-credaly-muted block mb-2 tracking-[0.05em] uppercase">
              Data Tiers
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Data tier selection">
              {["formal", "alternative", "psychographic"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                    currentEntry.tier_config.includes(tier)
                      ? "bg-[rgba(0,201,167,0.1)] border-[rgba(0,201,167,0.3)] text-credaly-teal font-semibold"
                      : "bg-credaly-s2 border-[rgba(100,140,200,0.12)] text-credaly-faint"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Btn onClick={handleAddEntry} disabled={!currentEntry.bvn || !currentEntry.phone} aria-label="Add to Batch">
              Add to Batch
            </Btn>
            <Btn variant="ghost" onClick={() => setShowManualEntry(!showManualEntry)}>
              {showManualEntry ? "Hide" : "Bulk Paste"}
            </Btn>
          </div>

          {/* Bulk paste area */}
          {showManualEntry && (
            <div className="mt-4">
              <label className="text-[11px] text-credaly-muted block mb-2 tracking-[0.05em] uppercase">
                Paste CSV Data (bvn,phone,external_ref)
              </label>
              <textarea
                rows={5}
                placeholder={`22412345678,+2348012345678,BRW-001\n22412345679,+2348012345679,BRW-002`}
                className="w-full bg-credaly-s2 border border-[rgba(100,140,200,0.12)] rounded-lg px-3.5 py-2.5 text-xs text-credaly-text outline-none font-mono resize-none focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors placeholder:text-credaly-faint"
              />
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t border-[rgba(100,140,200,0.12)]">
            <Btn onClick={handleSubmitJob} disabled={entries.length === 0 || batchMutation.isPending} size="lg" aria-label="Submit Batch Job">
              {batchMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : `Submit Batch (${entries.length}) →`}
            </Btn>
            <Btn variant="ghost" onClick={handleCsvUpload} aria-label="Upload CSV">
              <Upload size={14} /> CSV
            </Btn>
          </div>
          <p className="text-[10px] text-credaly-faint m-0 mt-[8px]">Max 10,000 entries per batch. Results available via job status endpoint.</p>
        </div>

        {/* Entries List */}
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
          <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)] flex justify-between items-center">
            <p className="text-sm font-semibold text-credaly-text m-0">Batch Entries</p>
            {entries.length > 0 && (
              <button
                onClick={() => setEntries([])}
                className="text-[11px] text-credaly-red bg-transparent border-none cursor-pointer font-semibold hover:underline"
                aria-label="Clear all entries"
              >
                Clear All
              </button>
            )}
          </div>
          {entries.length === 0 ? (
            <div className="p-12 text-center text-credaly-faint text-sm">
              No entries added yet. Add borrowers individually or upload a CSV file.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-[#112240] z-10">
                  <tr className="border-b border-[rgba(100,140,200,0.12)]">
                    {["#", "BVN", "Phone", "Reference", "Tiers", "Remove"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-credaly-muted font-medium text-left text-[11px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={i} className="border-t border-[rgba(100,140,200,0.12)] hover:bg-credaly-s2/30">
                      <td className="px-4 py-3 text-credaly-faint">{i + 1}</td>
                      <td className="px-4 py-3 text-credaly-text font-mono text-[11px]">{entry.bvn}</td>
                      <td className="px-4 py-3 text-credaly-muted text-[11px]">{entry.phone}</td>
                      <td className="px-4 py-3 text-credaly-muted text-[11px]">{entry.external_ref || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {entry.tier_config.map((t) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-credaly-s2 text-credaly-muted border border-[rgba(100,140,200,0.12)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveEntry(i)}
                          className="text-credaly-faint hover:text-credaly-red bg-transparent border-none cursor-pointer transition-colors"
                          aria-label={`Remove entry ${i + 1}`}
                        >
                          ✕
                        </button>
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
