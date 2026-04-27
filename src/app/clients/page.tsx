import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useClients,
  useCreateClient,
  useSuspendClient,
  useTerminateClient,
  useReactivateClient,
  useRotateClientKey,
} from '@/lib/hooks';
import { formatDate, getStatusColor } from '@/lib/utils-format';
import { Plus, MoreVertical, Copy, AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { mockClients } from '@/lib/mock-data';

const C = {
  bg: '#06101E',
  s1: '#0C1A30',
  s2: '#112240',
  s3: '#162C52',
  border: 'rgba(100,140,200,0.12)',
  teal: '#00C9A7',
  success: '#22C55E',
  amber: '#F5A623',
  orange: '#F97316',
  red: '#EF4444',
  blue: '#3B82F6',
  amberFaint: 'rgba(245,166,35,0.1)',
  amberBorder: 'rgba(245,166,35,0.2)',
  tealFaint: 'rgba(0,201,167,0.1)',
  text: '#E2EAF4',
  muted: '#6B84A8',
  faint: '#2A3F60',
};

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  environment: z.enum(["sandbox", "production"]),
  rate_limit: z.number().min(10).max(10000),
  tier_telco: z.boolean(),
  tier_mobile_money: z.boolean(),
  tier_bureau: z.boolean(),
});

type ClientFormInput = z.infer<typeof clientSchema>;

const TIERS = [
  { key: 'tier_telco' as const, label: 'Telco Data' },
  { key: 'tier_mobile_money' as const, label: 'Mobile Money' },
  { key: 'tier_bureau' as const, label: 'Bureau Data' },
];

export default function ClientsPage() {
  const { data: clients, isLoading, isError } = useClients();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const createMutation = useCreateClient();
  const suspendMutation = useSuspendClient();
  const terminateMutation = useTerminateClient();
  const reactivateMutation = useReactivateClient();
  const rotateKeyMutation = useRotateClientKey();

  const cArray = Array.isArray(clients) ? clients : (mockClients || []);
  const cl = cArray.filter((c: any) => !statusFilter || c.status === statusFilter);

  const form = useForm<ClientFormInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      environment: 'sandbox',
      rate_limit: 100,
      tier_telco: true,
      tier_mobile_money: true,
      tier_bureau: false,
    },
  });

  const onSubmit = async (data: ClientFormInput) => {
    const tier_access = TIERS.filter((t) => data[t.key]).map((t) => t.key.replace('tier_', ''));
    try {
      const result = await createMutation.mutateAsync({
        name: data.name,
        environment: data.environment,
        tier_access,
        rate_limit: data.rate_limit,
      });
      setNewApiKey(result.rawApiKey);
      toast.success(`Client "${result.client.name}" created successfully`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create client';
      toast.error(message);
    }
  };

  const handleAction = async (action: string, id: string, name: string) => {
    try {
      switch (action) {
        case 'suspend':
          await suspendMutation.mutateAsync(id);
          toast.success(`"${name}" suspended`);
          break;
        case 'terminate':
          await terminateMutation.mutateAsync(id);
          toast.success(`"${name}" terminated`);
          break;
        case 'reactivate':
          await reactivateMutation.mutateAsync(id);
          toast.success(`"${name}" reactivated`);
          break;
        case 'rotate-key': {
          const result = await rotateKeyMutation.mutateAsync(id);
          setNewApiKey(result.rawApiKey);
          toast.success(`API key rotated for "${name}"`);
          break;
        }
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${action} "${name}"`;
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {isError && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: C.amberFaint, border: `1px solid ${C.amberBorder}` }}>
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.amber }} />
          <div>
            <p className="text-sm font-medium" style={{ color: C.amber }}>Backend API Unavailable</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              Showing cached data. Client list may be outdated.
            </p>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, fontFamily: "Outfit, sans-serif" }}>Client Management</h2>
          <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>Manage partner clients, API keys, and access controls</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) { setNewApiKey(null); form.reset(); } }}>
          <DialogTrigger asChild>
            <Button style={{ background: C.amber, color: '#06101E', border: 'none' }} className="hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" style={{ background: '#0C1A30', border: `1px solid ${C.border}`, color: C.text }}>
            {newApiKey ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2" style={{ color: C.text }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: C.success }} />
                    Client Created
                  </DialogTitle>
                  <DialogDescription style={{ color: C.muted }}>
                    Copy the API key below. This is the only time it will be shown.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: C.amberFaint, border: `1px solid ${C.amberBorder}` }}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.amber }} />
                    <p className="text-xs font-medium" style={{ color: C.amber }}>
                      Store this key securely. It will not be shown again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md px-3 py-2 text-sm font-mono break-all" style={{ background: '#112240', color: C.muted }}>
                      {newApiKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(newApiKey);
                        toast.success('API key copied to clipboard');
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setShowAddDialog(false); setNewApiKey(null); }}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle style={{ color: C.text }}>Add New Client</DialogTitle>
                  <DialogDescription style={{ color: C.muted }}>
                    Create a new partner client with API access configuration.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: C.muted }}>Client Name</label>
                    <Input {...form.register('name')} placeholder="e.g., Tala Microfinance" style={{ marginTop: 8, background: '#112240', border: `1px solid ${C.border}`, color: C.text }} />
                    {form.formState.errors.name && (
                      <p className="text-xs mt-1" style={{ color: C.red }}>{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: C.muted }}>Environment</label>
                      <select {...form.register('environment')} style={{ marginTop: 8, width: "100%", borderRadius: 6, border: `1px solid ${C.border}`, padding: "8px 12px", fontSize: 14, background: '#112240', color: C.text }}>
                        <option value="sandbox" style={{ background: '#0C1A30' }}>Sandbox</option>
                        <option value="production" style={{ background: '#0C1A30' }}>Production</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: C.muted }}>Rate Limit (req/min)</label>
                      <Input type="number" {...form.register("rate_limit", { valueAsNumber: true })} min={10} max={10000} step="1" style={{ marginTop: 8, background: '#112240', border: `1px solid ${C.border}`, color: C.text }} />
                      {form.formState.errors.rate_limit && (
                        <p className="text-xs mt-1" style={{ color: C.red }}>{form.formState.errors.rate_limit.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: C.muted }}>Data Tier Access</label>
                    <div className="mt-3 space-y-3">
                      {TIERS.map((tier) => (
                        <label key={tier.key} className="flex items-center gap-3 text-sm" style={{ color: C.text, cursor: "pointer" }}>
                          <input type="checkbox" {...form.register(tier.key)} style={{ width: 16, height: 16, accentColor: C.amber, background: '#112240', border: `1px solid ${C.border}`, borderRadius: 4 }} />
                          {tier.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <DialogFooter style={{ marginTop: 24 }}>
                    <Button type="submit" disabled={createMutation.isPending} style={{ background: C.amber, color: '#06101E', border: 'none' }}>
                      {createMutation.isPending ? 'Creating...' : 'Create Client'}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['', 'active', 'suspended', 'terminated'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: statusFilter === status ? C.amberFaint : 'transparent',
              border: `1px solid ${statusFilter === status ? C.amber : C.border}`,
              color: statusFilter === status ? C.amber : C.muted,
            }}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Clients Table */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px" }}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Client</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Environment</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Tiers</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "right", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Rate Limit</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>API Key</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>DPA Signed</th>
                    <th style={{ padding: "12px 16px", color: C.muted, fontWeight: 500, textAlign: "right", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cl.map((client) => (
                    <tr key={client.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: "14px 16px" }}>
                        <div>
                          <p style={{ fontWeight: 500, color: C.text, margin: 0 }}>{client.name}</p>
                          <p style={{ fontSize: 11, color: C.faint, margin: "2px 0 0" }}>{client.id}</p>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                          fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600, display: "inline-block",
                          background: getStatusColor(client.status).includes("green") ? "rgba(34,197,94,0.1)" : getStatusColor(client.status).includes("red") ? "rgba(239,68,68,0.1)" : "rgba(245,166,35,0.1)",
                          color: getStatusColor(client.status).includes("green") ? C.success : getStatusColor(client.status).includes("red") ? C.red : C.amber 
                        }}>
                          {client.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                          fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600, display: "inline-block",
                          background: client.environment === 'production' ? "rgba(59,130,246,0.1)" : "rgba(107,116,132,0.1)",
                          color: client.environment === 'production' ? C.blue : C.text 
                        }}>
                          {client.environment.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {client.tier_access.map((tier) => (
                            <span key={tier} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 500, color: C.muted, border: `1px solid ${C.border}`, display: "inline-block" }}>
                              {tier}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: C.text, textAlign: "right", fontWeight: 500, fontFamily: "monospace" }}>{client.rate_limit}/min</td>
                      <td style={{ padding: "14px 16px", color: C.muted, fontFamily: "monospace", letterSpacing: "0.05em" }}>{client.api_key_prefix}----</td>
                      <td style={{ padding: "14px 16px", color: C.muted }}>{formatDate(client.dpa_signed_date)}</td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" style={{ color: C.muted }}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" style={{ background: C.s1, border: `1px solid ${C.border}`, color: C.text }}>
                            {client.status === 'active' && (
                              <>
                                <DropdownMenuItem onClick={() => handleAction('suspend', client.id, client.name)} style={{ cursor: "pointer", fontSize: 13 }}>
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('terminate', client.id, client.name)} style={{ cursor: "pointer", fontSize: 13, color: C.red }}>
                                  Terminate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('rotate-key', client.id, client.name)} style={{ cursor: "pointer", fontSize: 13 }}>
                                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                                  Rotate API Key
                                </DropdownMenuItem>
                              </>
                            )}
                            {client.status === 'suspended' && (
                              <DropdownMenuItem onClick={() => handleAction('reactivate', client.id, client.name)} style={{ cursor: "pointer", fontSize: 13, color: C.success }}>
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            {client.status === 'terminated' && (
                              <DropdownMenuItem onClick={() => handleAction('reactivate', client.id, client.name)} style={{ cursor: "pointer", fontSize: 13, color: C.success }}>
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
