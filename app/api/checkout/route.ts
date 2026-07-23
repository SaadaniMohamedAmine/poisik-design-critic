import { NextResponse } from 'next/server';
import { createCheckoutSession, createCustomerPortalUrl } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { action, customerId, email } = await req.json();

    if (action === 'portal' && customerId) {
      const portal = await createCustomerPortalUrl(customerId);
      return NextResponse.json({ url: portal.url });
    }

    const session = await createCheckoutSession(email);
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
