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
