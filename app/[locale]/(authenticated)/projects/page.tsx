import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { CreateProjectForm, ProjectsGrid, type ProjectGridItem } from '@/components/poisik';

export default async function ProjectsPage() {
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

  // Fire-and-forget: powers the "Explore your Projects overview" onboarding
  // checklist step (see GettingStartedProvider in AppShell.tsx). Guarded by
  // the `null` filter so it only ever writes once per account.
  prisma.user
    .updateMany({ where: { id: userId, projectsOverviewViewedAt: null }, data: { projectsOverviewViewedAt: new Date() } })
    .catch(() => {});

  const items: ProjectGridItem[] = projects.map((project) => {
    const latest = project.analyses[0];
    const score = (latest?.result as { overall_score?: number } | undefined)?.overall_score;
    return {
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt.toISOString(),
      imageUrl: latest?.imageUrl,
      score,
      analysisCount: project._count.analyses,
    };
  });

  return <ProjectsGrid projects={items} />;
}
