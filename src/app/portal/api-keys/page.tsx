"use client";

import { useState, useCallback } from "react";
import { Badge, Btn } from "@/components/portal/ui-primitives";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/hooks";
import { Key, Copy, Eye, EyeOff, Trash2, Plus, Check, AlertTriangle, Loader2 } from "lucide-react";
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
};

export default function ApiKeysPage() {
  const { data: keys, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();

  const [showKey, setShowKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!newKeyName.trim()) return;
    try {
      const result = await createMutation.mutateAsync({
        name: newKeyName.trim(),
        environment: "production",
      });
      setJustCreated((result as { rawApiKey?: string })?.rawApiKey || "Key created");
      toast.success(`API key "${newKeyName}" created`);
      setNewKeyName("");
      setTimeout(() => setJustCreated(null), 30000);
    } catch {
      toast.error("Failed to create API key");
    }
  }, [newKeyName, createMutation]);

  const handleRevoke = useCallback(async (id: string) => {
    try {
      await revokeMutation.mutateAsync(id);
      toast.info("API key revoked");
    } catch {
      toast.error("Failed to revoke key");
    }
  }, [revokeMutation]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-[22px] font-bold text-credaly-text m-0 mb-1">API Keys</h1>
        <p className="text-credaly-muted text-[13px] m-0 mb-6">Loading your API keys...</p>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-5 animate-pulse">
              <div className="h-4 w-32 bg-credaly-s2 rounded mb-2" />
              <div className="h-3 w-64 bg-credaly-s2 rounded" />
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
            API Keys
          </h1>
          <p className="text-credaly-muted text-[13px] m-0">
            Manage your API keys for authentication. Keys use HMAC signing (PRD FR-032).
          </p>
        </div>
        {!justCreated && (
          <Btn onClick={() => setShowCreateForm(true)} aria-label="Create New API Key">
            <Plus size={14} /> Create Key
          </Btn>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-[10px] p-[12px_16px] mb-5 flex gap-[10px] items-start">
        <AlertTriangle size={18} className="text-credaly-amber shrink-0 mt-[2px]" />
        <p className="text-[12px] text-credaly-amber m-0 leading-[1.5]">
          Never share your secret keys. If a key is compromised, revoke it immediately. Keys are hashed with bcrypt (12 rounds) in the database and only shown once at creation.
        </p>
      </div>

      {/* Create form / reveal */}
      {showCreateForm && (
        <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6 mb-4">
          <p className="text-[12px] font-semibold text-credaly-muted uppercase tracking-[0.06em] m-0 mb-[18px]">
            Generate New Key
          </p>

          {justCreated ? (
            <div className="bg-[rgba(0,201,167,0.06)] border border-[rgba(0,201,167,0.2)] rounded-lg p-[14px_16px]">
              <p className="text-[12px] text-credaly-teal m-0 mb-[6px] font-semibold flex items-center gap-1.5">
                <Check size={14} /> Key Created — Copy it now!
              </p>
              <div className="flex items-center gap-2 bg-[#112240] rounded-md p-[10px_14px]">
                <code className="text-[12px] text-credaly-text flex-1 font-mono break-all">{justCreated}</code>
                <button onClick={() => handleCopy(justCreated)} aria-label="Copy key" className="bg-transparent border-none text-credaly-muted cursor-pointer p-1">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-[10px] text-credaly-faint m-0 mt-[6px]">This is the only time you will see the full key.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-[11px] text-credaly-muted block mb-1.5 tracking-[0.05em] uppercase">
                  Key Name
                </label>
                <input
                  aria-label="API Key Name"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Backend"
                  className="w-full bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-lg px-[14px] py-[10px] text-credaly-text text-[13px] outline-none box-border font-sans"
                />
              </div>
              <div className="flex gap-2">
                <Btn onClick={handleCreate} disabled={!newKeyName.trim() || createMutation.isPending} aria-label="Generate Key">
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Generate Key"}
                </Btn>
                <Btn variant="ghost" onClick={() => setShowCreateForm(false)} aria-label="Cancel">Cancel</Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* Keys list */}
      <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-[18px] border-b border-[rgba(100,140,200,0.12)]">
          <p className="text-sm font-semibold text-credaly-text m-0">Your API Keys</p>
        </div>
        {!Array.isArray(keys) || keys.length === 0 ? (
          <div className="p-12 text-center text-credaly-faint text-sm">
            <Key size={24} className="mx-auto mb-2 opacity-50" />
            No API keys yet. Create one to start integrating.
          </div>
        ) : (
          keys.map((key, i) => (
            <div
              key={key.id}
              className={`px-5 py-4 flex items-center gap-4 ${i > 0 ? "border-t border-[rgba(100,140,200,0.12)]" : ""} ${!key.is_active ? "opacity-60" : ""}`}
            >
              <Key size={18} className="text-credaly-faint shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-credaly-text m-0 font-medium">{key.name}</p>
                  <Badge label={key.is_active ? "active" : "revoked"} color={key.is_active ? C.teal : C.muted} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-[11px] text-credaly-muted font-mono">
                    {showKey === key.id ? key.id : `${key.key_prefix}••••`}
                  </code>
                  {key.is_active && (
                    <button
                      onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      aria-label={showKey === key.id ? "Hide key" : "Show key"}
                      className="bg-transparent border-none text-credaly-faint cursor-pointer p-0.5 hover:text-credaly-muted transition-colors"
                    >
                      {showKey === key.id ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(key.id)}
                    aria-label="Copy key ID"
                    className="bg-transparent border-none text-credaly-faint cursor-pointer p-0.5 hover:text-credaly-muted transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-credaly-text m-0">{key.environment}</p>
                <p className="text-[10px] text-credaly-faint m-0">
                  {key.last_used ? `Last: ${new Date(key.last_used).toLocaleDateString()}` : "Never used"}
                </p>
              </div>
              {key.is_active && (
                <Btn
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevoke(key.id)}
                  disabled={revokeMutation.isPending}
                  aria-label={`Revoke ${key.name}`}
                >
                  {revokeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <><Trash2 size={12} /> Revoke</>}
                </Btn>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
