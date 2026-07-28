function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className ?? ''}`} />;
}

export default function AnalyzeLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl space-y-sm text-center">
        <Skeleton className="mx-auto h-9 w-64" />
        <Skeleton className="mx-auto h-4 w-80" />
      </div>
      <Skeleton className="mb-lg h-11 w-full rounded-lg" />
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="mt-lg h-14 w-full rounded-xl" />
    </div>
  );
}
