import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Idempotent on purpose — OnboardingFlow calls this once whether the user
// finished all 7 screens or hit "Skip" on the first one. Only ever writes
// once per account since it's guarded by `onboardingCompletedAt: null`.
export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  await prisma.user.updateMany({
    where: { id: userId, onboardingCompletedAt: null },
    data: { onboardingCompletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
