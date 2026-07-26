import { notFound } from 'next/navigation';
import {
  Plus,
  GitCompare,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { ProjectHeader, ProjectAnalysesList, ScoreTrendWidget } from '@/components/poisik';
import type { AnalysisResult } from '@/lib/schemas';

function scoreOf(result: unknown): number | undefined {
  return (result as { overall_score?: number } | null)?.overall_score;
}

// Design reference: design_v2/project_alpha_details (Stitch mockup). Kept
// the bento layout (score trend + findings side panel) and the analyses
// list, but dropped everything not backed by real data: there's no
// per-analysis title or "scan type" in the schema (AI doesn't name audits),
// so rows are labeled "Audit #N" + the real date instead of inventing names
// like "V2 Checkout Flow Audit"; the mockup's PASS/FAIL/WARNING badges and
// colored Key Findings dots are replaced with the monochrome score-tier
// treatment already used elsewhere (RecentActivityWidget) and icon-shape
// (not color) differentiation; the "Audit Strategy Optimized — next scan in
// 14 hours" AI upsell card is dropped entirely — there's no scheduling
// system behind it. Findings counts are real, computed from the latest
// analysis's actual issues array.
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
          <div className="relative z-10 mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-lg text-center shadow-2xl">
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
            <Link
              href={`/projects/${project.id}/analyze`}
              className="inline-flex items-center gap-sm rounded-xl bg-accent-signal px-lg py-md text-label-md font-bold text-white transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" strokeWidth={2} />
              Run first analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latest = analysesDesc[0]!;

  const scoreSeries = analysesAsc.map((a) => ({
    score: scoreOf(a.result) ?? 0,
    date: a.createdAt.toISOString(),
  }));

  const latestResult = latest.result as AnalysisResult | undefined;
  const issueCounts = { critical: 0, warning: 0, suggestion: 0 };
  latestResult?.issues.forEach((issue) => {
    issueCounts[issue.severity] += 1;
  });
  const totalIssues = issueCounts.critical + issueCounts.warning + issueCounts.suggestion;

  const analysisItems = analysesDesc.map((a, i) => ({
    id: a.id,
    index: analysesDesc.length - i,
    score: scoreOf(a.result),
    imageUrl: a.imageUrl,
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-gutter">
      <ProjectHeader
        projectId={project.id}
        initialName={project.name}
        analysisCount={analysesAsc.length}
      >
        {analysesAsc.length >= 2 && (
          <Link
            href={`/projects/${project.id}/compare`}
            className="flex flex-1 items-center justify-center gap-sm rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover sm:flex-none"
          >
            <GitCompare className="size-4" strokeWidth={1.5} />
            Compare
          </Link>
        )}
        <Link
          href={`/projects/${project.id}/analyze`}
          className="flex flex-1 items-center justify-center gap-sm rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 sm:flex-none"
        >
          <Plus className="size-4" strokeWidth={2} />
          New Analysis
        </Link>
      </ProjectHeader>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ScoreTrendWidget scores={scoreSeries} subtitle="This project's audit score over time" />
        </div>
        <div className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-lg">
            <h3 className="mb-md text-label-sm font-bold tracking-wider text-text-secondary uppercase">
              Latest findings
            </h3>
            {totalIssues > 0 ? (
              <div className="flex-1 space-y-md">
                <div className="flex items-center gap-md">
                  <AlertTriangle
                    className="size-4 shrink-0 text-accent-signal"
                    strokeWidth={1.5}
                  />
                  <p className="text-body-md text-text-primary">
                    {issueCounts.critical} critical{' '}
                    {issueCounts.critical === 1 ? 'issue' : 'issues'}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <AlertCircle className="size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
                  <p className="text-body-md text-text-primary">
                    {issueCounts.warning} warning{issueCounts.warning === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <Lightbulb className="size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
                  <p className="text-body-md text-text-primary">
                    {issueCounts.suggestion} suggestion{issueCounts.suggestion === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="flex-1 text-body-md text-text-secondary">
                No issues found in the latest audit — clean bill of health.
              </p>
            )}
            <Link
              href={`/report/${latest.id}`}
              className="mt-lg inline-flex items-center gap-xs text-label-md font-bold text-accent-signal hover:underline"
            >
              View full report
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
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
