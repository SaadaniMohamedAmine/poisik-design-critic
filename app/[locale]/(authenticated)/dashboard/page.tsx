import { FolderPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  CreateProjectForm,
  ScoreTrendWidget,
  RecentActivityWidget,
  ProjectsOverviewWidget,
} from '@/components/poisik';

function scoreOf(result: unknown): number | undefined {
  return (result as { overall_score?: number } | null)?.overall_score;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
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

  const recentAnalyses = await prisma.analysis.findMany({
    where: { project: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { project: true },
  });

  const totalAnalyses = await prisma.analysis.count({ where: { project: { userId } } });

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

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Analyses', value: totalAnalyses },
          { label: 'Average score', value: avgScore },
          { label: 'Plan', value: plan },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-lg">
            <p className="mb-xs text-label-sm text-text-secondary">{stat.label}</p>
            <p className="text-headline-md font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <ScoreTrendWidget scores={scoreSeries} />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        <RecentActivityWidget
          analyses={recentAnalyses.map((a) => ({
            id: a.id,
            projectName: a.project.name,
            score: scoreOf(a.result),
          }))}
        />
        <ProjectsOverviewWidget
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            score: scoreOf(p.analyses[0]?.result),
          }))}
        />
      </div>
    </div>
  );
}
