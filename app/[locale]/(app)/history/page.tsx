'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { History, ExternalLink } from 'lucide-react';
import { PoisikLogo } from '@/components/poisik';
import type { AnalysisResult } from '@/lib/schemas';

interface Analysis {
  id: string;
  imageUrl: string;
  result: AnalysisResult;
  isPublic: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const t = useTranslations('History');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => setAnalyses(data.analyses || []))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
      </header>

      <main className="mx-auto max-w-5xl px-margin pt-32 pb-xxl">
        {loading ? (
          <div className="flex items-center justify-center py-xxl">
            <div className="size-8 animate-spin rounded-full border-2 border-accent-signal border-t-transparent" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl text-center">
            <div className="mb-lg flex size-24 items-center justify-center rounded-full bg-surface">
              <History className="size-12 text-accent-signal" />
            </div>
            <h2 className="mb-md text-headline-lg font-semibold text-text-primary">{t('emptyTitle')}</h2>
            <p className="mb-xl max-w-md text-body-md text-text-secondary">{t('emptyDesc')}</p>
            <a href="/upload" className="rounded-xl bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-transform hover:scale-95">{t('runFirstAudit')}</a>
          </div>
        ) : (
          <>
            <h1 className="mb-xl text-headline-lg font-semibold text-text-primary">{t('title')}</h1>
            <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis) => (
                <a
                  key={analysis.id}
                  href={`/report/${analysis.id}`}
                  className="group rounded-xl border border-border bg-surface p-lg transition-all hover:border-accent-signal/50"
                >
                  <div className="mb-md aspect-video w-full overflow-hidden rounded-lg bg-surface">
                    <img
                      src={analysis.imageUrl}
                      alt="Screenshot thumbnail"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-headline-md font-bold text-accent-signal">
                        {analysis.result.overall_score}
                      </p>
                      <p className="text-label-sm text-text-muted">
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                    <ExternalLink className="size-4 text-text-muted transition-colors group-hover:text-accent-signal" />
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
