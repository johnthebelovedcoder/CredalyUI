"use client";

import { useState, useMemo } from "react";
import { Badge, Pill } from "@/components/portal/ui-primitives";
import { useScoreHistory } from "@/lib/hooks";
import { Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
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

interface HistoryEntry {
  id: string;
  bvn: string;
  score: number;
  confidence: string;
  coverage: number;
  amount: string;
  ts: string;
  status: string;
}

// Local cache of recent score requests (persists across session)
const LOCAL_CACHE_KEY = "credaly_score_history_cache";

function getLocalCache(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalCache(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(entries.slice(-100)));
  } catch { /* ignore quota errors */ }
}

export default function BorrowerHistoryPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Try to load real history for a specific BVN
  const cleanSearch = search.replace(/[•·]/g, "").trim();
  const { data: bvHistory, isLoading: bvLoading } = useScoreHistory(
    cleanSearch,
    cleanSearch.length >= 10
  );

  const localCache = getLocalCache();

  // Seed cache from API if available
  if (bvHistory?.scores && bvHistory.scores.length > 0 && localCache.length === 0) {
    const seeded = bvHistory.scores.map((s, i) => ({
      id: `req_${Date.now() - i * 1000}`,
      bvn: cleanSearch,
      score: s.score,
      confidence: s.confidence_band,
      coverage: 0,
      amount: "—",
      ts: new Date(s.date).toLocaleString(),
      status: "COMPLETE",
    }));
    setLocalCache(seeded);
  }

  const allEntries = localCache.length > 0 ? localCache : [
    { id: "req_001", bvn: "224•••••678", score: 712, confidence: "HIGH", coverage: 84, amount: "₦150,000", ts: "Apr 9, 14:32", status: "COMPLETE" },
    { id: "req_002", bvn: "223•••••341", score: 648, confidence: "MEDIUM", coverage: 61, amount: "₦80,000", ts: "Apr 9, 13:15", status: "COMPLETE" },
    { id: "req_003", bvn: "225•••••902", score: 589, confidence: "MEDIUM", coverage: 72, amount: "₦200,000", ts: "Apr 9, 12:41", status: "COMPLETE" },
    { id: "req_004", bvn: "221•••••155", score: 731, confidence: "HIGH", coverage: 91, amount: "₦50,000", ts: "Apr 9, 11:20", status: "COMPLETE" },
    { id: "req_005", bvn: "224•••••773", score: 450, confidence: "LOW", coverage: 43, amount: "₦120,000", ts: "Apr 9, 10:05", status: "COMPLETE" },
    { id: "req_006", bvn: "222•••••445", score: 695, confidence: "HIGH", coverage: 78, amount: "₦300,000", ts: "Apr 8, 16:42", status: "COMPLETE" },
    { id: "req_007", bvn: "226•••••889", score: 780, confidence: "HIGH", coverage: 95, amount: "₦75,000", ts: "Apr 8, 14:18", status: "COMPLETE" },
    { id: "req_008", bvn: "223•••••221", score: 520, confidence: "LOW", coverage: 38, amount: "₦60,000", ts: "Apr 8, 11:33", status: "FAILED" },
  ];

  const filtered = useMemo(() => allEntries.filter((e) => {
    if (filter !== "ALL" && e.confidence !== filter) return false;
    if (search && !e.bvn.includes(search) && !e.id.includes(search)) return false;
    return true;
  }), [allEntries, filter, search]);

  const perPage = 5;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="flex justify-between items-end mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
            Borrower History
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Review all past scoring requests with detailed results and audit trails.
          </p>
        </div>
        <button className="bg-transparent border border-[rgba(100,140,200,0.12)] text-credaly-muted text-[12px] font-semibold px-[14px] py-[6px] rounded-lg cursor-pointer flex items-center gap-2 font-sans hover:text-credaly-text transition-colors" aria-label="Export history as CSV">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[16px_20px] mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-credaly-faint" />
          <input
            aria-label="Search by BVN or Request ID"
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by BVN or Request ID..."
            className="bg-transparent border-none text-credaly-text text-[12px] outline-none flex-1 font-sans placeholder:text-credaly-faint"
          />
          {bvLoading && <span className="text-[10px] text-credaly-faint animate-pulse">Loading...</span>}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Confidence filter">
          <Filter size={14} className="text-credaly-faint" />
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <Pill key={f} label={f} active={filter === f} onClick={() => { setFilter(f); setPage(1); }} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#112240]">
                {["Request ID", "Borrower BVN", "Score", "Confidence", "Coverage", "Loan Ask", "Timestamp", "Status"].map((h) => (
                  <th key={h} className="p-[10px_16px] text-credaly-muted font-medium text-left text-[11px] tracking-[0.04em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-credaly-faint text-sm">
                    No entries match your search and filters.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr key={row.id} className="border-t border-[rgba(100,140,200,0.12)] hover:bg-[rgba(100,140,200,0.04)] transition-colors">
                    <td className="p-[12px_16px] text-credaly-faint font-mono text-[11px]">{row.id}</td>
                    <td className="p-[12px_16px] text-credaly-text font-mono tracking-[0.05em]">{row.bvn}</td>
                    <td className="p-[12px_16px]">
                      <span className="font-bold" style={{ color: scoreColor(row.score) }}>{row.score}</span>
                    </td>
                    <td className="p-[12px_16px]">
                      <Badge
                        label={row.confidence}
                        color={row.confidence === "HIGH" ? C.teal : row.confidence === "MEDIUM" ? C.amber : C.red}
                      />
                    </td>
                    <td className="p-[12px_16px] text-credaly-muted">{row.coverage}%</td>
                    <td className="p-[12px_16px] text-credaly-text">{row.amount}</td>
                    <td className="p-[12px_16px] text-credaly-faint text-[11px]">{row.ts}</td>
                    <td className="p-[12px_16px]">
                      <Badge
                        label={row.status}
                        color={row.status === "COMPLETE" ? C.teal : C.red}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-[14px_20px] border-t border-[rgba(100,140,200,0.12)] flex justify-between items-center">
            <p className="text-[11px] text-credaly-faint m-0">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="bg-transparent border border-[rgba(100,140,200,0.12)] text-credaly-muted p-[6px_10px] rounded-md text-[11px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-sans"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="bg-transparent border border-[rgba(100,140,200,0.12)] text-credaly-muted p-[6px_10px] rounded-md text-[11px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-sans"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
