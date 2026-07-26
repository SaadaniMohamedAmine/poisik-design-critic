import {
  FolderPlus,
  Sparkles,
  ShieldCheck,
  FolderKanban,
  BarChart3,
  Award,
  Zap,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { auth } from '@/auth';
import { Link } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUsage } from '@/lib/usage';
import {
  CreateProjectForm,
  ScoreTrendWidget,
  RecentActivityWidget,
  ProjectsOverviewWidget,
  PlanUsageWidget,
  GettingStartedWidget,
} from '@/components/poisik';

function scoreOf(result: unknown): number | undefined {
  return (result as { overall_score?: number } | null)?.overall_score;
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      analyses: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { analyses: true } },
    },
  });

  if (projects.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent-signal/5 blur-[100px]" />

        <div className="relative z-10 mx-auto w-full max-w-[448px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-lg shadow-2xl">
            <div className="relative z-10 w-full text-center">
              <div className="mx-auto mb-md flex size-20 items-center justify-center rounded-2xl border border-border bg-bg-elevated shadow-[0_0_40px_-8px_var(--color-accent-glow)]">
                <FolderPlus className="size-9 text-accent-signal" strokeWidth={1.5} />
              </div>

              <h1 className="mb-sm text-headline-lg font-bold text-text-primary">
                Create your first project
              </h1>
              <p className="mb-lg text-body-md leading-relaxed text-text-secondary">
                Start by naming your first project to organize your design audits. Our AI engine
                will be ready to scan your first upload.
              </p>

              <CreateProjectForm />
            </div>
          </div>

          <div className="mt-lg grid grid-cols-2 gap-md opacity-70">
            <div className="flex items-start gap-md rounded-lg border border-border bg-surface p-md">
              <Sparkles className="size-5 shrink-0 text-accent-signal" strokeWidth={1.5} />
              <div>
                <p className="text-label-md text-text-primary">AI Powered</p>
                <p className="text-[12px] text-text-muted">Real-time heuristics</p>
              </div>
            </div>
            <div className="flex items-start gap-md rounded-lg border border-border bg-surface p-md">
              <ShieldCheck className="size-5 shrink-0 text-accent-signal" strokeWidth={1.5} />
              <div>
                <p className="text-label-md text-text-primary">Standardized</p>
                <p className="text-[12px] text-text-muted">WCAG &amp; ISO Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth();

  const recentAnalyses = await prisma.analysis.findMany({
    where: { project: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { project: true },
  });

  const totalAnalyses = await prisma.analysis.count({ where: { project: { userId } } });
  const analysesThisMonth = await prisma.analysis.count({
    where: { project: { userId }, createdAt: { gte: monthStart } },
  });
  const projectsThisMonth = projects.filter((p) => p.createdAt >= monthStart).length;

  const allScored = await prisma.analysis.findMany({
    where: { project: { userId } },
    select: { result: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const scoreSeries = allScored.map((a) => ({
    score: scoreOf(a.result) ?? 0,
    date: a.createdAt.toISOString(),
  }));
  const avgScore =
    scoreSeries.length > 0
      ? Math.round(scoreSeries.reduce((sum, s) => sum + s.score, 0) / scoreSeries.length)
      : 0;

  const plan = (session!.user as { plan?: string }).plan ?? 'FREE';
  const { remaining, limit } = await getCurrentUsage(userId, plan);

  const topProjects = [...projects]
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: scoreOf(p.analyses[0]?.result),
      analysisCount: p._count.analyses,
      imageUrl: p.analyses[0]?.imageUrl,
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
    .slice(0, 4);

  interface StatCard {
    label: string;
    value: string | number;
    delta?: string;
    icon: LucideIcon;
    progress?: number;
    // Only the "Analyses left" card ever sets this — monochrome brand rule
    // means "you're out of credits" can't be signaled with a red/amber
    // accent, so it's done with emphasis (accent border + tinted
    // background) instead. See PlanUsageWidget and Sidebar for the same
    // zero-quota treatment.
    isAtLimit?: boolean;
  }

  const statCards: StatCard[] = [
    {
      label: 'Total projects',
      value: projects.length,
      delta: projectsThisMonth > 0 ? `+${projectsThisMonth} this month` : undefined,
      icon: FolderKanban,
    },
    {
      label: 'Total analyses',
      value: totalAnalyses,
      delta: analysesThisMonth > 0 ? `+${analysesThisMonth} this month` : undefined,
      icon: BarChart3,
    },
    {
      label: 'Average score',
      value: scoreSeries.length > 0 ? avgScore : '—',
      delta: scoreSeries.length > 0 ? '/ 100' : undefined,
      icon: Award,
    },
    {
      // No `progress` here on purpose — PlanUsageWidget below already has
      // its own progress bar for this exact number; showing two bars for
      // one metric on the same screen was redundant.
      label: 'Analyses left',
      value: limit === null ? '∞' : `${remaining}/${limit}`,
      delta: limit === null ? 'Unlimited' : remaining === 0 ? 'Upgrade for more' : 'This month',
      icon: Zap,
      isAtLimit: limit !== null && remaining === 0,
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center gap-md duration-500">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <Activity className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">Overview</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            Real-time auditing performance and project health.
          </p>
        </div>
      </div>

      <GettingStartedWidget />

      <div className="grid animate-in fade-in slide-in-from-bottom-4 grid-cols-2 gap-gutter duration-500 md:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`group rounded-xl border p-lg transition-colors ${
              stat.isAtLimit
                ? 'border-accent-signal/50 bg-accent-soft-bg'
                : 'border-border bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className="mb-md flex items-start justify-between">
              <p className="text-label-sm tracking-wider text-text-secondary uppercase">
                {stat.label}
              </p>
              <stat.icon
                className="size-5 text-accent-signal transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex items-baseline gap-sm">
              <span className="text-[32px] leading-none font-bold text-text-primary">
                {stat.value}
              </span>
              {stat.delta &&
                (stat.isAtLimit ? (
                  <Link
                    href="/pricing"
                    className="text-label-sm font-semibold text-accent-signal hover:underline"
                  >
                    {stat.delta}
                  </Link>
                ) : (
                  <span className="text-label-sm text-text-secondary">{stat.delta}</span>
                ))}
            </div>
            {stat.progress !== undefined && (
              <div className="mt-md h-1 w-full overflow-hidden rounded-full bg-bg-elevated">
                <div
                  className="h-full bg-accent-signal transition-all"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid animate-in fade-in slide-in-from-bottom-4 grid-cols-1 gap-gutter duration-700 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ScoreTrendWidget scores={scoreSeries} />
        </div>
        <div className="lg:col-span-4">
          <PlanUsageWidget plan={plan} remaining={remaining} limit={limit} />
        </div>
      </div>

      <div className="grid animate-in fade-in slide-in-from-bottom-4 grid-cols-1 gap-gutter duration-700 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentActivityWidget
            analyses={recentAnalyses.map((a) => ({
              id: a.id,
              projectId: a.projectId,
              projectName: a.project.name,
              imageUrl: a.imageUrl,
              score: scoreOf(a.result),
              createdAt: a.createdAt,
            }))}
          />
        </div>
        <div className="lg:col-span-5">
          <ProjectsOverviewWidget projects={topProjects} />
        </div>
      </div>
    </div>
  );
}
