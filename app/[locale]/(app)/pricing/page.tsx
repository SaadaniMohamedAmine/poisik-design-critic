'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PoisikLogo } from '@/components/poisik';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'For quick design checks',
    features: [
      '5 analyses/month',
      'PDF Export with watermark',
      'Basic analysis',
    ],
    cta: 'Get Started',
    href: '/upload',
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For serious design teams',
    features: [
      'Unlimited analyses',
      'PDF Export without watermark',
      'Comparison mode',
      'Priority AI routing',
    ],
    cta: 'Upgrade',
    popular: true,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
      </header>

      <main className="mx-auto max-w-5xl px-margin pt-32 pb-xxl">
        <div className="mb-xl text-center">
          <h1 className="mb-md text-headline-lg font-semibold text-text-primary">
            Pricing
          </h1>
          <p className="text-body-md text-text-secondary">
            Choose the plan that fits your workflow
          </p>
        </div>

        <div className="grid gap-lg md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-xl ${
                plan.popular
                  ? 'border-accent-signal bg-surface'
                  : 'border-border bg-surface'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-signal px-md py-1 text-label-sm font-bold text-white">
                  Most Popular
                </span>
              )}
              <div className="mb-lg">
                <h2 className="text-headline-md font-semibold text-text-primary">
                  {plan.name}
                </h2>
                <p className="mt-1 text-label-md text-text-secondary">
                  {plan.description}
                </p>
                <div className="mt-md flex items-baseline gap-1">
                  <span className="text-[48px] font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-label-md text-text-muted">/month</span>
                </div>
              </div>
              <ul className="mb-lg space-y-md">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-md">
                    <Check className="size-4 text-accent-signal" />
                    <span className="text-body-md text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              {plan.popular ? (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : plan.cta}
                </Button>
              ) : (
                <a
                  href={plan.href}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
