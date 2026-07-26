import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  await prisma.user.updateMany({
    where: { id: userId, gettingStartedDismissedAt: null },
    data: { gettingStartedDismissedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
