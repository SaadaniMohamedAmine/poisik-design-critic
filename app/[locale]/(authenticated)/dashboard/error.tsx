'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[448px] flex-col items-center rounded-xl border border-border bg-surface p-lg text-center">
      <div className="mb-md flex size-16 items-center justify-center rounded-2xl border border-border bg-bg-elevated">
        <AlertTriangle className="size-7 text-accent-signal" strokeWidth={1.5} />
      </div>
      <h1 className="mb-sm text-headline-md font-bold text-text-primary">
        Couldn&apos;t load your dashboard
      </h1>
      <p className="mb-lg text-body-md text-text-secondary">
        Something went wrong while fetching your projects and analyses. This has been logged —
        please try again.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-sm rounded-xl bg-accent-signal px-lg py-md text-label-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <RotateCw className="size-4" strokeWidth={2} />
        Try again
      </button>
    </div>
  );
}
