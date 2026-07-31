function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-lg">
      <Skeleton className="h-7 w-40" />

      <div className="flex gap-sm border-b border-border pb-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      <div className="space-y-md rounded-xl border border-border bg-surface p-lg">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
