# Phase C — Billing & Stripe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraints for this project:** no command or file change runs without the user's explicit go-ahead first. Do not open a PR — the user merges branches themselves. Do NOT use Playwright or any browser automation. **Per-task verification is `pnpm typecheck`/`pnpm lint` ONLY — no `pnpm build`, no dev server, no curl per task.** Full build and live E2E testing happen once, in this plan's final task.

**Goal:** replace the pre-existing anonymous-cookie-based Stripe integration (`poisik_customer` cookie, no real ownership) with real per-user billing tied to `User.plan`/`stripeCustomerId`/`stripeSubscriptionId` (already in the schema since Phase A), enforce real monthly usage limits (replacing Phase B's always-allow stub), and wire the pricing page + Settings page to actual auth/subscription state — per `features/10-pricing-stripe.md`, adapted to this codebase's real plan names and existing Stripe scaffolding.

**Architecture:** `lib/stripe.ts`, `app/api/checkout/route.ts`, and `app/api/webhooks/stripe/route.ts` already exist (built in an earlier phase, before real accounts existed) — this phase rewires them to Prisma/session instead of cookies, rather than creating new files from scratch. `lib/usage.ts`'s stub (Phase B) gets a real body; its exported signature doesn't change, so the existing call site in `app/api/projects/[id]/analyses/route.ts` needs no edits.

**Tech Stack:** Stripe SDK (already installed, `^22.3.2`), Prisma (already migrated).

## Global Constraints

- Package manager: pnpm throughout.
- **Plan naming mismatch, resolved once, here:** the Prisma schema's `Plan` enum (migrated in Phase A per `features/21-auth-navigation.md`) is `FREE | PRO | ENTERPRISE`. The actual, already-shipped pricing page (`app/[locale]/(app)/pricing/page.tsx`, built in an earlier phase before this plan) shows three tiers labeled **Free / Pro / Team** — not "Enterprise". Do not rename the Prisma enum (that would require a new migration for no functional benefit) — instead, the "Team" UI tier maps to the `ENTERPRISE` enum value internally everywhere in this plan. Comment this mapping wherever it appears in code so it isn't a silent trap for future readers.
- **Real usage limits** (matching the pricing page's actual displayed copy, not `features/10-pricing-stripe.md`'s example numbers): FREE = 5 analyses/month, PRO = unlimited, "Team" (`ENTERPRISE` enum) = unlimited.
- Env vars already exist in `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID` — no new keys needed.
- Checkout requires a signed-in user — `client_reference_id` on the Stripe Checkout Session must be `session.user.id`. If no session, the API returns 401 and the frontend sends the visitor to `/sign-up` instead of attempting checkout.
- `features/`, `design_v1/`, `design_v2/`, `docs/` are read-only — must be untouched.
- Definition of Done:
  - A signed-in FREE user can start a real Stripe Checkout session for Pro or Team, tied to their account
  - The webhook updates `User.plan`/`stripeCustomerId`/`stripeSubscriptionId` on `checkout.session.completed`, and reverts `plan` to `FREE` on `customer.subscription.deleted` (and on `customer.subscription.updated` when the subscription is no longer active)
  - `checkAndIncrementUsage` genuinely blocks a FREE user's 6th analysis in a calendar month, and never blocks Pro/Team
  - The AI pipeline is never invoked for a request that's already over its limit (this must happen before Phase B's existing `runAnalysisPipeline` call, not after)
  - Settings page has a working "Manage subscription" button for users with a `stripeCustomerId`
  - Pricing page reflects real auth/plan state (not just static cards)
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` exit 0 for files this phase touches

---

### Task 1: Real usage enforcement (`lib/plans.ts`, `lib/usage.ts`)

**Files:**
- Create: `lib/plans.ts`
- Modify: `lib/usage.ts` (replace the Phase B stub body — same exported function name/signature)

**Interfaces:**
- Produces: `PLAN_LIMITS`, `checkAndIncrementUsage(userId, plan): Promise<{allowed, remaining}>` (unchanged signature — Phase B's `app/api/projects/[id]/analyses/route.ts` already calls this exactly, no edits needed there), plus a new read-only `getCurrentUsage(userId, plan): Promise<{remaining, limit}>` for Task 4's display-only use (must NOT increment).

- [ ] **Step 1: `lib/plans.ts`**

```ts
// The Prisma `Plan` enum is FREE | PRO | ENTERPRISE — the pricing page's
// "Team" tier maps to ENTERPRISE here; there is no separate "TEAM" enum value.
export const PLAN_LIMITS: Record<'FREE' | 'PRO' | 'ENTERPRISE', number | null> = {
  FREE: 5,
  PRO: null,
  ENTERPRISE: null, // "Team" tier in the UI
};
```

- [ ] **Step 2: Replace `lib/usage.ts`**

```ts
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/plans';

function currentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function checkAndIncrementUsage(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number | null }> {
  const limit = PLAN_LIMITS[(plan as keyof typeof PLAN_LIMITS) ?? 'FREE'] ?? PLAN_LIMITS.FREE;
  const periodStart = currentPeriodStart();

  if (limit === null) {
    await prisma.usageRecord.upsert({
      where: { userId_periodStart: { userId, periodStart } },
      create: { userId, periodStart, count: 1 },
      update: { count: { increment: 1 } },
    });
    return { allowed: true, remaining: null };
  }

  const record = await prisma.usageRecord.findUnique({
    where: { userId_periodStart: { userId, periodStart } },
  });
  const currentCount = record?.count ?? 0;

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.usageRecord.upsert({
    where: { userId_periodStart: { userId, periodStart } },
    create: { userId, periodStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  return { allowed: true, remaining: limit - currentCount - 1 };
}

export async function getCurrentUsage(
  userId: string,
  plan: string
): Promise<{ remaining: number | null; limit: number | null }> {
  const limit = PLAN_LIMITS[(plan as keyof typeof PLAN_LIMITS) ?? 'FREE'] ?? PLAN_LIMITS.FREE;
  if (limit === null) return { remaining: null, limit: null };

  const record = await prisma.usageRecord.findUnique({
    where: { userId_periodStart: { userId, periodStart: currentPeriodStart() } },
  });
  const currentCount = record?.count ?? 0;
  return { remaining: Math.max(0, limit - currentCount), limit };
}
```

Note: `checkAndIncrementUsage`'s call site in `app/api/projects/[id]/analyses/route.ts` (Phase B) already runs this AFTER request validation and BEFORE `runAnalysisPipeline` — exactly the ordering this Definition of Done requires. No changes needed there.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint` on both files — both exit 0.

- [ ] **Step 4: Commit**

```bash
git add lib/plans.ts lib/usage.ts
git commit -m "feat(billing): implement real monthly usage enforcement (replaces Phase B stub)"
```

---

### Task 2: Rewire Stripe checkout + webhook to real accounts

**Files:**
- Modify: `lib/stripe.ts`
- Modify: `app/api/checkout/route.ts`
- Modify: `app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: `auth` from `@/auth`, `prisma` from `@/lib/prisma`.

- [ ] **Step 1: Replace `lib/stripe.ts`**

```ts
import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key);
}

// "team" here maps to the Prisma Plan enum's ENTERPRISE value — see
// lib/plans.ts's comment for why there's no separate TEAM enum value.
const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
};

export function planForPriceId(priceId: string | null | undefined): 'PRO' | 'ENTERPRISE' | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return 'ENTERPRISE';
  return null;
}

export async function createCheckoutSession(plan: string, userId: string, email?: string | null) {
  const stripe = getStripe();
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    throw new Error('Price ID not found for plan: ' + plan);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    customer_email: email ?? undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/pricing?canceled=true`,
  });

  return session;
}

export async function createCustomerPortalUrl(customerId: string) {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/en/settings`,
  });

  return session;
}
```

- [ ] **Step 2: Replace `app/api/checkout/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession, createCustomerPortalUrl } from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  try {
    const { action, plan } = await req.json();

    if (action === 'portal') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.stripeCustomerId) {
        return NextResponse.json({ error: 'No billing account found.' }, { status: 400 });
      }
      const portal = await createCustomerPortalUrl(user.stripeCustomerId);
      return NextResponse.json({ url: portal.url });
    }

    const checkoutSession = await createCheckoutSession(plan, userId, session.user.email);
    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Replace `app/api/webhooks/stripe/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId) {
        const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const plan = planForPriceId(priceId) ?? 'PRO';

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: 'FREE', stripeSubscriptionId: null },
      });
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.cancel_at_period_end || subscription.status !== 'active') {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { plan: 'FREE' },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

Note: this drops the old `poisik_customer` cookie logic entirely — plan state now lives on `User.plan` in Postgres, not a cookie. If anything else in the codebase still reads `poisik_customer`, that's a pre-existing loose end from before real accounts existed; grep for it in Step 4 below and report what you find rather than silently deleting a reference you don't understand the purpose of.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`, `pnpm lint` on all three files — both exit 0.
Run: `grep -rn "poisik_customer" app/ lib/ components/` — report what you find (don't silently fix call sites outside these three files).

- [ ] **Step 5: Commit**

```bash
git add lib/stripe.ts app/api/checkout/route.ts app/api/webhooks/stripe/route.ts
git commit -m "feat(billing): tie Stripe checkout/webhook to real User accounts instead of a cookie"
```

---

### Task 3: Auth-aware pricing page + Settings "Manage subscription"

**Files:**
- Modify: `app/[locale]/(app)/pricing/page.tsx`
- Modify: `app/[locale]/(authenticated)/settings/page.tsx`

**Interfaces:**
- Consumes: `useSession` from `next-auth/react` (already used in the Settings page from Phase A).

- [ ] **Step 1: Update `app/[locale]/(app)/pricing/page.tsx`**

Add session awareness so the Free tier's CTA and the Pro/Team checkout buttons reflect real state. Replace the component with:

```tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import { Check } from 'lucide-react';
import { PoisikLogo } from '@/components/poisik';
import { Button } from '@/components/ui/button';

const PLANS = [
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
] as const;

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
        body: JSON.stringify({ action: 'checkout', plan: planKey.toLowerCase() === 'enterprise' ? 'team' : planKey.toLowerCase() }),
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
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <PoisikLogo size="md" />
      </header>

      <main className="mx-auto max-w-6xl px-margin pt-32 pb-xxl">
        <div className="mb-xl text-center">
          <h1 className="mb-md text-headline-lg font-semibold text-text-primary">Pricing</h1>
          <p className="text-body-md text-text-secondary">
            Choose the plan that fits your workflow
          </p>
        </div>

        <div className="grid gap-lg md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = status === 'authenticated' && currentPlan === plan.key;
            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-xl ${
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
    </div>
  );
}
```

- [ ] **Step 2: Add "Manage subscription" to Settings**

Open `app/[locale]/(authenticated)/settings/page.tsx`. In the "Profile" section (where plan is already displayed from Phase A: `Plan: {(session?.user as {plan?: string})?.plan ?? 'FREE'}`), add a button right after that plan line — only rendered when the plan isn't FREE (a FREE user has no Stripe customer yet, so the portal call would just 400):

```tsx
{(session?.user as { plan?: string })?.plan && (session?.user as { plan?: string })?.plan !== 'FREE' && (
  <button
    onClick={async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    }}
    className="mt-sm rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
  >
    Manage subscription
  </button>
)}
```

Read the current file first to place this correctly inside the existing "Profile" `<section>` rather than guessing indentation — don't restructure the surrounding JSX beyond inserting this block.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint` on both files — both exit 0.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(app)/pricing/page.tsx" "app/[locale]/(authenticated)/settings/page.tsx"
git commit -m "feat(billing): auth-aware pricing page and Settings 'Manage subscription' button"
```

---

### Task 4: Wire real usage numbers into the authenticated shell

**Files:**
- Modify: `components/poisik/AppShell.tsx`

**Interfaces:**
- Consumes: `getCurrentUsage` from `@/lib/usage` (Task 1).

- [ ] **Step 1: Update `components/poisik/AppShell.tsx`**

Read the current file first — Phase A/B built it with a hardcoded `{ remaining: null, limit: null, plan }` placeholder specifically so this swap would be a body-only change. Replace just that placeholder line and the comment above it:

```tsx
const usage = await getCurrentUsage(session.user.id as string, plan);
```

(remove the old `// Real usage counting lands in Phase C...` comment and the hardcoded object it was attached to; add the import `import { getCurrentUsage } from '@/lib/usage';` at the top). Everything else in the file (the `TopBarAuth`/`Sidebar` composition, the `plan` derivation) stays as-is.

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/poisik/AppShell.tsx
git commit -m "feat(billing): show real usage numbers in the sidebar instead of the Phase C placeholder"
```

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run: `pnpm build`, `pnpm lint`, `pnpm typecheck`. Confirm no NEW failures beyond the pre-existing, out-of-scope ones already documented in Phases A/B.

- [ ] **Step 2: End-to-end manual walkthrough (curl-based, no browser)**

Note: a real Stripe Checkout redirect can't be completed via curl (it's Stripe's own hosted page) — verify up to the point of getting a real `session.url` back, and separately verify the webhook handler's logic by reasoning through it / a targeted unit-style check if useful, rather than attempting a live card payment.

1. Sign up a fresh test account → confirm `/en/pricing` shows "Included" on Free, "Upgrade" on Pro/Team
2. `POST /api/checkout` with `{action: 'checkout', plan: 'pro'}` while signed in → confirm a real `stripe.com` checkout URL comes back (don't complete payment)
3. `POST /api/checkout` while signed OUT → confirm 401
4. Manually set the test user's `plan` to `PRO` via a direct Prisma query (simulating what the webhook would do) and confirm: `/en/pricing` now shows "Current plan" on Pro; `/en/settings` shows a "Manage subscription" button; `/en/dashboard`'s sidebar usage widget shows "Unlimited"
5. Manually create 5 `UsageRecord` count-5 rows (simulating 5 analyses already used this month) for a FREE-plan test user, then `POST /api/projects/[id]/analyses` for that user → confirm 402 `MONTHLY_LIMIT_REACHED`, and confirm via logs/DB that `runAnalysisPipeline` was never invoked (no AI call attempted)
6. Delete both test accounts/data used above

- [ ] **Step 3: Report**

Summarize the walkthrough results. No code changes to commit here — this is the gate before considering Phase C done.

## Self-Review Notes

- **Spec coverage:** every section of `features/10-pricing-stripe.md` maps to a task, adapted to this codebase's real pre-existing Stripe scaffolding and real Free/Pro/Team plan names (documented once in Global Constraints, not repeated ambiguously per-task) — data model (already in Phase A's schema), plans/limits (Task 1), usage enforcement (Task 1), Stripe integration (Task 2), pricing page (Task 3). Settings' billing section (mentioned in `21-auth-navigation.md` but deferred twice, in Phases A and B) lands here (Task 3).
- **Known deviation from the spec's literal code, called out for the human:** the spec assumes `Plan = FREE|PRO|ENTERPRISE` maps 1:1 to a 3-tier "Free/Pro/Enterprise" pricing page; this codebase's real, already-shipped pricing page is "Free/Pro/Team" — `ENTERPRISE` is reused as the "Team" tier's backing enum value rather than introducing a new enum value that would need another migration.
- **No placeholders:** every step has complete, literal code or an exact command.
