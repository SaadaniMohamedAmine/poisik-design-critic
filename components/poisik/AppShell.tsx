import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { getCurrentUsage } from '@/lib/usage';
import { TopBarAuth } from './TopBarAuth';
import { Sidebar } from './Sidebar';
import { WelcomeToast } from './WelcomeToast';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const plan = ((session.user as { plan?: string }).plan ?? 'FREE') as
    'FREE' | 'PRO' | 'ENTERPRISE';
  const usage = { ...(await getCurrentUsage(session.user.id as string, plan)), plan };

  return (
    <div className="min-h-screen bg-bg-base">
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <TopBarAuth userName={session.user.name} userImage={session.user.image} />
      <div className="flex pt-20">
        <Sidebar usage={usage} />
        <main className="flex-1 p-xl lg:ml-64">{children}</main>
      </div>
    </div>
  );
}
