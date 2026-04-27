import { format } from 'date-fns';

export function formatNumber(n: number | undefined | null): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

export function formatPercent(n: number | undefined | null, decimals = 2): string {
  if (n == null) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return format(d, 'dd MMM yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return format(d, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getGiniLabel(gini: number | undefined | null): string {
  if (gini == null) return '—';
  if (gini >= 0.5) return 'Excellent';
  if (gini >= 0.4) return 'Good';
  if (gini >= 0.3) return 'Fair';
  return 'Poor';
}

export function getPSILabel(psi: number): { label: string; color: string } {
  if (psi < 0.1) return { label: 'No drift', color: 'text-emerald-600' };
  if (psi < 0.2) return { label: 'Low drift', color: 'text-amber-600' };
  if (psi < 0.25) return { label: 'Medium drift', color: 'text-orange-600' };
  return { label: 'High drift', color: 'text-red-600' };
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'active':
    case 'success':
    case 'ok':
    case 'granted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'warning':
    case 'suspended':
    case 'updated':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'error':
    case 'terminated':
    case 'withdrawn':
    case 'failed':
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getStatusDot(status: string): string {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'active':
    case 'ok':
      return 'bg-emerald-500';
    case 'warning':
    case 'suspended':
      return 'bg-amber-500';
    case 'error':
    case 'terminated':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}
