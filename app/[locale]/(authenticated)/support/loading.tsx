function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function SupportLoading() {
  return (
    <div className="mx-auto max-w-160 space-y-xl">
      <div className="flex items-center gap-md">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="space-y-xs">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="space-y-lg rounded-xl border border-border bg-surface p-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-xs">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
