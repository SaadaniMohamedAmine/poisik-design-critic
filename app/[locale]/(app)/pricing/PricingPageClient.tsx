'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAN_LIMITS } from '@/lib/plans';

type PlanKey = 'FREE' | 'PRO' | 'ENTERPRISE';

type PlanMeta = {
  nameKey: 'free' | 'pro' | 'team';
  key: PlanKey;
  price: string;
  descKey: 'freeDesc' | 'proDesc' | 'teamDesc';
  featureKeys: (
    { key: 'analyses'; params: { count: number } } | { key: string; params?: undefined }
  )[];
  popular?: boolean;
  team?: boolean;
};

const PLANS: PlanMeta[] = [
  {
    nameKey: 'free',
    key: 'FREE',
    price: '0',
    descKey: 'freeDesc',
    featureKeys: [
      { key: 'analyses', params: { count: PLAN_LIMITS.FREE! } },
      { key: 'pdfExportWithWatermark' },
      { key: 'basicAnalysis' },
    ],
  },
  {
    nameKey: 'pro',
    key: 'PRO',
    price: '19',
    descKey: 'proDesc',
    // PLAN_LIMITS.PRO is 100/month (only ENTERPRISE/"Team" is truly
    // uncapped) — sourced from the same constant the usage-limit check
    // enforces, so this can't drift out of sync with what the API allows.
    featureKeys: [
      { key: 'analyses', params: { count: PLAN_LIMITS.PRO! } },
      { key: 'pdfExportNoWatermark' },
      { key: 'comparison' },
      { key: 'priorityAi' },
    ],
    popular: true,
  },
  {
    nameKey: 'team',
    key: 'ENTERPRISE',
    price: '39',
    descKey: 'teamDesc',
    featureKeys: [
      { key: 'unlimitedAnalyses' },
      { key: 'pdfExportNoWatermark' },
      { key: 'comparison' },
      { key: 'priorityAi' },
      { key: 'teamWorkspace' },
      { key: 'advancedAnalytics' },
    ],
    team: true,
  },
];

export function PricingPageClient() {
  const t = useTranslations('Pricing');
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = (session?.user as { plan?: string } | undefined)?.plan ?? 'FREE';

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          plan: planKey.toLowerCase() === 'enterprise' ? 'team' : planKey.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } catch {
      console.error('Checkout failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-margin pt-32 pb-xxl">
      <div className="mb-xl text-center">
        <h1 className="mb-md text-headline-lg font-semibold text-text-primary">{t('title')}</h1>
        <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="grid gap-lg md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = status === 'authenticated' && currentPlan === plan.key;
          return (
            <div
              key={plan.key}
              className={`relative cursor-pointer rounded-xl border p-xl ${
                plan.popular ? 'border-accent-signal bg-surface' : 'border-border bg-surface'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-signal px-md py-1 text-label-sm font-bold text-white">
                  {t('mostPopular')}
                </span>
              )}
              <div className="mb-lg">
                <h2 className="text-headline-md font-semibold text-text-primary">
                  {t(plan.nameKey)}
                </h2>
                <p className="mt-1 text-label-md text-text-secondary">{t(plan.descKey)}</p>
                <div className="mt-md flex items-baseline gap-1">
                  <span className="text-[48px] font-bold text-text-primary">${plan.price}</span>
                  <span className="text-label-md text-text-muted">{t('perMonth')}</span>
                </div>
              </div>
              <ul className="mb-lg space-y-md">
                {plan.featureKeys.map((feature) => (
                  <li key={feature.key} className="flex items-center gap-md">
                    <Check className="size-4 flex-shrink-0 text-accent-signal" />
                    <span className="text-body-md text-text-secondary">
                      {feature.params ? t(feature.key, feature.params) : t(feature.key)}
                    </span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button className="w-full" variant="secondary" disabled>
                  {t('currentPlan')}
                </Button>
              ) : plan.key === 'FREE' ? (
                status === 'authenticated' ? (
                  <Button className="w-full" variant="secondary" disabled>
                    {t('included')}
                  </Button>
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
                  >
                    {t('getStarted')}
                  </Link>
                )
              ) : status === 'authenticated' ? (
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading === plan.key}
                  className="flex w-full items-center justify-center rounded-lg bg-accent-signal px-2.5 py-2 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-accent-signal/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === plan.key ? t('loading') : t('upgrade')}
                </button>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-accent-signal px-2.5 py-2 text-sm font-bold text-white whitespace-nowrap transition-all hover:opacity-90"
                >
                  {t('getStarted')}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
