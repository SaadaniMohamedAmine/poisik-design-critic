import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  History,
  BarChart3,
  Layers,
  Contrast,
  Ruler,
  Type,
  Accessibility,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
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

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  visual_hierarchy: Layers,
  contrast: Contrast,
  spacing: Ruler,
  typography: Type,
  accessibility: Accessibility,
  consistency: Shapes,
};

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
  const indexA = project.analyses.findIndex((x) => x.id === analysisA.id) + 1;
  const indexB = project.analyses.findIndex((x) => x.id === analysisB.id) + 1;

  const scoreA = resultA?.overall_score;
  const scoreB = resultB?.overall_score;
  const liftPct =
    scoreA !== undefined && scoreB !== undefined && scoreA > 0
      ? Math.round(((scoreB - scoreA) / scoreA) * 100)
      : undefined;

  const issuesA = resultA?.issues?.length;
  const issuesB = resultB?.issues?.length;
  const issuesResolved =
    issuesA !== undefined && issuesB !== undefined ? issuesA - issuesB : undefined;

  const categoryDeltas = CATEGORIES.map((key) => {
    const sA = resultA?.category_scores?.[key];
    const sB = resultB?.category_scores?.[key];
    if (sA === undefined || sB === undefined) return null;
    return {
      key,
      label: CATEGORY_LABELS[key] || key,
      icon: CATEGORY_ICONS[key],
      scoreA: sA,
      scoreB: sB,
      diff: sB - sA,
    };
  }).filter((d): d is NonNullable<typeof d> => d !== null);

  const topGains = [...categoryDeltas]
    .filter((d) => d.diff > 0)
    .sort((x, y) => y.diff - x.diff)
    .slice(0, 2);

  return (
    <div>
      <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-md">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
            <GitCompare className="size-5 text-accent-signal" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-text-primary">Comparing 2 audits</h1>
            <p className="mt-xs text-body-md text-text-secondary">
              Audit #{indexA} ({analysisA.createdAt.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              ) vs Audit #{indexB} (
              {analysisB.createdAt.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              )
            </p>
          </div>
        </div>

        {liftPct !== undefined && (
          <div className="flex shrink-0 items-center gap-sm self-start rounded-xl border border-border bg-surface px-md py-sm md:self-auto">
            <span className="text-label-sm text-text-muted uppercase tracking-wider">
              Score lift
            </span>
            <span
              className={`flex items-center gap-1 text-label-md font-bold ${liftPct > 0 ? 'text-accent-signal' : 'text-text-secondary'}`}
            >
              {liftPct > 0 ? (
                <TrendingUp className="size-4" strokeWidth={2} />
              ) : liftPct < 0 ? (
                <TrendingDown className="size-4" strokeWidth={2} />
              ) : (
                <Minus className="size-4" strokeWidth={2} />
              )}
              {liftPct > 0 ? '+' : ''}
              {liftPct}%
            </span>
          </div>
        )}
      </div>

      {/* Bento comparison grid */}
      <div className="mb-xl grid grid-cols-1 gap-lg md:grid-cols-2">
        {/* Before card */}
        <div className="group relative overflow-hidden rounded-xl border border-border bg-surface">
          <div className="absolute top-md left-md z-10 rounded border border-border bg-bg-base/80 px-sm py-xs text-label-sm font-bold text-text-secondary uppercase tracking-wide backdrop-blur-md">
            Before
          </div>
          <div className="absolute top-md right-md z-10 flex size-12 items-center justify-center rounded-full border border-border bg-bg-base/80 backdrop-blur-md">
            <span className="text-headline-md font-bold text-text-primary">{scoreA ?? '—'}</span>
          </div>
          <div className="aspect-video overflow-hidden bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
            <img
              src={analysisA.imageUrl}
              alt=""
              className="size-full object-cover opacity-70 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border p-lg">
            <div>
              <p className="text-label-md font-bold text-text-primary">Audit #{indexA}</p>
              <p className="text-label-sm text-text-muted">
                Captured{' '}
                {analysisA.createdAt.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Link
              href={`/report/${analysisA.id}`}
              aria-label="View full report for audit A"
              className="rounded-lg p-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <History className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* After card */}
        <div className="group relative overflow-hidden rounded-xl border border-accent-signal/30 bg-surface">
          <div className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-accent-signal/10 blur-[60px]" />
          <div className="absolute top-md left-md z-10 rounded bg-accent-signal px-sm py-xs text-label-sm font-bold text-white uppercase tracking-wide">
            After
          </div>
          <div className="absolute top-md right-md z-10 flex size-12 items-center justify-center rounded-full border border-accent-signal/40 bg-accent-soft-bg backdrop-blur-md">
            <span className="text-headline-md font-bold text-accent-signal">{scoreB ?? '—'}</span>
          </div>
          <div className="relative aspect-video overflow-hidden bg-bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
            <img
              src={analysisB.imageUrl}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="relative flex items-center justify-between border-t border-border p-lg">
            <div>
              <p className="text-label-md font-bold text-accent-signal">Audit #{indexB}</p>
              <p className="text-label-sm text-text-muted">
                Captured{' '}
                {analysisB.createdAt.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {issuesResolved !== undefined && issuesResolved !== 0 && (
              <div className="flex items-center gap-xs text-accent-signal">
                <Sparkles className="size-4" strokeWidth={1.5} />
                <span className="text-label-sm font-bold">
                  {issuesResolved > 0
                    ? `${issuesResolved} issue${issuesResolved === 1 ? '' : 's'} resolved`
                    : `${Math.abs(issuesResolved)} new issue${Math.abs(issuesResolved) === 1 ? '' : 's'}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category delta table */}
      {categoryDeltas.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-bg-elevated px-lg py-md">
            <h2 className="flex items-center gap-sm text-label-md font-bold text-text-primary">
              <BarChart3 className="size-4 text-accent-signal" strokeWidth={1.5} />
              Category Delta Analysis
            </h2>
            <span className="hidden text-label-sm text-text-muted sm:inline">
              Delta values represent point change
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-label-sm text-text-muted">
                  <th className="px-lg py-md font-semibold">Category</th>
                  <th className="px-lg py-md font-semibold">Previous</th>
                  <th className="px-lg py-md font-semibold">New</th>
                  <th className="px-lg py-md font-semibold">Improvement</th>
                  <th className="px-lg py-md text-right font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryDeltas.map(({ key, label, icon: Icon, scoreA: sA, scoreB: sB, diff }) => (
                  <tr key={key} className="transition-colors hover:bg-surface-hover">
                    <td className="px-lg py-lg">
                      <div className="flex items-center gap-md">
                        <div className="flex size-8 items-center justify-center rounded bg-bg-elevated">
                          <Icon className="size-[18px] text-text-secondary" strokeWidth={1.5} />
                        </div>
                        <span className="text-label-md font-bold text-text-primary">{label}</span>
                      </div>
                    </td>
                    <td className="px-lg py-lg text-body-md text-text-secondary">{sA}</td>
                    <td className="px-lg py-lg text-body-md font-bold text-text-primary">{sB}</td>
                    <td className="px-lg py-lg">
                      <span
                        className={`rounded-lg px-sm py-xs text-label-sm font-bold ${
                          diff > 0
                            ? 'bg-accent-soft-bg text-accent-signal'
                            : 'bg-bg-elevated text-text-muted'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {diff}
                      </span>
                    </td>
                    <td className="px-lg py-lg text-right">
                      {diff > 0 ? (
                        <TrendingUp className="ml-auto size-4 text-accent-signal" strokeWidth={2} />
                      ) : diff < 0 ? (
                        <TrendingDown className="ml-auto size-4 text-text-muted" strokeWidth={2} />
                      ) : (
                        <Minus className="ml-auto size-4 text-text-muted" strokeWidth={2} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insight banner — real, computed from category_scores (no fabricated AI narrative) */}
      <div className="mt-lg flex flex-col items-center gap-lg rounded-xl border border-accent-signal/20 bg-accent-soft-bg p-lg md:flex-row">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-signal/10">
          <Sparkles className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-label-md font-bold text-accent-signal">Key improvements</h3>
          <p className="mt-xs text-body-md text-text-secondary">
            {topGains.length > 0 ? (
              <>
                The biggest gains were in{' '}
                <strong className="text-text-primary">
                  {topGains.map((g) => `${g.label} (+${g.diff})`).join(' and ')}
                </strong>
                .
              </>
            ) : (
              'No category improved between these two audits.'
            )}
          </p>
        </div>
        <Link
          href={`/report/${analysisB.id}`}
          className="shrink-0 rounded-xl bg-accent-signal px-lg py-md text-label-md font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90"
        >
          View full report
        </Link>
      </div>
    </div>
  );
}
