import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentUsage } from '@/lib/usage';
import { SettingsView } from '@/components/poisik';

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const plan = (session!.user as { plan?: string }).plan ?? 'FREE';

  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, stripeCustomerId: true },
    }),
    getCurrentUsage(userId, plan),
  ]);

  return (
    <SettingsView
      initialName={user?.name ?? null}
      email={user?.email ?? session!.user!.email ?? ''}
      image={user?.image ?? null}
      plan={plan}
      remaining={usage.remaining}
      limit={usage.limit}
      hasStripeCustomer={!!user?.stripeCustomerId}
    />
  );
}
