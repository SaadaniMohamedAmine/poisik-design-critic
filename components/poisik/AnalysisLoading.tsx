'use client';

import { useEffect, useState, useRef } from 'react';
import { PoisikLogo } from './PoisikLogo';

const FALLBACK_TEXTS = [
  'Scanning visual hierarchy\u2026',
  'Calculating contrast ratios\u2026',
  'Checking spacing consistency\u2026',
];

interface AnalysisLoadingProps {
  streamUrl?: string;
  onComplete?: (result: unknown) => void;
  imageBase64?: string;
  mimeType?: string;
}

export function AnalysisLoading({
  streamUrl,
  onComplete,
  imageBase64,
  mimeType,
}: AnalysisLoadingProps) {
  const [narration, setNarration] = useState('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [hasStreamed, setHasStreamed] = useState(false);
  const bufferRef = useRef('');

  useEffect(() => {
    if (!streamUrl || !imageBase64 || !mimeType) return;

    let cancelled = false;

    fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType }),
    }).then(async (response) => {
      if (!response.body) return;

      setHasStreamed(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              bufferRef.current += data.text;
              setNarration(bufferRef.current);
            }
            if (data.result) {
              onComplete?.(data.result);
            }
          } catch {
            // skip
          }
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [streamUrl, imageBase64, mimeType, onComplete]);

  useEffect(() => {
    if (hasStreamed) return;
    const interval = setInterval(() => {
      setFallbackIndex((prev) => (prev + 1) % FALLBACK_TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [hasStreamed]);

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
      </header>

      <main className="flex flex-1 items-center justify-center pt-20">
        <div className="relative w-full max-w-128 px-margin">
          <div className="relative overflow-hidden rounded-xl border border-border blur-sm">
            <div className="aspect-[9/16] w-full bg-surface" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-[2px] bg-accent-glow/60 shadow-[0_0_12px_4px_rgba(95,156,242,0.3)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>

          <div className="mt-xl flex flex-col items-center gap-md text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
            {hasStreamed && narration ? (
              <p className="max-w-112 text-body-md text-text-secondary leading-relaxed">
                {narration}
              </p>
            ) : (
              <p className="text-body-md text-text-secondary">{FALLBACK_TEXTS[fallbackIndex]}</p>
            )}
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
