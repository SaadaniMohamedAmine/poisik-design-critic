# 10 — Plans & Payment (Stripe)

**Updated for real accounts.** Poisik now has real user accounts (see `21-auth-navigation.md`), so Stripe billing ties directly to `User.id` — no email-cookie workaround needed.

**Depends on:** the `User` model in `21-auth-navigation.md`.

## 1. Data model (Prisma / PostgreSQL)

```prisma
enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String
  periodStart DateTime // first day of the calendar month this record tracks
  count       Int      @default(0)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, periodStart])
}
```
`User.plan` (type `Plan`), `User.stripeCustomerId`, `User.stripeSubscriptionId`, and `User.stripeCurrentPeriodEnd` live on the `User` model itself, defined in `21-auth-navigation.md`. This combines with `Project`/`Analysis` from `07-history.md` into one `schema.prisma`.

## 2. Plans & limits

```ts
// lib/plans.ts
export const PLAN_LIMITS: Record<"FREE" | "PRO" | "ENTERPRISE", number | null> = {
  FREE: 3,          // analyses per calendar month
  PRO: 100,         // analyses per calendar month — placeholder, tune against real AI Vision cost
  ENTERPRISE: null, // unlimited via self-serve; negotiate a real cap per contract if this ever becomes a real sales motion
};

export const PLAN_FEATURES = {
  FREE:       { watermarkedPdf: true,  apiAccess: false, comparisonMode: true },
  PRO:        { watermarkedPdf: false, apiAccess: true,  comparisonMode: true },
  ENTERPRISE: { watermarkedPdf: false, apiAccess: true,  comparisonMode: true },
};
```

## 3. Usage enforcement (the payment-linked counter)

```ts
// lib/usage.ts
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";

function currentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function checkAndIncrementUsage(userId: string, plan: keyof typeof PLAN_LIMITS) {
  const limit = PLAN_LIMITS[plan];
  const periodStart = currentPeriodStart();

  if (limit === null) {
    await prisma.usageRecord.upsert({
      where: { userId_periodStart: { userId, periodStart } },
      create: { userId, periodStart, count: 1 },
      update: { count: { increment: 1 } },
    });
    return { allowed: true, remaining: null as null };
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
```

**Critical implementation rule:** call `checkAndIncrementUsage` at the very start of the `/api/analyze` route, **before** calling GPT-4o Vision or Claude Vision. A blocked user must never trigger (and never pay for) an AI call. If `allowed` is `false`, return a 402-style response the frontend turns into the upgrade modal (see `21-auth-navigation.md` section 4, and the modal design in Stitch LOT 6).

**Counter UI:** show remaining analyses as a small pill near the "New Analysis" button on the Dashboard and inside the upload flow — e.g. "2 of 3 analyses left this month" with a thin progress bar (`accent-signal` fill, `border-strong` track — same convention as the score gauge, no new colors). When `remaining === 0`, the "New Analysis" action opens the upgrade modal instead of the upload flow.

## 4. Stripe integration

- `Checkout Session` created with `client_reference_id = user.id`
- Webhook `checkout.session.completed` → look up the user by `client_reference_id`, set `plan = PRO` (or `ENTERPRISE` if sold manually), store `stripeCustomerId`/`stripeSubscriptionId`
- Webhook `customer.subscription.deleted` / `updated` (canceled) → set `plan = FREE` back
- Stripe Customer Portal linked from Settings for self-service cancel/update payment method
- Enterprise plan: no self-serve checkout — a "Contact us" CTA on `/pricing` (mailto or simple form), plan set manually in the database after a sales conversation. Do not build a self-serve Enterprise checkout.

## 5. Pricing page (`/pricing`)

Three plan cards: Free, Pro, Enterprise.
- **Free** — "$0", "3 analyses/month", "Comparison mode", "Watermarked PDF export" — CTA: "Get started" (→ `/sign-up` if logged out, no-op/current-plan indicator if already Free and logged in)
- **Pro** — price (placeholder, e.g. "$19/month"), "100 analyses/month", "No watermark", "API access", "Priority support" — CTA: "Upgrade to Pro" (→ Stripe Checkout)
- **Enterprise** — "Custom", "Unlimited analyses", "Dedicated support", "Custom API limits" — CTA: "Contact us" (mailto or simple form, no checkout)

## 6. Full implementation code

### `lib/stripe.ts`
```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID!,
};
```

### `app/api/stripe/checkout/route.ts`
```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PRICE_IDS.PRO_MONTHLY, quantity: 1 }],
    client_reference_id: session.user.id,
    customer_email: session.user.email ?? undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### `app/api/stripe/webhook/route.ts`
```ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.client_reference_id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "PRO",
            stripeCustomerId: checkoutSession.customer as string,
            stripeSubscriptionId: checkoutSession.subscription as string,
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: "FREE", stripeSubscriptionId: null },
      });
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.cancel_at_period_end || subscription.status !== "active") {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { plan: "FREE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### `app/api/stripe/portal/route.ts`
```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) return NextResponse.json({ error: "No billing account found." }, { status: 400 });

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### `app/pricing/page.tsx`
```tsx
"use client";

import { useState } from "react";

const PLANS = [
  { name: "Free", price: "$0", features: ["3 analyses / month", "Comparison mode", "Watermarked PDF export"], cta: "Get started", plan: "FREE" },
  { name: "Pro", price: "$19/mo", features: ["100 analyses / month", "No watermark", "API access", "Priority support"], cta: "Upgrade to Pro", plan: "PRO" },
  { name: "Enterprise", price: "Custom", features: ["Unlimited analyses", "Dedicated support", "Custom API limits"], cta: "Contact us", plan: "ENTERPRISE" },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
    if (plan === "FREE") { window.location.href = "/sign-up"; return; }
    if (plan === "ENTERPRISE") { window.location.href = "mailto:sales@poisik.com"; return; }

    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto py-16">
      {PLANS.map((p) => (
        <div key={p.name} className="rounded-lg border border-[#1d2b3f] bg-[#121a27] p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-[#e3e9f2]">{p.name}</h3>
          <p className="text-2xl font-bold text-[#e3e9f2] my-3">{p.price}</p>
          <ul className="space-y-2 text-sm text-[#87a1c5] flex-1">
            {p.features.map((f) => <li key={f}>• {f}</li>)}
          </ul>
          <button onClick={() => handleUpgrade(p.plan)} disabled={loading === p.plan}
            className="mt-6 rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white py-2 font-medium disabled:opacity-50">
            {loading === p.plan ? "Redirecting..." : p.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Definition of Done
- Full Stripe **test mode** flow works end to end: `/pricing` → Checkout (test card) → webhook fires → `User.plan` updates → Pro features unlock → Customer Portal → cancel → webhook fires → plan reverts to Free
- The AI is never called for a request that exceeds the user's plan limit — verify this specifically, it's a cost-control requirement, not just a UX nicety
- Free plan's monthly limit correctly resets at the start of each calendar month
- Enterprise plan, once manually set on a user record, is correctly treated as unlimited by `checkAndIncrementUsage`
