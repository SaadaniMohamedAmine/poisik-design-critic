function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-gutter">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="rounded-xl border border-border bg-surface p-lg lg:col-span-8">
          <Skeleton className="mb-lg h-6 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="flex flex-col gap-gutter lg:col-span-4">
          <div className="rounded-xl border border-border bg-surface p-lg">
            <Skeleton className="mb-md h-4 w-28" />
            <Skeleton className="mb-sm h-4 w-full" />
            <Skeleton className="mb-sm h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <div>
        <Skeleton className="mb-lg h-6 w-32" />
        <div className="space-y-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
