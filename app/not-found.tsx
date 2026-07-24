'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, HelpCircle, History, BookOpen, Search } from 'lucide-react';
import { PoisikLogo, GlitchText } from '@/components/poisik';

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
  const [locale] = useState(() => {
    if (typeof document === 'undefined') return 'en';
    return getLocale();
  });
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

  const t = MESSAGES[locale] || MESSAGES.en;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base text-text-primary antialiased selection:bg-accent-signal/30">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
        <button className="p-sm text-text-secondary transition-colors hover:text-accent-signal">
          <HelpCircle className="size-5" />
        </button>
      </header>

      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-margin pt-20">
        <div className="pointer-events-none absolute inset-0">
          <div
            ref={glowRef}
            className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-signal/5 blur-[120px]"
            style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
          />
        </div>

        <div className="z-10 flex w-full flex-col items-center text-center">
          <GlitchText text="404" />

          <div className="mb-xl space-y-4">
            <h2 className="text-headline-md font-medium text-text-primary">Resource Not Found</h2>
            <p className="text-base leading-relaxed text-text-secondary">{t.notFound}</p>
          </div>

          <div className="flex flex-col items-center gap-md sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-sm rounded-xl bg-accent-signal px-xl py-md text-label-md font-medium text-white transition-all hover:opacity-90 active:scale-95"
            >
              <Home className="size-4" />
              {t.goHome}
            </Link>
            <button className="inline-flex items-center gap-sm rounded-xl border border-border px-xl py-md text-label-md font-medium text-text-secondary transition-all hover:bg-surface">
              <HelpCircle className="size-4" />
              Contact Support
            </button>
          </div>
        </div>

        <div className="z-10 mt-xxl grid w-full max-w-5xl grid-cols-1 gap-lg md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <History className="size-4" />
              <span className="text-label-md font-medium">Audit Logs</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Check your recent activity logs to see if the session was recently closed.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <BookOpen className="size-4" />
              <span className="text-label-md font-medium">Knowledge Base</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Explore documentation on how Poisik handles resource expiration.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/50 p-lg backdrop-blur-sm">
            <div className="mb-sm flex items-center gap-sm text-accent-signal">
              <Search className="size-4" />
              <span className="text-label-md font-medium">Search Dashboard</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Use our global search to find the audit by Project ID or Timestamp.
            </p>
          </div>
        </div>
      </main>

      <footer className="mx-auto mt-xxl flex w-full max-w-7xl flex-col items-center justify-between gap-md border-t border-border px-margin py-xl md:flex-row">
        <div className="flex flex-col items-center gap-xs md:items-start">
          <span className="text-label-md font-bold text-text-primary">Poisik AI</span>
          <span className="text-label-sm text-text-secondary">
            © 2024 Poisik AI. All rights reserved.
          </span>
        </div>
        <div className="flex gap-lg">
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Security
          </a>
        </div>
      </footer>

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
