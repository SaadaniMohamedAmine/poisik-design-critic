'use client';

import { useEffect, useState } from 'react';
import { PoisikLogo } from './PoisikLogo';

const STATUS_TEXTS = [
  'Scanning visual hierarchy\u2026',
  'Calculating contrast ratios\u2026',
  'Checking spacing consistency\u2026',
];

export function AnalysisLoading() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
      </header>

      <main className="flex flex-1 items-center justify-center pt-20">
        <div className="relative w-full max-w-lg px-margin">
          {/* Blurred screenshot placeholder */}
          <div className="relative overflow-hidden rounded-xl border border-border blur-sm">
            <div className="aspect-[9/16] w-full bg-surface" />
            {/* Scanning line */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-[2px] bg-accent-glow/60 shadow-[0_0_12px_4px_rgba(95,156,242,0.3)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Status */}
          <div className="mt-xl flex flex-col items-center gap-md text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
            <p className="text-body-md text-text-secondary">{STATUS_TEXTS[statusIndex]}</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            top: 0;
          }
          50% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
