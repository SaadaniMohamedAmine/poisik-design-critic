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
