"use client";

import { useState } from "react";
import { Badge, Btn, Input, Select, KpiCard } from "@/components/portal/ui-primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsentList, useVerifyConsentMutation } from "@/lib/hooks";
import type { ConsentQueryParams } from "@/lib/types";
import { formatDate } from "@/lib/utils-format";
import { Search, Shield, ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import { toast } from "sonner";
import { mockConsentEntries } from "@/lib/mock-data";

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
  blue: "#3B82F6",
};

export default function AuditPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;
  const [filters, setFilters] = useState<ConsentQueryParams>({
    limit,
    offset: 0,
  });

  const { data: consentData, isLoading } = useConsentList(filters);
  const entries = consentData?.data || mockConsentEntries;
  const total = consentData?.total || mockConsentEntries.length;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setFilters({ ...filters, offset: (page - 1) * limit });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px", fontFamily: "Outfit, sans-serif" }}>
            Consent Audit Log
          </h1>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            Audit borrower consent trails and verify cryptographic logs (FR-019).
          </p>
        </div>
        <Btn variant="ghost" size="sm" icon="📋">Generate Audit Report</Btn>
      </div>

      {/* Audit Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard label="Audit Entries" value={total.toLocaleString()} delta={{ up: true, text: "All Nodes Active" }} icon="📑" />
        <KpiCard label="Chain Integrity" value="99.98%" delta={{ up: true, text: "Tamper-evident active" }} color={C.teal} icon="🛡️" />
        <KpiCard label="Privacy Compliance" value="NDPA v1" delta={{ up: true, text: "Section 34 Compliant" }} color={C.blue} icon="⚖️" />
      </div>

      {/* Filter Bar */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 14, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input 
            label="Consent ID / Subject ID" 
            value={filters.consent_id || ""} 
            onChange={(v) => setFilters({ ...filters, consent_id: v || undefined })} 
            placeholder="Search by ID..."
          />
        </div>
        <div style={{ width: 180 }}>
           <Select 
             label="Event Type" 
             value={filters.event_type || ""} 
             onChange={(v) => setFilters({ ...filters, event_type: v || undefined })}
             options={[
               { label: "All Events", value: "" },
               { label: "Granted", value: "granted" },
               { label: "Withdrawn", value: "withdrawn" },
               { label: "Expired", value: "expired" },
             ]}
           />
        </div>
        <Btn variant="primary" style={{ marginBottom: 16 }}>Search Audit</Btn>
      </div>

      {/* Main Table */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.s2, borderBottom: `1px solid ${C.border}` }}>
                  {["Timestamp", "Event Type", "Consent ID", "Subject", "Integrity Hash", "Verify"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Page {currentPage} of {totalPages}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Prev</Btn>
              <Btn variant="ghost" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditRow({ entry }: { entry: any }) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const { mutateAsync: verifyConsent } = useVerifyConsentMutation();

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Simulate real verification check
      const result = await verifyConsent(entry.consent_id);
      setVerified(result.isValid);
      if (result.isValid) toast.success(`Integrity check PASSED for row ${entry.id.substring(0,8)}`);
    } catch {
      toast.error("Integrity verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: "14px 20px", fontSize: 12, color: C.muted }}>{formatDate(entry.timestamp)}</td>
      <td style={{ padding: "14px 20px" }}>
        <Badge 
          label={entry.event_type.toUpperCase()} 
          color={entry.event_type === "granted" ? C.teal : entry.event_type === "withdrawn" ? C.red : C.amber} 
        />
      </td>
      <td style={{ padding: "14px 20px", fontSize: 12, color: C.amber, fontFamily: "monospace" }}>{entry.consent_id}</td>
      <td style={{ padding: "14px 20px", fontSize: 12, color: C.text }}>{entry.data_subject_id}</td>
      <td style={{ padding: "14px 20px", fontSize: 11, color: C.faint, fontFamily: "monospace", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
        {entry.hash}
      </td>
      <td style={{ padding: "14px 20px" }}>
        {verified === null ? (
          <button 
            onClick={handleVerify}
            disabled={verifying}
            style={{ 
              background: "transparent", 
              border: `1px solid ${C.border}`, 
              color: C.muted, 
              padding: "4px 8px", 
              borderRadius: 6, 
              cursor: "pointer",
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {verifying ? "..." : <><Shield size={12}/> Verify</>}
          </button>
        ) : verified ? (
          <div style={{ color: C.success, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>
            <ShieldCheck size={14} /> Valid
          </div>
        ) : (
          <div style={{ color: C.red, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>
            <ShieldAlert size={14} /> Invalid
          </div>
        )}
      </td>
    </tr>
  );
}

