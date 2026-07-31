'use client';

import { CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useGettingStarted } from './GettingStartedContext';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Design reference: design_v3/getting_started_in_progress (checklist +
// progress ring) and getting_started_all_set (compact completed state).
// The Stitch export's "close" (X) icon is repurposed here as *minimize* —
// it collapses the card into the sidebar pill (GettingStartedPill.tsx)
// rather than deleting it outright; the real, permanent dismiss action only
// appears once every step is done, as the "Dismiss" button.
export function GettingStartedWidget() {
  const t = useTranslations('GettingStartedWidget');
  const gs = useGettingStarted();
  if (!gs || gs.dismissed || gs.minimized) return null;

  const doneCount = gs.items.filter((i) => i.done).length;
  const total = gs.items.length;
  const allDone = doneCount === total;

  if (allDone) {
    return (
      <div className="rounded-xl border border-border bg-bg-elevated p-lg">
        <div className="mb-sm flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent-soft-bg">
              <CheckCircle2 className="size-5 text-accent-signal" strokeWidth={1.5} />
            </div>
            <h2 className="text-label-md font-semibold text-text-primary">
              {t('fullySetUpTitle')}
            </h2>
          </div>
          <button
            onClick={gs.dismiss}
            aria-label={t('dismiss')}
            className="text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <p className="mb-md text-label-md text-text-muted">{t('fullySetUpDesc')}</p>
        <button
          onClick={gs.dismiss}
          className="h-11 w-full rounded-lg border border-border text-label-md text-text-primary opacity-80 transition-colors hover:bg-surface-hover hover:opacity-100"
        >
          {t('dismiss')}
        </button>
      </div>
    );
  }

  const offset = CIRCUMFERENCE - (doneCount / total) * CIRCUMFERENCE;

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-lg">
      <div className="mb-lg flex items-start justify-between">
        <div>
          <h2 className="text-headline-sm font-bold tracking-tight text-text-primary">
            {t('gettingStartedTitle')}
          </h2>
          <p className="mt-1 text-label-sm text-text-secondary">{t('completeYourSetup')}</p>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative flex size-12 items-center justify-center">
            <svg className="size-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="transparent"
                stroke="var(--color-border)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="transparent"
                stroke="var(--color-accent-signal)"
                strokeWidth="3"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-500"
              />
            </svg>
            <span className="absolute text-label-sm font-bold text-accent-signal">
              {doneCount}/{total}
            </span>
          </div>
          <button
            onClick={gs.minimize}
            aria-label={t('minimizeAria')}
            className="text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {gs.items.map((item) =>
          item.done ? (
            <div key={item.key} className="flex items-center gap-md rounded-lg p-md">
              <CheckCircle2 className="size-5 shrink-0 text-accent-signal" strokeWidth={1.5} />
              <span className="text-body-md text-text-muted line-through opacity-60">
                {item.label}
              </span>
            </div>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="group flex w-full items-center gap-md rounded-lg border border-transparent p-md text-left transition-all hover:border-border hover:bg-surface-hover"
            >
              <Circle className="size-5 shrink-0 text-text-muted" strokeWidth={1.5} />
              <span className="flex-1 text-body-md font-semibold text-text-primary">
                {item.label}
              </span>
              <ChevronRight className="size-4 -translate-x-1 text-text-secondary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
