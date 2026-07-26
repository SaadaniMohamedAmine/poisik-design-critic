import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { CreateProjectForm } from '@/components/poisik';

export default async function ProjectsPage() {
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

  // Fire-and-forget: powers the "Explore your Projects overview" onboarding
  // checklist step (see GettingStartedProvider in AppShell.tsx). Guarded by
  // the `null` filter so it only ever writes once per account.
  prisma.user
    .updateMany({ where: { id: userId, projectsOverviewViewedAt: null }, data: { projectsOverviewViewedAt: new Date() } })
    .catch(() => {});

  return (
    <div>
      <h1 className="mb-lg text-headline-lg font-semibold text-text-primary">Projects</h1>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {projects.map((project) => {
          const latest = project.analyses[0];
          const score = (latest?.result as { overall_score?: number } | undefined)?.overall_score;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-xl border border-border bg-surface p-md transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              {latest && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset
                <img
                  src={latest.imageUrl}
                  alt=""
                  className="mb-md h-32 w-full rounded-md object-cover"
                />
              )}
              <p className="font-medium text-text-primary">{project.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-label-sm text-text-secondary">
                  {project.updatedAt.toLocaleDateString()}
                </span>
                <span className="text-label-md text-accent-signal">{score ?? '—'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
