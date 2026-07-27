'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { UpgradeModal } from './UpgradeModal';
import type { Plan } from '@/lib/plans';

interface PlanUsageWidgetProps {
  plan: string;
  remaining: number | null;
  limit: number | null;
}

export function PlanUsageWidget({ plan, remaining, limit }: PlanUsageWidgetProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const isUnlimited = limit === null;
  const remainingCount = remaining ?? 0;
  const used = isUnlimited ? 0 : limit - remainingCount;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  // Monochrome brand rule means "you're out of credits" can't be a red/
  // amber alert — same accent hue, just more of it (border + tint), matching
  // the "Analyses left" stat card's isAtLimit treatment on the dashboard.
  const isAtLimit = !isUnlimited && remainingCount === 0;

  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-lg ${
        isAtLimit ? 'border-accent-signal/50 bg-accent-soft-bg' : 'border-border bg-surface'
      }`}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-accent-signal/5 blur-[60px]" />

      <div className="relative z-10">
        <div className="mb-lg flex items-center justify-between">
          <span className="rounded-full border border-border-strong px-md py-1 text-label-sm font-bold tracking-widest text-text-primary uppercase">
            {plan}
          </span>
          <Zap className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <h3 className="mb-xs text-headline-sm font-bold text-text-primary">
          {isUnlimited ? 'Unlimited analyses' : isAtLimit ? "You're out of credits" : 'Monthly quota'}
        </h3>
        <p className="text-label-md text-text-secondary">
          {isUnlimited
            ? "You're on a plan with no monthly analysis cap."
            : isAtLimit
              ? "You've used all your analyses for this month — upgrade to keep auditing."
              : // "Remaining", not "used" — matches the Sidebar footer and
                // the dashboard's "Analyses left" stat card, so the same
                // number reads the same way everywhere on the page instead
                // of requiring a subtraction to reconcile "used" vs "left".
                `You have ${remainingCount} of ${limit} analyses left this month.`}
        </p>
      </div>

      <div className="relative z-10 mt-xl">
        {!isUnlimited && (
          <>
            <div className="mb-xs flex justify-between text-label-sm text-text-secondary">
              <span>Analysis credits</span>
              <span className="text-text-primary">
                {remainingCount} / {limit} left
              </span>
            </div>
            <div className="mb-lg h-2 w-full overflow-hidden rounded-full border border-border bg-bg-elevated">
              <div className="h-full bg-accent-signal transition-all" style={{ width: `${pct}%` }} />
            </div>
          </>
        )}
        {plan !== 'ENTERPRISE' &&
          (isAtLimit ? (
            // At-limit is the real "hit the wall" moment — design reference:
            // design_v2/upgrade_modal_limit_reached. A plain Link felt too
            // easy to miss right when it matters most; the modal gives a
            // real (code-verified) Free-vs-next-tier number comparison
            // instead of just bouncing straight to /pricing.
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal py-md text-label-md font-bold text-white shadow-lg shadow-accent-signal/30 transition-opacity hover:opacity-90"
            >
              <Zap className="size-4" strokeWidth={2} />
              {plan === 'FREE' ? 'Upgrade to Pro' : 'Upgrade plan'}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal py-md text-label-md font-bold text-white transition-opacity hover:opacity-90"
            >
              <Zap className="size-4" strokeWidth={2} />
              {plan === 'FREE' ? 'Upgrade to Pro' : 'Upgrade plan'}
            </Link>
          ))}
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} plan={plan as Plan} />
    </div>
  );
}
