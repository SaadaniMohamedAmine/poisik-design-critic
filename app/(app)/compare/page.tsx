'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, TrendingUp, TrendingDown } from 'lucide-react';
import { PoisikLogo } from '@/components/poisik';

interface FilePreview {
  file: File;
  preview: string;
  score: number;
}

export default function ComparePage() {
  const [files, setFiles] = useState<(FilePreview | null)[]>([null, null]);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleFile = useCallback((index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    const score = Math.floor(Math.abs(file.name.length * 7 + file.size * 0.000001) % 40) + 60;
    setFiles((prev) => {
      const next = [...prev];
      if (next[index]?.preview) URL.revokeObjectURL(next[index]!.preview);
      next[index] = { file, preview, score };
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <div className="flex items-center gap-xl">
          <PoisikLogo size="md" />
          <nav className="hidden items-center gap-lg md:flex">
            <a href="/upload" className="text-label-md font-medium text-accent-signal">
              Analyze
            </a>
            <a
              href="/history"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              History
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-margin pt-32 pb-xxl">
        <h1 className="mb-xl text-headline-lg font-semibold text-text-primary">Compare Designs</h1>

        <div className="grid gap-xl md:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index}>
              {files[index] ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <Image
                    src={files[index]!.preview}
                    alt={`Design ${index + 1}`}
                    width={600}
                    height={900}
                    className="w-full object-cover"
                  />
                  <div className="absolute top-md right-md rounded-full bg-accent-signal px-md py-1 text-label-sm font-bold text-white">
                    Score: {files[index]!.score}
                  </div>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(files[index]!.preview);
                      setFiles((prev) => {
                        const next = [...prev];
                        next[index] = null;
                        return next;
                      });
                    }}
                    className="absolute top-md left-md rounded-lg bg-surface/80 px-md py-1 text-label-sm text-text-secondary backdrop-blur-sm transition-colors hover:text-text-primary"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => inputRefs[index].current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong p-xxl text-center transition-all hover:bg-surface-hover"
                >
                  <Upload className="mb-md size-8 text-accent-signal" />
                  <p className="mb-xs text-body-lg text-text-primary">Upload design {index + 1}</p>
                  <p className="text-label-sm text-text-muted">JPG, PNG, WebP — max 10MB</p>
                  <input
                    ref={inputRefs[index]}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(index, file);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {files[0] && files[1] && (
          <div className="mt-xl rounded-xl border border-border bg-surface p-lg">
            <h2 className="mb-md text-headline-md font-medium text-text-primary">
              Comparison Summary
            </h2>
            <div className="space-y-md">
              {[
                { label: 'Visual Hierarchy', a: 90, b: 75 },
                { label: 'Contrast', a: 65, b: 88 },
                { label: 'Spacing', a: 78, b: 72 },
                { label: 'Typography', a: 82, b: 85 },
                { label: 'Accessibility', a: 70, b: 80 },
                { label: 'Consistency', a: 95, b: 68 },
              ].map((cat) => {
                const diff = cat.b - cat.a;
                return (
                  <div
                    key={cat.label}
                    className="flex items-center justify-between border-b border-border pb-md last:border-0"
                  >
                    <span className="text-label-md font-medium text-text-primary">{cat.label}</span>
                    <div className="flex items-center gap-md">
                      <span className="text-label-md text-text-secondary">{cat.a}</span>
                      <span className="text-label-md text-text-muted">&rarr;</span>
                      <span className="text-label-md text-text-secondary">{cat.b}</span>
                      <span
                        className={`flex items-center gap-1 text-label-sm ${diff > 0 ? 'text-accent-signal' : 'text-text-muted'}`}
                      >
                        {diff > 0 ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                        {diff > 0 ? '+' : ''}
                        {diff}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
