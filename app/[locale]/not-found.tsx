'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PoisikLogo } from '@/components/poisik';

export default function LocaleNotFound() {
  const t = useTranslations('Error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-text-primary antialiased">
      <div className="flex flex-col items-center gap-lg text-center">
        <PoisikLogo size="lg" />
        <p className="text-[120px] font-bold leading-none text-text-muted">404</p>
        <p className="max-w-md text-body-lg text-text-secondary">{t('notFound')}</p>
        <Link href="/" className="rounded-xl bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-opacity hover:opacity-90">
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
