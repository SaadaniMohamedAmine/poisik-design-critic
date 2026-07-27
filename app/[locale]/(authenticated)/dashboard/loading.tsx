function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="space-y-gutter">
      <div className="space-y-sm">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-lg">
            <div className="mb-md flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="rounded-xl border border-border bg-surface p-lg lg:col-span-8">
          <Skeleton className="mb-lg h-6 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-surface p-lg lg:col-span-4">
          <Skeleton className="mb-lg h-6 w-24" />
          <Skeleton className="mb-md h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="rounded-xl border border-border bg-surface p-lg lg:col-span-7">
          <Skeleton className="mb-lg h-6 w-32" />
          <div className="space-y-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-lg lg:col-span-5">
          <Skeleton className="mb-lg h-6 w-28" />
          <div className="space-y-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
