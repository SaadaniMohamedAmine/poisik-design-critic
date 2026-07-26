import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUsage } from '@/lib/usage';
import { TopBarAuth } from './TopBarAuth';
import { Sidebar } from './Sidebar';
import { WelcomeToast } from './WelcomeToast';
import { OnboardingFlow } from './OnboardingFlow';
import { GettingStartedProvider, type GettingStartedItem } from './GettingStartedContext';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const userId = session.user.id as string;
  const plan = ((session.user as { plan?: string }).plan ?? 'FREE') as
    'FREE' | 'PRO' | 'ENTERPRISE';

  const [usage, projectCount, analysisCount, me] = await Promise.all([
    getCurrentUsage(userId, plan).then((u) => ({ ...u, plan })),
    prisma.project.count({ where: { userId } }),
    prisma.analysis.count({ where: { project: { userId } } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompletedAt: true,
        firstReportViewedAt: true,
        projectsOverviewViewedAt: true,
        gettingStartedDismissedAt: true,
      },
    }),
  ]);

  const gettingStartedItems: GettingStartedItem[] = [
    {
      key: 'project',
      label: 'Create your first project',
      done: projectCount > 0,
      href: '/dashboard',
    },
    {
      key: 'analysis',
      label: 'Run your first analysis',
      done: analysisCount > 0,
      href: '/projects/new-analysis',
    },
    {
      key: 'report',
      label: 'View your first report',
      done: !!me?.firstReportViewedAt,
      href: '/projects/new-analysis',
    },
    {
      key: 'overview',
      label: 'Explore your Projects overview',
      done: !!me?.projectsOverviewViewedAt,
      href: '/projects',
    },
  ];

  return (
    <GettingStartedProvider
      items={gettingStartedItems}
      initialDismissed={!!me?.gettingStartedDismissedAt}
    >
      <div className="min-h-screen bg-bg-base">
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
        <OnboardingFlow show={!me?.onboardingCompletedAt} />
        <TopBarAuth userName={session.user.name} userImage={session.user.image} />
        <div className="flex pt-20">
          <Sidebar usage={usage} />
          <main className="flex-1 p-xl lg:ml-64">{children}</main>
        </div>
      </div>
    </GettingStartedProvider>
  );
}
