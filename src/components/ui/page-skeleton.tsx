import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  /** Number of content blocks to show (default: 4) */
  blocks?: number;
  /** Whether to show a header skeleton */
  showHeader?: boolean;
  /** Whether to show a table skeleton */
  showTable?: boolean;
  /** Screen reader label */
  label?: string;
}

/**
 * Reusable loading skeleton for all pages.
 * Provides consistent loading states with accessibility support.
 */
export function PageSkeleton({
  blocks = 4,
  showHeader = true,
  showTable = false,
  label = "Loading content",
}: PageSkeletonProps) {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {showHeader && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-credaly-s2" />
          <Skeleton className="h-4 w-72 bg-credaly-s2/60" />
        </div>
      )}

      {showTable ? (
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex gap-4 px-4 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24 bg-credaly-s2/60" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} className="flex gap-4 px-4 py-3 border-t border-credaly-s2/30">
              {Array.from({ length: 5 }).map((_, col) => (
                <Skeleton key={col} className="h-4 flex-1 bg-credaly-s2/40" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* Content blocks */
        Array.from({ length: blocks }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 rounded-xl bg-credaly-s1/50 border border-credaly-s2/30">
            <Skeleton className="h-5 w-32 bg-credaly-s2/60" />
            <Skeleton className="h-4 w-full bg-credaly-s2/40" />
            <Skeleton className="h-4 w-3/4 bg-credaly-s2/40" />
          </div>
        ))
      )}

      {/* Screen reader only */}
      <span className="sr-only">{label}</span>
    </div>
  );
}
