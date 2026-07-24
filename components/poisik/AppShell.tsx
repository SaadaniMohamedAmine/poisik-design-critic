import { getLocale } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { TopBarAuth } from './TopBarAuth';
import { Sidebar } from './Sidebar';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const plan = ((session.user as { plan?: string }).plan ?? 'FREE') as
    'FREE' | 'PRO' | 'ENTERPRISE';
  // Real usage counting lands in Phase C (10-pricing-stripe.md's checkAndIncrementUsage /
  // PLAN_LIMITS). Until then, Free-plan defaults keep the sidebar widget's shape correct
  // without fabricating a fake "remaining" number that would look like real data.
  const usage = { remaining: null as number | null, limit: null as number | null, plan };

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-bg-base">
        <TopBarAuth userName={session.user.name} userImage={session.user.image} />
        <div className="flex pt-20">
          <Sidebar usage={usage} />
          <main className="flex-1 p-xl lg:ml-64">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
