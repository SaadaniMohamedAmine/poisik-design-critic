'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PoisikLogo, UploadDropzone } from '@/components/poisik';
import { Lightbulb, Link2 } from 'lucide-react';

export default function UploadPage() {
  const t = useTranslations('Upload');
  const n = useTranslations('Navigation');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const handleUrlAnalyze = async () => {
    setUrlError('');
    setUrlLoading(true);
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      console.log('Captured:', data);
    } catch (err) {
      setUrlError(
        err instanceof Error ? err.message : "We couldn't load that page — try uploading a screenshot instead."
      );
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <div className="flex items-center gap-md">
          <PoisikLogo size="md" />
          <nav className="ml-xl hidden items-center gap-lg md:flex">
            <a href="#" className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal">{n('dashboard')}</a>
            <a href="#" className="text-label-md font-medium text-accent-signal underline decoration-accent-signal underline-offset-4">{n('auditLogs')}</a>
            <a href="#" className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal">{n('knowledgeBase')}</a>
            <a href="#" className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal">{n('settings')}</a>
          </nav>
        </div>
        <button className="rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90">{n('runNewAudit')}</button>
      </header>

      <main className="flex min-h-screen items-center justify-center px-margin pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent-signal/5 blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent-glow/5 blur-[120px]" />
        </div>

        <section className="z-10 w-full max-w-2xl">
          <div className="mb-xl text-center">
            <h1 className="mb-base text-display-lg font-semibold tracking-tight text-text-primary">{t('title')}</h1>
            <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
          </div>

          {/* Mode toggle */}
          <div className="mb-lg flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 rounded-md px-4 py-2 text-label-md font-medium transition-colors ${
                mode === 'upload' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upload screenshot
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 rounded-md px-4 py-2 text-label-md font-medium transition-colors flex items-center justify-center gap-2 ${
                mode === 'url' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Link2 className="size-4" />
              Analyze a URL
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface-container-low p-lg">
            {mode === 'upload' ? (
              <UploadDropzone
                onAnalyze={(imageUrl) => {
                  console.log('Image URL:', imageUrl);
                }}
              />
            ) : (
              <div className="space-y-lg">
                <div>
                  <label className="mb-2 block text-label-md text-text-secondary">Enter a URL to analyze</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-border bg-surface p-3 text-body-md text-text-primary placeholder:text-text-muted focus:border-accent-signal focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleUrlAnalyze}
                  disabled={urlLoading || !url}
                  className="w-full rounded-lg bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {urlLoading ? 'Analyzing...' : 'Analyze URL'}
                </button>
                {urlError && (
                  <p className="rounded-lg bg-surface px-md py-sm text-label-md text-destructive">{urlError}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-lg flex items-start gap-md rounded-xl border border-border/30 bg-surface/30 p-md">
            <Lightbulb className="mt-0.5 size-5 text-accent-signal" />
            <p className="text-label-md italic text-text-secondary">&ldquo;{t('proTip')}&rdquo;</p>
          </div>
        </section>
      </main>
    </div>
  );
}
