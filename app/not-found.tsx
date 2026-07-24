'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PoisikLogo } from '@/components/poisik';

const MESSAGES: Record<string, { notFound: string; goHome: string }> = {
  en: {
    notFound:
      "This page doesn't exist — but your design probably does. Let's take a look at it instead.",
    goHome: 'Go Home',
  },
  fr: {
    notFound:
      "Cette page n'existe pas — mais votre design, lui, existe probablement. Et si on l'analysait ?",
    goHome: "Retour à l'accueil",
  },
};

function getLocale() {
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  return match?.[1] || 'en';
}

export default function NotFound() {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    setLocale(getLocale());
  }, []);

  const t = MESSAGES[locale] || MESSAGES.en;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base text-text-primary antialiased">
      <div className="flex flex-col items-center gap-lg text-center">
        <PoisikLogo size="lg" />
        <p className="text-[120px] font-bold leading-none text-text-muted">404</p>
        <p className="max-w-md text-body-lg text-text-secondary">{t.notFound}</p>
        <Link
          href="/"
          className="rounded-xl bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-opacity hover:opacity-90"
        >
          {t.goHome}
        </Link>
      </div>
    </div>
  );
}
