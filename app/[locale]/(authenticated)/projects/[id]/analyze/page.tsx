'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/poisik';
import { Link2 } from 'lucide-react';

export default function ProjectAnalyzePage() {
  const t = useTranslations('Upload');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createAnalysis(imageUrl: string) {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/projects/${params.id}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "The analysis didn't come back as expected — try again.");
      return;
    }
    const analysis = await res.json();
    router.push(`/report/${analysis.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl text-center">
        <h1 className="mb-xs text-headline-lg font-semibold text-text-primary">{t('title')}</h1>
        <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="mb-lg flex rounded-lg border border-border bg-surface p-1">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 rounded-md px-4 py-2 text-label-md font-medium transition-colors ${mode === 'upload' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Upload screenshot
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-medium transition-colors ${mode === 'url' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Link2 className="size-4" />
          Analyze a URL
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-lg">
        {mode === 'upload' ? (
          <UploadDropzone onAnalyze={createAnalysis} />
        ) : (
          <div className="space-y-lg">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-border bg-bg-elevated p-3 text-body-md text-text-primary placeholder:text-text-muted focus:border-accent-signal focus:outline-none"
            />
            <button
              onClick={() => createAnalysis(url)}
              disabled={loading || !url}
              className="w-full rounded-lg bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze URL'}
            </button>
          </div>
        )}
        {loading && mode === 'upload' && (
          <p className="mt-md text-label-md text-text-secondary">Analyzing...</p>
        )}
        {error && <p className="mt-md text-label-md text-accent-signal">{error}</p>}
      </div>
    </div>
  );
}
