import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/plans';

function currentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// `PLAN_LIMITS.PRO`/`.ENTERPRISE` are `null` (meaning "unlimited"), not absent —
// a `??` fallback would treat that `null` as "missing" and collapse it to the
// FREE limit, which is exactly backwards. Only fall back to FREE when the plan
// string itself isn't a recognized key.
function resolvePlanLimit(plan: string): number | null {
  return plan in PLAN_LIMITS ? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] : PLAN_LIMITS.FREE;
}

export async function checkAndIncrementUsage(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number | null }> {
  const limit = resolvePlanLimit(plan);
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

// checkAndIncrementUsage spends the credit up front, before the AI call
// even runs — necessary so a burst of concurrent requests can't all slip
// past the limit check. But that means a failed analysis (provider error,
// bad image, etc.) would otherwise burn a monthly credit for nothing. Call
// this from the route's catch block to give it back. `count: { gt: 0 }`
// guards against ever decrementing below zero.
export async function decrementUsage(userId: string): Promise<void> {
  const periodStart = currentPeriodStart();
  await prisma.usageRecord.updateMany({
    where: { userId, periodStart, count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}

export async function getCurrentUsage(
  userId: string,
  plan: string
): Promise<{ remaining: number | null; limit: number | null }> {
  const limit = resolvePlanLimit(plan);
  if (limit === null) return { remaining: null, limit: null };

  const record = await prisma.usageRecord.findUnique({
    where: { userId_periodStart: { userId, periodStart: currentPeriodStart() } },
  });
  const currentCount = record?.count ?? 0;
  return { remaining: Math.max(0, limit - currentCount), limit };
}
