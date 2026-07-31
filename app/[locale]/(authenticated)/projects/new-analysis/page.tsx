import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Sparkles, FolderOpen, BarChart3, ArrowRight } from 'lucide-react';
import { CreateProjectForm } from '@/components/poisik';

export default async function NewAnalysisPage() {
  const t = await getTranslations('NewAnalysis');
  const tProjects = await getTranslations('Projects');
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { analyses: true } } },
  });

  if (projects.length === 0) {
    return (
      <div className="mx-auto mt-16 max-w-112 text-center">
        <div className="mx-auto mb-lg flex size-14 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <Sparkles className="size-6 text-accent-signal" strokeWidth={1.5} />
        </div>
        <h1 className="mb-sm text-headline-lg font-bold text-text-primary">
          {tProjects('emptyTitle')}
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">{tProjects('emptyDesc')}</p>
        <div className="rounded-xl border border-border bg-surface p-lg text-left shadow-lg">
          <CreateProjectForm />
        </div>
      </div>
    );
  }

  if (projects.length === 1) {
    redirect({ href: `/projects/${projects[0].id}/analyze`, locale });
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <Sparkles className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">{t('whichProject')}</h1>
          <p className="mt-xs text-body-md text-text-secondary">{t('pickProject')}</p>
        </div>
      </div>

      <div className="space-y-sm">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/analyze`}
            className="group flex items-center gap-md rounded-xl border border-border bg-surface px-lg py-md transition-all hover:border-accent-signal/50 hover:bg-surface-hover"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-elevated">
              <FolderOpen className="size-4 text-accent-signal" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-grow">
              <p className="truncate text-body-md font-semibold text-text-primary">
                {project.name}
              </p>
              <div className="mt-xs flex items-center gap-xs text-text-secondary">
                <BarChart3 className="size-3.5" strokeWidth={1.5} />
                <span className="text-label-sm">
                  {t('analysesCount', { count: project._count.analyses })}
                </span>
              </div>
            </div>
            <ArrowRight
              className="size-4 shrink-0 text-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent-signal"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>

      <div className="relative my-xl">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-label-sm">
          <span className="bg-bg-base px-md text-text-secondary uppercase tracking-widest">
            {t('orStartNewProject')}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-lg shadow-lg">
        <CreateProjectForm />
      </div>
    </div>
  );
}
