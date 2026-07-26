import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { GitCompare, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ComparePicker } from '@/components/poisik';
import type { Category } from '@/lib/schemas';
import { CATEGORY_LABELS } from '@/lib/categories';

// The `result` Json column always holds an AnalysisResultSchema-shaped object
// (see app/api/projects/[id]/analyses/route.ts), but we only need these two
// fields here, cast loosely the same way the sibling project pages do.
type AnalysisResultShape = {
  overall_score?: number;
  category_scores?: Partial<Record<Category, number>>;
  issues?: unknown[];
} | null;

const CATEGORIES: Category[] = [
  'visual_hierarchy',
  'contrast',
  'spacing',
  'typography',
  'accessibility',
  'consistency',
];

export default async function ProjectComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id } = await params;
  const { a, b } = await searchParams;
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { analyses: { orderBy: { createdAt: 'asc' } } },
  });
  if (!project) notFound();

  // Picker step: no two analyses chosen yet.
  if (!a || !b) {
    const analysesDesc = [...project.analyses].reverse();
    const items = analysesDesc.map((analysis, i) => {
      const result = analysis.result as AnalysisResultShape;
      return {
        id: analysis.id,
        index: analysesDesc.length - i,
        imageUrl: analysis.imageUrl,
        score: result?.overall_score,
        issuesCount: result?.issues?.length ?? 0,
        createdAt: analysis.createdAt,
      };
    });

    return (
      <div>
        <div className="mb-xl flex items-center gap-md">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
            <GitCompare className="size-5 text-accent-signal" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-text-primary">
              Select analyses to compare
            </h1>
            <p className="mt-xs text-body-md text-text-secondary">
              Choose exactly 2 audits to see the visual and score diff.
            </p>
          </div>
        </div>

        {project.analyses.length < 2 ? (
          <div className="flex flex-col items-center gap-sm rounded-xl border border-border bg-surface py-xxl text-center">
            <GitCompare className="size-8 text-text-muted" strokeWidth={1.5} />
            <p className="text-body-md text-text-secondary">
              You need at least 2 analyses on this project to compare.
            </p>
            <Link
              href={`/projects/${project.id}`}
              className="mt-sm text-label-md font-bold text-accent-signal hover:underline"
            >
              Back to project
            </Link>
          </div>
        ) : (
          <ComparePicker projectId={project.id} analyses={items} />
        )}
      </div>
    );
  }

  const [analysisA, analysisB] = await Promise.all([
    prisma.analysis.findFirst({ where: { id: a, projectId: project.id } }),
    prisma.analysis.findFirst({ where: { id: b, projectId: project.id } }),
  ]);
  if (!analysisA || !analysisB) notFound();

  const resultA = analysisA.result as AnalysisResultShape;
  const resultB = analysisB.result as AnalysisResultShape;

  return (
    <div>
      <div className="mb-xl flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <GitCompare className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">Comparing 2 audits</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            {analysisA.createdAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            vs{' '}
            {analysisB.createdAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-lg md:grid-cols-2">
        {[analysisA, analysisB].map((analysis, index) => {
          const result = index === 0 ? resultA : resultB;
          return (
            <div
              key={analysis.id}
              className="relative overflow-hidden rounded-xl border border-border bg-surface"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
              <img
                src={analysis.imageUrl}
                alt={`Design ${index + 1}`}
                className="w-full object-cover"
              />
              <div className="absolute top-md right-md rounded-full border border-border bg-bg-base/80 px-md py-1 text-label-sm font-bold text-accent-signal backdrop-blur-md">
                Score: {result?.overall_score ?? '—'}
              </div>
            </div>
          );
        })}
      </div>

      {resultA?.category_scores && resultB?.category_scores && (
        <div className="mt-xl rounded-xl border border-border bg-surface p-lg">
          <h2 className="mb-md text-headline-md font-bold text-text-primary">
            Comparison summary
          </h2>
          <div className="space-y-md">
            {CATEGORIES.map((key) => {
              const scoreA = resultA.category_scores?.[key];
              const scoreB = resultB.category_scores?.[key];
              if (scoreA === undefined || scoreB === undefined) return null;
              const diff = scoreB - scoreA;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border pb-md last:border-0"
                >
                  <span className="text-label-md font-medium text-text-primary">
                    {CATEGORY_LABELS[key] || key}
                  </span>
                  <div className="flex items-center gap-md">
                    <span className="text-label-md text-text-secondary">{scoreA}</span>
                    <span className="text-label-md text-text-muted">&rarr;</span>
                    <span className="text-label-md text-text-secondary">{scoreB}</span>
                    <span
                      className={`flex items-center gap-1 text-label-sm font-bold ${diff > 0 ? 'text-accent-signal' : 'text-text-muted'}`}
                    >
                      {diff > 0 ? (
                        <TrendingUp className="size-4" strokeWidth={2} />
                      ) : (
                        <TrendingDown className="size-4" strokeWidth={2} />
                      )}
                      {diff > 0 ? '+' : ''}
                      {diff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
