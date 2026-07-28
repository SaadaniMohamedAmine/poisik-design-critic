import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUsage } from '@/lib/usage';
import { TopBarAuth } from './TopBarAuth';
import { Sidebar } from './Sidebar';
import { SpeedDial } from './SpeedDial';
import { WelcomeToast } from './WelcomeToast';
import { OnboardingFlow } from './OnboardingFlow';
import { GettingStartedProvider, type GettingStartedItem } from './GettingStartedContext';

interface ShellData {
  usage: { remaining: number | null; limit: number | null; plan: string };
  gettingStartedItems: GettingStartedItem[];
  gettingStartedDismissed: boolean;
  onboardingShow: boolean;
  projects: { id: string; name: string }[];
}

// Shared by AppShell (dashboard/projects, requires auth) and the report
// page's owner branch (report/[id]/page.tsx, auth already checked there
// since a report can also be viewed by nobody signed in via a public link).
// Keeping this one place means both surfaces load the exact same
// usage/onboarding/getting-started signals instead of drifting apart.
export async function loadShellData(session: Session): Promise<ShellData> {
  const userId = session.user!.id as string;
  const plan = ((session.user as { plan?: string }).plan ?? 'FREE') as
    'FREE' | 'PRO' | 'ENTERPRISE';

  const [usage, projectCount, analysisCount, me, projects] = await Promise.all([
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
    // Lightweight (id + name only) — feeds the sidebar's Projects dropdown,
    // which just needs to list + link to projects, not their analyses.
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { updatedAt: 'desc' },
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

  return {
    usage,
    gettingStartedItems,
    gettingStartedDismissed: !!me?.gettingStartedDismissedAt,
    onboardingShow: !me?.onboardingCompletedAt,
    projects,
  };
}

// Presentational chrome (topbar + sidebar + onboarding overlays) — no auth
// check, no redirect. AppShell below is the page-layout entry point that
// does the redirect; report/[id]/page.tsx calls loadShellData + this
// directly for its owner branch, where redirecting on no-session would be
// wrong (a report can be public).
export function AppShellChrome({
  session,
  shellData,
  children,
}: {
  session: Session;
  shellData: ShellData;
  children: React.ReactNode;
}) {
  const { usage, gettingStartedItems, gettingStartedDismissed, onboardingShow, projects } =
    shellData;

  return (
    <GettingStartedProvider items={gettingStartedItems} initialDismissed={gettingStartedDismissed}>
      <div className="min-h-screen bg-bg-base">
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
        <OnboardingFlow show={onboardingShow} />
        <SpeedDial usage={usage} />
        <TopBarAuth
          userName={session.user!.name}
          userImage={session.user!.image}
          usage={usage}
          projects={projects}
        />
        <div className="flex pt-20">
          <Sidebar usage={usage} projects={projects} />
          <main className="flex-1 p-md lg:ml-64 lg:p-xl">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </GettingStartedProvider>
  );
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const shellData = await loadShellData(session);

  return (
    <AppShellChrome session={session} shellData={shellData}>
      {children}
    </AppShellChrome>
  );
}
