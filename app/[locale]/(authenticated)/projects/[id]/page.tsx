import { notFound } from 'next/navigation';
import { Plus, ArrowRight, FolderOpen, Sparkles } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import {
  ProjectHeader,
  ProjectAnalysesList,
  ProjectScoreTrend,
  ProjectActionBar,
} from '@/components/poisik';
import type { AnalysisResult, Category } from '@/lib/schemas';
import { CATEGORY_LABELS } from '@/lib/categories';

function scoreOf(result: unknown): number | undefined {
  return (result as { overall_score?: number } | null)?.overall_score;
}

// Design reference: design_v2/project_alpha_details (Stitch mockup). After
// review, matched the mockup as closely as possible per explicit direction
// — including the colored PASSED/FAIL/WARNING status (ProjectAnalysesList),
// the colored Key Findings dots below, and the bar-chart score trend with
// 30D/90D range chips (ProjectScoreTrend) — a deliberate, scoped exception
// to the monochrome treatment used everywhere else in the app (dashboard,
// projects, report). The mockup's fixed-to-viewport bottom action bar was
// tried and dropped per follow-up feedback; New Analysis/Compare now live
// in ProjectActionBar, a `sticky top-20` bar (docks below TopBarAuth) so
// they stay reachable while scrolling without behaving like a mobile app's
// bottom tab bar.
//
// Two things were still not reproduced literally, because they cross from
// "visual style" into "showing the user something false":
// - No per-analysis title/"scan type" exists in the schema (the AI doesn't
//   name audits), so rows read "Audit #N" + real date + real issue count
//   instead of invented names like "V2 Checkout Flow Audit".
// - The mockup's "Audit Strategy Optimized — next scan in 14 hours" card is
//   replaced with a real "Priority focus area" callout computed from the
//   latest analysis's actual category_scores (lowest-scoring category) —
//   same visual treatment, no fabricated scheduling claim.
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { analyses: { orderBy: { createdAt: 'asc' } } },
  });
  if (!project) notFound();

  const analysesAsc = project.analyses; // oldest -> newest, for the trend chart
  const analysesDesc = [...analysesAsc].reverse(); // newest -> oldest, for the list

  if (analysesAsc.length === 0) {
    return (
      <div>
        <ProjectHeader projectId={project.id} initialName={project.name} analysisCount={0} />
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent-signal/5 blur-[100px]" />
          <div className="relative z-10 mx-auto w-full max-w-[448px] rounded-xl border border-border bg-surface p-lg text-center shadow-2xl">
            <div className="mx-auto mb-md flex size-20 items-center justify-center rounded-2xl border border-border bg-bg-elevated shadow-[0_0_40px_-8px_var(--color-accent-glow)]">
              <FolderOpen className="size-9 text-accent-signal" strokeWidth={1.5} />
            </div>
            <h2 className="mb-sm text-headline-md font-bold text-text-primary">
              No analyses yet
            </h2>
            <p className="mb-lg text-body-md text-text-secondary">
              Run your first AI audit for &quot;{project.name}&quot; to start tracking its score
              over time.
            </p>
            <div className="flex flex-col gap-sm sm:flex-row sm:justify-center">
              <Link
                href={`/projects/${project.id}/analyze`}
                className="inline-flex items-center justify-center gap-xs rounded-lg bg-accent-signal px-md py-sm text-label-sm font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                <Plus className="size-3.5" strokeWidth={2} />
                Run first analysis
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-xs rounded-lg border border-border-strong px-md py-sm text-label-sm font-bold whitespace-nowrap text-text-primary transition-colors hover:bg-surface-hover"
              >
                View sample report
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const latest = analysesDesc[0]!;

  const scorePoints = analysesAsc.map((a) => ({
    id: a.id,
    score: scoreOf(a.result) ?? 0,
    createdAt: a.createdAt.toISOString(),
  }));

  const latestResult = latest.result as AnalysisResult | undefined;
  const issueCounts = { critical: 0, warning: 0, suggestion: 0 };
  latestResult?.issues.forEach((issue) => {
    issueCounts[issue.severity] += 1;
  });
  const totalIssues = issueCounts.critical + issueCounts.warning + issueCounts.suggestion;

  const categoryEntries = Object.entries(latestResult?.category_scores ?? {}) as [
    Category,
    number,
  ][];
  const priorityCategory =
    categoryEntries.length > 0
      ? categoryEntries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))
      : undefined;

  const analysisItems = analysesDesc.map((a, i) => {
    const result = a.result as AnalysisResult | undefined;
    return {
      id: a.id,
      index: analysesDesc.length - i,
      score: scoreOf(a.result),
      issuesCount: result?.issues.length ?? 0,
      imageUrl: a.imageUrl,
      createdAt: a.createdAt,
    };
  });

  const showCompare = analysesAsc.length >= 2;

  return (
    <div className="space-y-gutter">
      <ProjectHeader
        projectId={project.id}
        initialName={project.name}
        analysisCount={analysesAsc.length}
      />

      <ProjectActionBar
        projectId={project.id}
        projectName={project.name}
        showCompare={showCompare}
      />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ProjectScoreTrend analyses={scorePoints} />
        </div>
        <div className="flex flex-col gap-gutter lg:col-span-4">
          <div className="flex flex-col rounded-xl border border-border bg-surface p-lg">
            <h3 className="mb-md text-label-sm font-bold tracking-wider text-text-secondary uppercase">
              Key Findings
            </h3>
            {totalIssues > 0 ? (
              <div className="space-y-md">
                <div className="flex items-center gap-md">
                  <span className="size-2 shrink-0 rounded-full bg-[#ffb4ab]" />
                  <p className="flex-1 text-body-md text-text-primary">
                    {issueCounts.critical} critical{' '}
                    {issueCounts.critical === 1 ? 'issue' : 'issues'}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <span className="size-2 shrink-0 rounded-full bg-[#f3bf4f]" />
                  <p className="flex-1 text-body-md text-text-primary">
                    {issueCounts.warning} warning{issueCounts.warning === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <span className="size-2 shrink-0 rounded-full bg-accent-signal" />
                  <p className="flex-1 text-body-md text-text-primary">
                    {issueCounts.suggestion} suggestion{issueCounts.suggestion === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-body-md text-text-secondary">
                No issues found in the latest audit — clean bill of health.
              </p>
            )}
          </div>

          {priorityCategory && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-accent-signal/20 bg-accent-soft-bg p-lg text-center">
              <Sparkles className="mb-sm size-5 text-accent-signal" strokeWidth={1.5} />
              <p className="text-label-md font-bold text-accent-signal">Priority focus area</p>
              <p className="mt-xs text-label-sm text-text-secondary">
                {CATEGORY_LABELS[priorityCategory[0]] || priorityCategory[0]} scored{' '}
                {priorityCategory[1]}/100 — the most room to improve.
              </p>
            </div>
          )}

          <Link
            href={`/report/${latest.id}`}
            className="inline-flex items-center justify-center gap-xs rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-accent-signal transition-colors hover:bg-surface-hover"
          >
            View full report
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div>
        <div className="mb-lg flex items-end justify-between">
          <h3 className="text-headline-md font-bold text-text-primary">Analyses</h3>
          <p className="text-label-md text-text-secondary">Newest first</p>
        </div>
        <ProjectAnalysesList analyses={analysisItems} />
      </div>
    </div>
  );
}
