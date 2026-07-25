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
        const resolvedPlan = planForPriceId(priceId);
        if (!resolvedPlan) {
          console.error(
            `Stripe webhook: unrecognized price id "${priceId}" on checkout session ${session.id} — defaulting to PRO. Check STRIPE_PRO_PRICE_ID/STRIPE_TEAM_PRICE_ID configuration.`
          );
        }
        const plan = resolvedPlan ?? 'PRO';

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
