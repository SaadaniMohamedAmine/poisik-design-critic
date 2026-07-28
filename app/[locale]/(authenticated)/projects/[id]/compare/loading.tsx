function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function CompareLoading() {
  return (
    <div>
      <div className="mb-xl flex items-center gap-md">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="space-y-xs">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-md">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
