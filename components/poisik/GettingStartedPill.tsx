'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useGettingStarted } from './GettingStartedContext';

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Design reference: design_v3/getting_started_minimized_pill — "State 3" of
// the same widget as GettingStartedWidget.tsx. Lives in the Sidebar footer;
// clicking it re-expands the full checklist card back on the dashboard.
export function GettingStartedPill() {
  const t = useTranslations('GettingStartedPill');
  const gs = useGettingStarted();
  const router = useRouter();
  if (!gs || gs.dismissed || !gs.minimized) return null;

  const doneCount = gs.items.filter((i) => i.done).length;
  const total = gs.items.length;
  const offset = CIRCUMFERENCE - (doneCount / total) * CIRCUMFERENCE;

  return (
    <button
      onClick={() => {
        gs.expand();
        router.push('/dashboard');
      }}
      className="mb-md flex h-10 w-full items-center justify-between rounded-full border border-accent-signal/50 bg-surface px-md transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center gap-sm">
        <svg className="size-5 -rotate-90">
          <circle
            cx="10"
            cy="10"
            r={RADIUS}
            fill="transparent"
            stroke="var(--color-border)"
            strokeWidth="2.5"
          />
          <circle
            cx="10"
            cy="10"
            r={RADIUS}
            fill="transparent"
            stroke="var(--color-accent-signal)"
            strokeWidth="2.5"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-label-md whitespace-nowrap text-accent-signal">
          {t('progress', { done: doneCount, total })}
        </span>
      </div>
      <ChevronRight className="size-4 text-accent-signal" strokeWidth={2} />
    </button>
  );
}
