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
      <div className="mx-auto mt-24 max-w-112 text-center">
        <h1 className="mb-sm text-headline-md font-semibold text-text-primary">
          Create your first project
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">
          A project groups every analysis you run on the same design, so you can track its progress
          over time.
        </p>
        <CreateProjectForm />
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
