function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function NewAnalysisLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl flex items-center gap-md">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="space-y-xs">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="space-y-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
