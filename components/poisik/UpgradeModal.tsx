'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PLAN_LABEL_KEYS, PLAN_LIMITS, NEXT_PLAN, type Plan } from '@/lib/plans';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
}

// Design reference: design_v2/upgrade_modal_limit_reached (also in
// design_v3, byte-identical). The mockup's own comparison table claimed
// "Analyses/month: Free 3 / Pro Unlimited", "Code fixes: Limited/Included",
// and "Custom audit rules: No/Yes" — none of those last two are real,
// enforced product features (no plan check exists anywhere in the code for
// code fixes or "custom audit rules", and PRO is actually capped at 100/mo
// in PLAN_LIMITS, not unlimited — only ENTERPRISE/"Team" truly has no cap).
// Per explicit direction, this shows the one real, code-verified number
// (PLAN_LIMITS for the current plan vs. the next tier up) instead of
// repeating the pricing page's "Unlimited" claim for Pro.
export function UpgradeModal({ open, onOpenChange, plan }: UpgradeModalProps) {
  const t = useTranslations('UpgradeModal');
  const tPricing = useTranslations('Pricing');
  const [loading, setLoading] = useState(false);
  const nextPlan = NEXT_PLAN[plan];
  const currentLimit = PLAN_LIMITS[plan];

  if (!nextPlan) return null; // Already on the top tier — nothing to upsell to.

  const nextLimit = PLAN_LIMITS[nextPlan];

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          plan: nextPlan === 'ENTERPRISE' ? 'team' : nextPlan!.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
    } catch {
      // fall through to re-enable the button below
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[480px]">
        <div className="relative p-xl">
          <div className="pointer-events-none absolute -top-20 -left-20 size-56 rounded-full bg-accent-signal/10 blur-[80px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 size-56 rounded-full bg-accent-signal/5 blur-[80px]" />

          <DialogHeader className="relative z-10 items-center text-center">
            <div className="mb-md flex size-12 items-center justify-center rounded-full bg-accent-soft-bg">
              <Sparkles className="size-5 text-accent-signal" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-headline-md font-bold text-accent-signal">
              {t('usedAllTitle', { limit: currentLimit ?? 0 })}
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-[320px] text-body-md text-text-secondary">
              {t('upgradeDesc', { plan: tPricing(PLAN_LABEL_KEYS[nextPlan]) })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative z-10 mt-lg grid grid-cols-2 gap-md">
            <div className="rounded-xl border border-border bg-bg-elevated p-lg text-center">
              <p className="text-label-sm text-text-muted uppercase tracking-wider">
                {t(PLAN_LABEL_KEYS[plan])}
              </p>
              <p className="mt-xs text-headline-md font-bold text-text-primary">{currentLimit}</p>
              <p className="text-label-sm text-text-muted">{t('analysesPerMonth')}</p>
            </div>
            <div className="rounded-xl border border-accent-signal/40 bg-accent-soft-bg p-lg text-center">
              <p className="text-label-sm text-accent-signal uppercase tracking-wider">
                {tPricing(PLAN_LABEL_KEYS[nextPlan])}
              </p>
              <p className="mt-xs text-headline-md font-bold text-accent-signal">
                {nextLimit === null ? t('unlimited') : nextLimit}
              </p>
              <p className="text-label-sm text-text-secondary">{t('analysesPerMonth')}</p>
            </div>
          </div>

          <div className="relative z-10 mt-lg flex flex-col gap-sm">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-sm rounded-xl bg-accent-signal text-label-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                t('redirecting')
              ) : (
                <>
                  {t('upgradeToPlan', { plan: tPricing(PLAN_LABEL_KEYS[nextPlan]) })}
                  <ArrowRight className="size-4" strokeWidth={2} />
                </>
              )}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="py-sm text-label-md text-text-secondary transition-colors hover:text-text-primary"
            >
              {t('maybeLater')}
            </button>
          </div>

          <div className="relative z-10 mt-lg flex items-center justify-center gap-xl text-text-muted opacity-60">
            <div className="flex items-center gap-xs">
              <ShieldCheck className="size-4" strokeWidth={1.5} />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {t('securePayment')}
              </span>
            </div>
            <div className="flex items-center gap-xs">
              <RotateCcw className="size-4" strokeWidth={1.5} />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {t('cancelAnytime')}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
