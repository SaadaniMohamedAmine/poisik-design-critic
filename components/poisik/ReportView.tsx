'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Share2, MapPin, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CircularGauge } from '@/components/poisik/CircularGauge';
import { AnnotationMarker } from '@/components/poisik/AnnotationMarker';
import { CategoryScoreBar } from '@/components/poisik/CategoryScoreBar';
import { getClosestBenchmark } from '@/lib/benchmarks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AnalysisResult } from '@/lib/schemas';
import { CATEGORY_LABELS } from '@/lib/categories';

interface ReportViewProps {
  result: AnalysisResult;
  imageUrl?: string;
  isDemo?: boolean;
  // The signed-in owner viewing their own analysis gets Export/Share
  // actions instead of the public-share footer. Everyone else (an
  // anonymous visitor on a share link, or a different signed-in account)
  // sees the read-only public variant.
  showOwnerActions?: boolean;
  // Only needed when showOwnerActions is true — the Share Report button
  // uses these to flip Analysis.isPublic via PATCH /api/analyses/[id] and
  // copy the real /report/[id] link.
  analysisId?: string;
  initialIsPublic?: boolean;
}

type Issue = AnalysisResult['issues'][number];

const severityStyles = {
  critical:
    'bg-accent-signal text-white font-bold uppercase tracking-wide px-3 py-1 rounded-full text-xs',
  warning:
    'bg-accent-signal/40 text-text-primary font-semibold uppercase tracking-wide px-3 py-1 rounded-full text-xs',
  suggestion:
    'border border-border-strong text-text-muted font-medium uppercase tracking-wide px-3 py-1 rounded-full text-xs',
};

// Falls back to the illustrative Stitch mockup only when no real screenshot
// is available (the /demo page, which has no upload at all) — every real
// analysis passes its own analysis.imageUrl down from the report page.
const FALLBACK_IMAGE = '/demo-sample-ui.png';

export function ReportView({
  result,
  imageUrl,
  isDemo,
  showOwnerActions,
  analysisId,
  initialIsPublic,
}: ReportViewProps) {
  const t = useTranslations('Report');
  const tCommon = useTranslations('Common');
  const severityLabels: Record<Issue['severity'], string> = {
    critical: t('critical'),
    warning: t('warning'),
    suggestion: t('suggestion'),
  };
  const isDemoMode = Boolean(isDemo);
  const isPublicShare = Boolean(!showOwnerActions && !isDemo);

  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [expandedFix, setExpandedFix] = useState<string | null>(null);
  const [copiedFix, setCopiedFix] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(Boolean(initialIsPublic));
  const [sharing, setSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function handleShare() {
    if (!analysisId || sharing) return;
    setSharing(true);
    try {
      if (!isPublic) {
        const res = await fetch(`/api/analyses/${analysisId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic: true }),
        });
        if (!res.ok) return; // leave isPublic/copy state untouched on failure
        setIsPublic(true);
      }
      await navigator.clipboard.writeText(`${window.location.origin}/report/${analysisId}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  }

  const filteredIssues =
    activeFilter === 'all'
      ? result.issues
      : result.issues.filter((i) => i.category === activeFilter);

  const handleMarkerClick = (issueId: string) => {
    setActiveMarker(issueId);
    setActiveFilter('all');
    setDialogOpen(true);
    setTimeout(() => {
      document
        .getElementById(`issue-${issueId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    setTimeout(() => setActiveMarker(null), 2000);
  };

  const handleChipClick = (cat: string) => {
    setActiveFilter(cat);
    setDialogOpen(true);
  };

  const renderIssueCard = (issue: Issue, index: number) => (
    <div
      id={`issue-${issue.id}`}
      key={issue.id}
      style={{ animationDelay: `${200 + index * 120}ms` }}
      className={`rounded-xl border p-lg transition-all animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 ${
        activeMarker === issue.id
          ? 'border-accent-signal bg-accent-soft-bg'
          : 'border-border bg-surface hover:border-accent-signal/50'
      }`}
    >
      <div className="mb-md flex items-start justify-between">
        <span className={severityStyles[issue.severity]}>{severityLabels[issue.severity]}</span>
        <button
          onClick={() => setActiveMarker(issue.id)}
          className="text-text-secondary transition-colors hover:text-accent-signal"
          title={t('locateOnImage')}
        >
          <MapPin className="size-4" />
        </button>
      </div>
      <h3 className="mb-sm text-body-lg font-bold text-text-primary">{issue.title}</h3>
      <p className="text-body-md text-text-secondary">{issue.description}</p>
      <div className="mt-lg">
        <button
          onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
          className="text-label-md font-medium text-accent-signal hover:underline"
        >
          {expandedIssue === issue.id ? t('hideRecommendation') : t('showRecommendation')}
        </button>
        {expandedIssue === issue.id && (
          <div className="mt-md rounded-lg border-l-4 border-accent-signal bg-surface p-md">
            <p className="mb-1 text-label-md font-medium text-accent-signal">
              {t('recommendation')}:
            </p>
            <p className="text-body-md text-text-primary">{issue.recommendation}</p>
          </div>
        )}
      </div>
      {issue.code_fix && (
        <div className="mt-lg">
          <button
            onClick={() => setExpandedFix(expandedFix === issue.id ? null : issue.id)}
            className="text-label-md font-medium text-accent-signal hover:underline"
          >
            {expandedFix === issue.id ? t('hideFix') : t('viewFix')}
          </button>
          {expandedFix === issue.id && (
            <div className="mt-md space-y-md">
              {issue.code_fix.before && issue.code_fix.after && (
                <div className="flex items-center gap-lg">
                  <div className="flex items-center gap-md">
                    <span className="text-label-sm text-text-muted">{t('beforeLabel')}</span>
                    <div
                      className="size-8 rounded border border-border"
                      style={{ backgroundColor: issue.code_fix.before }}
                    />
                    <code className="text-label-sm text-text-secondary">
                      {issue.code_fix.before}
                    </code>
                  </div>
                  <span className="text-text-muted">&rarr;</span>
                  <div className="flex items-center gap-md">
                    <span className="text-label-sm text-text-muted">{t('afterLabel')}</span>
                    <div
                      className="size-8 rounded border border-border"
                      style={{ backgroundColor: issue.code_fix.after }}
                    />
                    <code className="text-label-sm text-accent-signal">{issue.code_fix.after}</code>
                  </div>
                </div>
              )}
              <div className="relative rounded-lg border border-border bg-bg-base p-md">
                <pre className="overflow-x-auto text-label-sm text-text-primary">
                  <code>{issue.code_fix.snippet}</code>
                </pre>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(issue.code_fix.snippet);
                    setCopiedFix(issue.id);
                    setTimeout(() => setCopiedFix(null), 2000);
                  }}
                  className="absolute top-md right-md rounded bg-surface px-2 py-1 text-label-sm text-text-secondary transition-colors hover:text-accent-signal"
                >
                  {copiedFix === issue.id ? (
                    <Check className="size-4 text-accent-signal" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col antialiased">
      {/* Main Split View */}
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-lg md:flex-row md:items-stretch">
        {/* Left: Screenshot + Annotations */}
        <section className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-xl shadow-2xl animate-in fade-in slide-in-from-left-6 duration-700 md:sticky md:top-24 md:w-[60%]">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent-signal/20 via-transparent to-transparent" />
          </div>

          {imageUrl ? (
            // Real screenshots are NOT forced into the 9:19.5 phone bezel:
            // markers are positioned by percentage against whichever box
            // wraps the image, so that box must match the image's own
            // aspect ratio exactly — any crop (object-cover) or letterbox
            // mismatch there would shift every marker off its real target.
            // A plain <img> with h-auto makes this wrapper size itself to
            // the image's natural rendered box, keeping the AI's x/y
            // percentages (computed against the full uncropped upload in
            // run-analysis.ts) aligned with what's on screen.
            // Plain <img>, not next/image: real screenshots come from
            // UploadThing's CDN, which isn't (and doesn't need to be)
            // registered in next.config.ts images.remotePatterns — same
            // pattern already used for real imageUrls in
            // ProjectsOverviewWidget.
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Analyzed screenshot"
                className="w-full rounded-2xl border-[6px] border-border shadow-2xl"
              />
              {filteredIssues.map((issue, index) => (
                <AnnotationMarker
                  key={issue.id}
                  number={index + 1}
                  x={issue.location.x}
                  y={issue.location.y}
                  onClick={() => handleMarkerClick(issue.id)}
                />
              ))}
            </div>
          ) : (
            <div
              className={`relative aspect-[9/19.5] overflow-hidden rounded-[3rem] border-[8px] border-border bg-surface shadow-2xl ring-1 ring-border/30 animate-float ${
                isDemoMode
                  ? 'w-full max-w-[320px] md:h-full md:max-h-[640px] md:w-auto'
                  : 'w-full max-w-[400px]'
              }`}
            >
              <Image src={FALLBACK_IMAGE} alt="Analyzed screenshot" fill className="object-cover" />
              {filteredIssues.map((issue, index) => (
                <AnnotationMarker
                  key={issue.id}
                  number={index + 1}
                  x={issue.location.x}
                  y={issue.location.y}
                  onClick={() => handleMarkerClick(issue.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right: Report Panel */}
        <aside className="flex w-full flex-col rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in slide-in-from-right-6 duration-700 md:w-[40%]">
          <div className="px-lg pt-xl pb-xxl">
            <div className="mb-xl flex flex-col items-center">
              <CircularGauge value={result.overall_score} />
              <h2 className="mt-md text-headline-md font-medium text-text-primary">
                {t('overallScore')}
              </h2>
              {(() => {
                const cmp = getClosestBenchmark(result.overall_score);
                if (!cmp) return null;
                const { benchmark, diff, isAbove } = cmp;
                const params = {
                  score: result.overall_score,
                  name: benchmark.name,
                  benchmarkScore: benchmark.score,
                  diff,
                };
                const text =
                  diff <= 2
                    ? t('benchmarkComparable', params)
                    : isAbove
                      ? t('benchmarkAhead', params)
                      : t('benchmarkBehind', params);
                return <p className="mt-2 text-label-sm text-text-muted">{text}</p>;
              })()}
            </div>

            <div className="mb-xl space-y-md">
              {Object.entries(result.category_scores).map(([key, value]) => (
                <CategoryScoreBar key={key} label={CATEGORY_LABELS[key] || key} value={value} />
              ))}
            </div>

            <div className="flex flex-wrap gap-sm">
              {['all', ...Object.keys(result.category_scores)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleChipClick(cat)}
                  className="rounded-full border border-border px-md py-1.5 text-label-sm text-text-secondary transition-colors hover:border-accent-signal/50 hover:bg-surface hover:text-accent-signal"
                >
                  {cat === 'all' ? t('all') : CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>

            <p className="mt-md text-label-sm text-text-muted">{t('tapCategoryHint')}</p>
          </div>

          {showOwnerActions && (
            <footer className="flex gap-md border-t border-border bg-surface p-lg">
              <Button
                variant="outline"
                className="h-11 flex-1 gap-sm rounded-md text-label-md font-semibold"
              >
                <Download className="size-4" />
                {t('exportPdf')}
              </Button>
              <Button
                onClick={handleShare}
                disabled={sharing || !analysisId}
                className="h-11 flex-1 gap-sm rounded-md text-label-md font-semibold"
              >
                {linkCopied ? (
                  <>
                    <Check className="size-4" />
                    {t('linkCopied')}
                  </>
                ) : isPublic ? (
                  <>
                    <Copy className="size-4" />
                    {t('copyLink')}
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    {sharing ? t('sharing') : t('shareReport')}
                  </>
                )}
              </Button>
            </footer>
          )}

          {isDemoMode && (
            <footer className="flex flex-col items-center gap-md border-t border-border bg-surface p-lg">
              <p className="text-label-md text-text-secondary">{t('sampleAnalysis')}</p>
              <Link
                href="/sign-up"
                className="rounded-md bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
              >
                {t('analyzeOwnDesign')}
              </Link>
            </footer>
          )}

          {isPublicShare && (
            <footer className="flex flex-col items-center gap-md border-t border-border bg-surface p-lg">
              <p className="text-label-sm text-text-muted">
                {t('madeWithPrefix')}{' '}
                <Link href="/" className="text-accent-signal hover:underline">
                  poisik
                </Link>
              </p>
              <Link
                href="/projects/new-analysis"
                className="text-label-md font-medium text-accent-signal hover:underline"
              >
                {tCommon('duplicateAnalysis')}
              </Link>
            </footer>
          )}
        </aside>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeFilter === 'all'
                ? t('allIssuesTitle')
                : CATEGORY_LABELS[activeFilter] || activeFilter}
            </DialogTitle>
            <DialogDescription>
              {t('issuesFoundInCategory', { count: filteredIssues.length })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-lg">
            {filteredIssues.length === 0 ? (
              <p className="py-lg text-center text-body-md text-text-secondary">
                {t('noIssuesInCategory')}
              </p>
            ) : (
              filteredIssues.map((issue, index) => renderIssueCard(issue, index))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
