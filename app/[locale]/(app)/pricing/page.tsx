'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Plan = {
  name: string;
  key: 'FREE' | 'PRO' | 'ENTERPRISE';
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  team?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    key: 'FREE',
    price: '0',
    description: 'For quick design checks',
    features: ['5 analyses/month', 'PDF Export with watermark', 'Basic analysis'],
  },
  {
    name: 'Pro',
    key: 'PRO',
    price: '19',
    description: 'For serious design teams',
    features: [
      'Unlimited analyses',
      'PDF Export without watermark',
      'Comparison mode',
      'Priority AI routing',
    ],
    popular: true,
  },
  {
    name: 'Team',
    key: 'ENTERPRISE',
    price: '39',
    description: 'For growing design orgs',
    features: [
      'Unlimited analyses',
      'PDF Export without watermark',
      'Comparison mode',
      'Priority AI routing',
      'Team workspace',
      'Advanced analytics',
    ],
    team: true,
  },
];

export default function PricingPage() {
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
        <h1 className="mb-md text-headline-lg font-semibold text-text-primary">Pricing</h1>
        <p className="text-body-md text-text-secondary">Choose the plan that fits your workflow</p>
      </div>

      <div className="grid gap-lg md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = status === 'authenticated' && currentPlan === plan.key;
          return (
            <div
              key={plan.name}
              className={`relative cursor-pointer rounded-xl border p-xl ${
                plan.popular ? 'border-accent-signal bg-surface' : 'border-border bg-surface'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-signal px-md py-1 text-label-sm font-bold text-white">
                  Most Popular
                </span>
              )}
              <div className="mb-lg">
                <h2 className="text-headline-md font-semibold text-text-primary">{plan.name}</h2>
                <p className="mt-1 text-label-md text-text-secondary">{plan.description}</p>
                <div className="mt-md flex items-baseline gap-1">
                  <span className="text-[48px] font-bold text-text-primary">${plan.price}</span>
                  <span className="text-label-md text-text-muted">/month</span>
                </div>
              </div>
              <ul className="mb-lg space-y-md">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-md">
                    <Check className="size-4 flex-shrink-0 text-accent-signal" />
                    <span className="text-body-md text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button className="w-full" variant="secondary" disabled>
                  Current plan
                </Button>
              ) : plan.key === 'FREE' ? (
                status === 'authenticated' ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Included
                  </Button>
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
                  >
                    Get Started
                  </Link>
                )
              ) : status === 'authenticated' ? (
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'secondary'}
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading === plan.key}
                >
                  {loading === plan.key ? 'Loading...' : 'Upgrade'}
                </Button>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-accent-signal px-2.5 py-2 text-sm font-bold text-white whitespace-nowrap transition-all hover:opacity-90"
                >
                  Get Started
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
