'use client';

import { useEffect, useState } from 'react';
import { PoisikLogo } from './PoisikLogo';

const DURATION_MS = 1400;

export function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
      setProgress(pct);

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setFadingOut(true);
        window.setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = previousOverflow;
        }, 300);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-md bg-bg-base transition-opacity duration-300 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-20 rounded-full bg-accent-signal/10 blur-2xl sm:size-32" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-border-strong bg-surface shadow-[0_0_40px_-8px_var(--color-accent-glow)] sm:size-20">
          <span className="text-headline-sm font-black text-accent-signal sm:text-display-lg">
            P
          </span>
        </div>
      </div>

      <div className="mt-sm flex flex-col items-center gap-xs text-center sm:mt-md">
        <PoisikLogo
          size="md"
          className="font-black capitalize text-accent-signal sm:text-display-lg"
        />
        <p className="text-label-sm uppercase tracking-[0.1em] text-text-secondary sm:tracking-[0.2em]">
          Design and passion, with poise.
        </p>
      </div>

      <div className="mt-md w-48 sm:mt-lg sm:w-64">
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div
            className="h-full rounded-full bg-linear-to-r from-accent-signal to-accent-glow transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-xs flex items-center justify-between text-label-sm uppercase tracking-widest text-text-muted">
          <span>Loading</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
