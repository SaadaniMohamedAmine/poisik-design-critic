function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function KnowledgeBaseLoading() {
  return (
    <div className="space-y-xl">
      <div className="flex items-center gap-md">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="space-y-xs">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <Skeleton className="h-40 w-full rounded-xl" />

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
