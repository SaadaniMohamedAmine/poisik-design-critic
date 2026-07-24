import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { customer: string; id: string };
        const response = NextResponse.json({ received: true });
        response.cookies.set('poisik_customer', session.customer, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60,
          path: '/',
        });
        return response;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const response = NextResponse.json({ received: true });
        response.cookies.set('poisik_customer', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        return response;
      }
      default:
        return NextResponse.json({ received: true });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
