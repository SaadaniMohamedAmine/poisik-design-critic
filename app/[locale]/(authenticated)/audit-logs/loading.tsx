function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function AuditLogsLoading() {
  return (
    <div>
      <div className="mb-xl flex items-center gap-md">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="space-y-xs">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="space-y-md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
