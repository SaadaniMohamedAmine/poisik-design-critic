import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CreateProjectForm } from '@/components/poisik';

export default async function NewAnalysisPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
  });

  if (projects.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
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

  if (projects.length === 1) {
    redirect({ href: `/projects/${projects[0].id}/analyze`, locale });
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-lg text-headline-md font-semibold text-text-primary">
        Which project is this for?
      </h1>
      <div className="space-y-sm">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/analyze`}
            className="block rounded-lg border border-border bg-surface px-lg py-md text-body-md text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            {project.name}
          </Link>
        ))}
      </div>
      <div className="mt-lg border-t border-border pt-lg">
        <p className="mb-sm text-label-md text-text-secondary">Or start a new one:</p>
        <CreateProjectForm />
      </div>
    </div>
  );
}
