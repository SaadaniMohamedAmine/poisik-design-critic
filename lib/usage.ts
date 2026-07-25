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
