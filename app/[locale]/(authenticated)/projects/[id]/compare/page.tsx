import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ComparePicker } from '@/components/poisik';
import type { Category } from '@/lib/schemas';

// The `result` Json column always holds an AnalysisResultSchema-shaped object
// (see app/api/projects/[id]/analyses/route.ts), but we only need these two
// fields here, cast loosely the same way the sibling project pages do.
type AnalysisResultShape = {
  overall_score?: number;
  category_scores?: Partial<Record<Category, number>>;
} | null;

const CATEGORIES: { key: Category; labelKey: string }[] = [
  { key: 'visual_hierarchy', labelKey: 'visualHierarchy' },
  { key: 'contrast', labelKey: 'contrast' },
  { key: 'spacing', labelKey: 'spacing' },
  { key: 'typography', labelKey: 'typography' },
  { key: 'accessibility', labelKey: 'accessibility' },
  { key: 'consistency', labelKey: 'consistency' },
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
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) notFound();

  if (!a || !b) {
    return (
      <div>
        <h1 className="mb-lg text-headline-lg font-semibold text-text-primary">
          Select two analyses to compare
        </h1>
        <ComparePicker projectId={project.id} analyses={project.analyses} />
      </div>
    );
  }

  const [analysisA, analysisB] = await Promise.all([
    prisma.analysis.findFirst({ where: { id: a, projectId: project.id } }),
    prisma.analysis.findFirst({ where: { id: b, projectId: project.id } }),
  ]);
  if (!analysisA || !analysisB) notFound();

  const t = await getTranslations('Compare');
  const resultA = analysisA.result as AnalysisResultShape;
  const resultB = analysisB.result as AnalysisResultShape;

  return (
    <div>
      <h1 className="mb-xl text-headline-lg font-semibold text-text-primary">{t('title')}</h1>

      <div className="grid gap-xl md:grid-cols-2">
        {[
          { analysis: analysisA, result: resultA },
          { analysis: analysisB, result: resultB },
        ].map(({ analysis, result }, index) => (
          <div
            key={analysis.id}
            className="relative overflow-hidden rounded-xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
            <img
              src={analysis.imageUrl}
              alt={`Design ${index + 1}`}
              className="w-full object-cover"
            />
            <div className="absolute top-md right-md rounded-full bg-accent-signal px-md py-1 text-label-sm font-bold text-white">
              {t('score')}: {result?.overall_score ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {resultA?.category_scores && resultB?.category_scores && (
        <div className="mt-xl rounded-xl border border-border bg-surface p-lg">
          <h2 className="mb-md text-headline-md font-medium text-text-primary">
            {t('comparisonSummary')}
          </h2>
          <div className="space-y-md">
            {CATEGORIES.map(({ key, labelKey }) => {
              const scoreA = resultA.category_scores?.[key];
              const scoreB = resultB.category_scores?.[key];
              if (scoreA === undefined || scoreB === undefined) return null;
              const diff = scoreB - scoreA;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border pb-md last:border-0"
                >
                  <span className="text-label-md font-medium text-text-primary">{t(labelKey)}</span>
                  <div className="flex items-center gap-md">
                    <span className="text-label-md text-text-secondary">{scoreA}</span>
                    <span className="text-label-md text-text-muted">&rarr;</span>
                    <span className="text-label-md text-text-secondary">{scoreB}</span>
                    <span
                      className={`flex items-center gap-1 text-label-sm ${diff > 0 ? 'text-accent-signal' : 'text-text-muted'}`}
                    >
                      {diff > 0 ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
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
