'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { Home, HelpCircle, History, BookOpen, Search } from 'lucide-react';
// Imported from their own files, not the '@/components/poisik' barrel —
// that barrel also re-exports AppShell, which pulls in lib/prisma.ts.
// This file is a Client Component, so bundling anything that imports
// Prisma into it fails at build time ("Can't resolve
// .prisma/client/index-browser", Prisma's client isn't meant to run in
// the browser at all).
import { GlitchText } from '@/components/poisik/GlitchText';
import { MarketingHeader } from '@/components/poisik/MarketingHeader';
import { MarketingFooter } from '@/components/poisik/MarketingFooter';
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';

const MESSAGE_CATALOGS: Record<string, typeof enMessages> = {
  en: enMessages,
  fr: frMessages,
};

function getLocale() {
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  return match?.[1] || 'en';
}

// useTranslations() reads from NextIntlClientProvider's context, so it has
// to run in a component nested *under* the provider below — not in the same
// component instance that renders the provider around its own JSX.
function NotFoundContent() {
  const t = useTranslations('NotFound');
  const tError = useTranslations('Error');
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      glowRef.current.style.transform = `translate(${(x - 0.5) * 50}px, ${(y - 0.5) * 50}px) translate(-50%, -50%)`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base text-text-primary antialiased selection:bg-accent-signal/30">
      <MarketingHeader />

      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-margin pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div
            ref={glowRef}
            className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-signal/5 blur-[120px]"
            style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
          />
        </div>

        <div className="z-10 flex w-full max-w-3xl flex-col items-center text-center">
          <GlitchText text="404" />

          <div className="mb-xl space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">{t('title')}</h2>
            <p className="text-base leading-relaxed text-text-secondary">{tError('notFound')}</p>
          </div>

          <div className="flex flex-col items-center gap-md sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-sm rounded-xl bg-accent-signal px-xl py-md text-label-md font-medium text-white transition-all hover:opacity-90 active:scale-95"
            >
              <Home className="size-4" />
              {tError('goHome')}
            </Link>
            <button className="inline-flex items-center gap-sm rounded-xl border border-border px-xl py-md text-label-md font-medium text-text-secondary transition-all hover:bg-surface">
              <HelpCircle className="size-4" />
              {t('contactSupport')}
            </button>
          </div>
        </div>

        <div className="z-10 mt-xxl grid w-full max-w-5xl grid-cols-1 gap-lg md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <History className="size-4" />
              <span className="text-label-md font-medium">{t('auditLogsLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('auditLogsDesc')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <BookOpen className="size-4" />
              <span className="text-label-md font-medium">{t('knowledgeBaseLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('knowledgeBaseDesc')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <Search className="size-4" />
              <span className="text-label-md font-medium">{t('searchDashboardLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('searchDashboardDesc')}</p>
          </div>
        </div>
      </main>

      <MarketingFooter />

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default function NotFound() {
  const [locale] = useState(() => {
    if (typeof document === 'undefined') return 'en';
    return getLocale();
  });
  const messages = MESSAGE_CATALOGS[locale] || MESSAGE_CATALOGS.en;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundContent />
    </NextIntlClientProvider>
  );
}
