"use client";

import { BarChart } from "@/components/portal/bar-chart";
import { Badge, KpiCard, Btn } from "@/components/portal/ui-primitives";
import { useTasks } from "@/context/TaskContext";
import { toast } from "sonner";
import { BarChart3, CreditCard, Zap, Rocket, Download } from "lucide-react";
import { useMemo } from "react";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  text: "#E2EAF4",
  muted: "#6B84A8",
};

export default function UsageBillingPage() {
  const { addTask, updateTask } = useTasks();

  const monthData = useMemo(() => [
    { label: "Oct", v: 18200 }, { label: "Nov", v: 24100 }, { label: "Dec", v: 19800 },
    { label: "Jan", v: 31400 }, { label: "Feb", v: 38900 }, { label: "Mar", v: 42300 }, { label: "Apr", v: 16200 },
  ], []);

  const handleExport = () => {
    const taskId = addTask("Generating Usage Report (CSV)");
    toast.info("Report compilation started...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        clearInterval(interval);
        updateTask(taskId, 100, "success");
        toast.success("Usage report (Oct 2025 - Apr 2026) ready for download.");
      } else {
        updateTask(taskId, progress);
      }
    }, 700);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
            Usage & Billing
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Track your API consumption and subscription spend in real time.
          </p>
        </div>
        <Btn variant="ghost" size="sm" onClick={handleExport} aria-label="Export Usage report">
          <BarChart3 size={14} /> Export Usage report
        </Btn>
      </div>

      {/* KPIs */}
      <div className="flex gap-[14px] mb-6 flex-wrap">
        <KpiCard label="This Month's Calls" value="16,200" delta={{ up: true, text: "Apr 1-9 (partial)" }} icon={<BarChart3 size={18} />} />
        <KpiCard label="Monthly Spend" value="₦2.18M" delta={{ up: false, text: "₦1.1M remaining" }} color={C.amber} icon={<CreditCard size={18} />} />
        <KpiCard label="Rate Limit" value="100/min" delta={{ up: true, text: "Headroom: 94%" }} color={C.teal} icon={<Zap size={18} />} />
        <KpiCard label="Plan" value="Growth" delta={{ up: true, text: "4,000 calls/day" }} color={C.muted} icon={<Rocket size={18} />} />
      </div>

      {/* Monthly chart */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[20px_20px_12px] mb-4">
        <p className="text-[12px] text-credaly-muted m-0 mb-[14px] uppercase tracking-[0.05em]">
          Monthly API Volume
        </p>
        <BarChart data={monthData} color={C.amber} />
      </div>

      {/* Plan details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.05em] m-0 mb-[14px]">
            Current Plan — Growth
          </p>
          {[
            { label: "Scoring API", value: "₦120 / call" },
            { label: "History API", value: "₦40 / call" },
            { label: "Outcome submission", value: "Free" },
            { label: "Webhook events", value: "₦10 / event" },
            { label: "Batch scoring", value: "₦90 / record" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-[7px] border-b border-[rgba(100,140,200,0.12)]">
              <span className="text-[12px] text-credaly-muted">{r.label}</span>
              <span className="text-[12px] font-semibold text-credaly-text">{r.value}</span>
            </div>
          ))}
          <div className="mt-4">
            <Btn variant="ghost" size="sm" aria-label="View pricing">View pricing →</Btn>
          </div>
        </div>

        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.05em] m-0 mb-[14px]">
            Invoice History
          </p>
          {[
            { month: "March 2026", amount: "₦5,076,000", status: "Paid" },
            { month: "February 2026", amount: "₦4,668,000", status: "Paid" },
            { month: "January 2026", amount: "₦3,768,000", status: "Paid" },
            { month: "December 2025", amount: "₦2,376,000", status: "Paid" },
          ].map((inv) => (
            <div key={inv.month} className="flex justify-between items-center py-[9px] border-b border-[rgba(100,140,200,0.12)]">
              <div>
                <p className="text-[12px] text-credaly-text m-0">{inv.month}</p>
                <p className="text-[11px] text-credaly-muted m-0 mt-[1px]">{inv.amount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge label={inv.status} color={C.teal} />
                <button className="bg-transparent border-none text-credaly-muted text-[11px] cursor-pointer font-sans flex items-center gap-1 hover:text-credaly-text transition-colors" aria-label={`Download PDF for ${inv.month}`}>
                  <Download size={10} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
