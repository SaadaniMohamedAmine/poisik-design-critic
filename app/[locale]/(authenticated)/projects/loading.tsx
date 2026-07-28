function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function ProjectsLoading() {
  return (
    <div>
      <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-md">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="space-y-xs">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-full md:w-64" />
      </div>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-sm p-lg">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
