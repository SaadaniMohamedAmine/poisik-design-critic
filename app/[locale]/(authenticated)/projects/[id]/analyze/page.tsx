'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { UploadDropzone } from '@/components/poisik';
import { Link2 } from 'lucide-react';

export default function ProjectAnalyzePage() {
  const t = useTranslations('Upload');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createAnalysis(imageUrl: string) {
    setLoading(true);
    setError('');
    const toastId = toast.loading('Running your AI audit...');
    const res = await fetch(`/api/projects/${params.id}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      const message =
        data.error === 'MONTHLY_LIMIT_REACHED'
          ? "You've reached your monthly analysis limit — upgrade to keep auditing."
          : (data.error ?? "The analysis didn't come back as expected — try again.");
      setError(message);
      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 5000 });
      return;
    }
    const analysis = await res.json();
    toast.update(toastId, {
      render: 'Analysis complete — your report is ready.',
      type: 'success',
      isLoading: false,
      autoClose: 4000,
    });
    router.push(`/report/${analysis.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl text-center">
        <h1 className="mb-xs text-headline-lg font-semibold text-text-primary">{t('title')}</h1>
        <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="mb-lg flex rounded-lg border border-border bg-surface p-1">
        <button className="flex-1 rounded-md bg-accent-signal px-4 py-2 text-label-md font-medium text-white transition-colors">
          Upload screenshot
        </button>
        <button
          disabled
          title="Coming soon — live URL analysis needs a screenshot-capture step that isn't wired up yet"
          className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-medium text-text-muted opacity-50"
        >
          <Link2 className="size-4" />
          Analyze a URL — coming soon
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-lg">
        <UploadDropzone onAnalyze={createAnalysis} />
        {loading && <p className="mt-md text-label-md text-text-secondary">Analyzing...</p>}
        {error && <p className="mt-md text-label-md text-accent-signal">{error}</p>}
      </div>
    </div>
  );
}
