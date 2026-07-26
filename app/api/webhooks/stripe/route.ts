import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

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

        await createNotification(
          userId,
          'PLAN_UPGRADED',
          'Plan upgraded',
          `You're now on the ${plan} plan. Enjoy your new limits!`,
          '/settings'
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // `updateMany` doesn't return the affected rows, and a notification
      // needs a userId — fetch matching users first so we know who to notify.
      const affected = await prisma.user.findMany({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true },
      });
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: 'FREE', stripeSubscriptionId: null },
      });
      await Promise.all(
        affected.map((u) =>
          createNotification(
            u.id,
            'PLAN_DOWNGRADED',
            'Plan ended',
            'Your subscription ended — you are now on the Free plan.',
            '/pricing'
          )
        )
      );
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.cancel_at_period_end || subscription.status !== 'active') {
        const affected = await prisma.user.findMany({
          where: { stripeSubscriptionId: subscription.id },
          select: { id: true },
        });
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { plan: 'FREE' },
        });
        await Promise.all(
          affected.map((u) =>
            createNotification(
              u.id,
              'PLAN_DOWNGRADED',
              'Plan downgraded',
              'Your subscription was cancelled — you are now on the Free plan.',
              '/pricing'
            )
          )
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
