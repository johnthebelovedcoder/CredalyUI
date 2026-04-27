"use client";

import { useState, useCallback } from "react";
import { Badge, Btn } from "@/components/portal/ui-primitives";
import { useWebhooks, useCreateWebhook, useDeleteWebhook } from "@/lib/hooks";
import { Webhook, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const C = {
  s1: "#0C1A30",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  red: "#EF4444",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
  success: "#22C55E",
};

export default function WebhooksPage() {
  const { data: endpoints, isLoading } = useWebhooks();
  const createMutation = useCreateWebhook();
  const deleteMutation = useDeleteWebhook();

  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["score.completed"]);

  const allEvents = [
    "score.completed",
    "score.failed",
    "outcome.submitted",
    "consent.granted",
    "consent.revoked",
  ];

  const toggleEvent = useCallback((ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newUrl.trim()) return;
    try {
      await createMutation.mutateAsync({ url: newUrl.trim(), events: selectedEvents });
      setNewUrl("");
      setSelectedEvents(["score.completed"]);
      setShowForm(false);
      toast.success("Webhook endpoint added");
    } catch {
      toast.error("Failed to add webhook endpoint");
    }
  }, [newUrl, selectedEvents, createMutation]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.info("Webhook endpoint removed");
      } catch {
        toast.error("Failed to delete webhook");
      }
    },
    [deleteMutation]
  );

  if (isLoading) {
    return (
      <div>
        <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">Webhook Endpoints</h1>
        <p className="text-credaly-muted text-[13px] m-0 mb-6">Loading webhook endpoints...</p>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-credaly-s2 rounded mb-2" />
              <div className="h-3 w-32 bg-credaly-s2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-[4px]">
            Webhook Endpoints
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Receive real-time notifications when scoring results are ready.
          </p>
        </div>
        <Btn onClick={() => setShowForm(true)} aria-label="Add Webhook Endpoint">
          <Plus size={14} /> Add Endpoint
        </Btn>
      </div>

      {/* How it works */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-[16px_20px] mb-5">
        <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[14px]">
          How It Works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <Webhook size={18} className="text-credaly-amber" />, title: "Register URL", desc: "Add your HTTPS endpoint to receive events" },
            { icon: <AlertCircle size={18} className="text-credaly-teal" />, title: "We Send", desc: "POST requests with HMAC-SHA256 signature" },
            { icon: <CheckCircle size={18} className="text-credaly-success" />, title: "You Acknowledge", desc: "Respond with 200 to confirm delivery" },
          ].map((step) => (
            <div key={step.title} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-lg bg-[rgba(100,140,200,0.08)] flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-credaly-text m-0 mb-[2px]">{step.title}</p>
                <p className="text-[11px] text-credaly-muted m-0 leading-[1.4]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6 mb-4">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            New Webhook Endpoint
          </p>
          <div className="mb-4">
            <label className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
              Endpoint URL
            </label>
            <input
              aria-label="Webhook Endpoint URL"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://api.yourapp.com/webhooks/credaly"
              className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans"
            />
          </div>
          <div className="mb-4">
            <label className="text-[11px] text-credaly-muted block mb-2 tracking-[0.05em] uppercase">
              Events to Subscribe To
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Event selection">
              {allEvents.map((ev) => {
                const active = selectedEvents.includes(ev);
                return (
                  <button
                    key={ev}
                    onClick={() => toggleEvent(ev)}
                    aria-label={`Toggle event ${ev}`}
                    className={`text-[11px] font-semibold px-[10px] py-[5px] rounded-full border transition-all font-sans ${
                      active
                        ? "bg-[rgba(245,166,35,0.1)] border-credaly-amber text-credaly-amber"
                        : "bg-transparent border-[rgba(100,140,200,0.12)] text-credaly-muted"
                    }`}
                  >
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <Btn onClick={handleAdd} disabled={!newUrl.trim() || createMutation.isPending} aria-label="Save Webhook">
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save Endpoint"}
            </Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)} aria-label="Cancel">Cancel</Btn>
          </div>
        </div>
      )}

      {/* Endpoints list */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
          <p className="text-sm font-semibold text-credaly-text m-0">Configured Endpoints</p>
        </div>
        {!Array.isArray(endpoints) || endpoints.length === 0 ? (
          <div className="p-12 text-center text-credaly-faint text-sm">
            <Webhook size={24} className="mx-auto mb-2 opacity-50" />
            No webhook endpoints configured. Add one to receive real-time events.
          </div>
        ) : (
          endpoints.map((ep, i) => (
            <div
              key={ep.id}
              className={`px-5 py-4 ${i > 0 ? "border-t border-[rgba(100,140,200,0.12)]" : ""} ${!ep.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Webhook size={14} className="text-credaly-faint shrink-0" />
                    <code className="text-[12px] text-credaly-text font-mono truncate">{ep.url}</code>
                    <Badge label={ep.is_active ? "active" : "disabled"} color={ep.is_active ? C.teal : C.muted} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ep.events.map((ev) => (
                      <span key={ev} className="text-[10px] text-credaly-faint bg-[rgba(100,140,200,0.06)] px-[6px] py-[2px] rounded-md font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-credaly-faint">
                    {ep.last_triggered ? `Last: ${new Date(ep.last_triggered).toLocaleDateString()}` : "Never triggered"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Btn variant="danger" size="sm" onClick={() => handleDelete(ep.id)} disabled={deleteMutation.isPending} aria-label="Delete webhook endpoint">
                  {deleteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <><Trash2 size={12} /> Delete</>}
                </Btn>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
