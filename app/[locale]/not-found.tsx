'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Home, HelpCircle, History, BookOpen, Search } from 'lucide-react';
// See app/not-found.tsx for why these are imported directly instead of
// from the '@/components/poisik' barrel (which also exports AppShell,
// pulling lib/prisma.ts into this Client Component's browser bundle).
import { GlitchText } from '@/components/poisik/GlitchText';
import { MarketingHeader } from '@/components/poisik/MarketingHeader';
import { MarketingFooter } from '@/components/poisik/MarketingFooter';

export default function LocaleNotFound() {
  const t = useTranslations('NotFound');
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
            <p className="text-base leading-relaxed text-text-secondary">{t('description')}</p>
          </div>

          <div className="flex flex-col items-center gap-md sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-sm rounded-xl bg-accent-signal px-xl py-md text-label-md font-medium text-white transition-all hover:opacity-90 active:scale-95"
            >
              <Home className="size-4" />
              {t('returnHome')}
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
