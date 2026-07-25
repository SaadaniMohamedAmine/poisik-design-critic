import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const project = await prisma.project.findFirst({
    where: { id, userId: (session!.user as { id: string }).id },
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) notFound();

  return (
    <div>
      <div className="mb-lg flex items-center justify-between">
        <h1 className="text-headline-lg font-semibold text-text-primary">{project.name}</h1>
        <div className="flex gap-md">
          <Link
            href={`/projects/${project.id}/analyze`}
            className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            New Analysis
          </Link>
          {project.analyses.length >= 2 && (
            <Link
              href={`/projects/${project.id}/compare`}
              className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              Compare
            </Link>
          )}
        </div>
      </div>

      {project.analyses.length === 0 ? (
        <p className="text-body-md text-text-secondary">
          No analyses yet — run your first one for this project.
        </p>
      ) : (
        <ul className="space-y-sm">
          {project.analyses.map((analysis) => {
            const score = (analysis.result as { overall_score?: number } | null)?.overall_score;
            return (
              <li key={analysis.id}>
                <Link
                  href={`/report/${analysis.id}`}
                  className="flex items-center gap-md rounded-lg border border-border bg-surface p-md transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
                  <img src={analysis.imageUrl} alt="" className="size-12 rounded-md object-cover" />
                  <span className="flex-1 text-text-primary">
                    {analysis.createdAt.toLocaleDateString()}
                  </span>
                  <span className="text-accent-signal">{score}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
