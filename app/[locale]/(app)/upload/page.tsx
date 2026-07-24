'use client';

import { useTranslations } from 'next-intl';
import { PoisikLogo, UploadDropzone } from '@/components/poisik';
import { Lightbulb } from 'lucide-react';

export default function UploadPage() {
  const t = useTranslations('Upload');
  const n = useTranslations('Navigation');

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

          <div className="rounded-xl border border-border bg-surface-container-low p-lg">
            <UploadDropzone
              onAnalyze={(imageUrl) => {
                console.log('Image URL:', imageUrl);
              }}
            />
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
