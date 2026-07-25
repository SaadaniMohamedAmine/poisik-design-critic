'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Share2, MapPin, Copy, Check } from 'lucide-react';
import { PoisikLogo, CircularGauge, AnnotationMarker, CategoryScoreBar } from '@/components/poisik';
import { getClosestBenchmark } from '@/lib/benchmarks';
import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/lib/schemas';

interface ReportViewProps {
  result: AnalysisResult;
  isReadOnly?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  visual_hierarchy: 'Visual Hierarchy',
  contrast: 'Contrast',
  spacing: 'Spacing',
  typography: 'Typography',
  accessibility: 'Accessibility',
  consistency: 'Consistency',
};

const severityStyles = {
  critical:
    'bg-accent-signal text-white font-bold uppercase tracking-wide px-3 py-1 rounded-full text-xs',
  warning:
    'bg-accent-signal/40 text-text-primary font-semibold uppercase tracking-wide px-3 py-1 rounded-full text-xs',
  suggestion:
    'border border-border-strong text-text-muted font-medium uppercase tracking-wide px-3 py-1 rounded-full text-xs',
};

export function ReportView({ result, isReadOnly }: ReportViewProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [expandedFix, setExpandedFix] = useState<string | null>(null);
  const [copiedFix, setCopiedFix] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const filteredIssues =
    activeFilter === 'all'
      ? result.issues
      : result.issues.filter((i) => i.category === activeFilter);

  const handleMarkerClick = (issueId: string) => {
    setActiveMarker(issueId);
    const el = document.getElementById(`issue-${issueId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setActiveMarker(null), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col antialiased">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-surface px-margin">
        <div className="flex items-center gap-xl">
          <PoisikLogo size="md" />
          <div className="hidden items-center gap-lg md:flex">
            <Link
              href="/projects/new-analysis"
              className="border-b-2 border-accent-signal pb-1 text-label-md font-medium text-accent-signal"
            >
              Analyze
            </Link>
            <Link
              href="/projects"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              Projects
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <span className="rounded-full border border-border px-md py-1 text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
            Free Plan
          </span>
        </div>
      </nav>

      {/* Main Split View */}
      <main className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-[1280px] overflow-hidden">
        {/* Left: Screenshot + Annotations */}
        <section className="relative flex w-[60%] items-center justify-center overflow-hidden bg-surface p-xl">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent-signal/20 via-transparent to-transparent" />
          </div>

          <div className="relative aspect-[9/19.5] w-full max-w-[400px] overflow-hidden rounded-[3rem] border-[8px] border-border bg-surface shadow-2xl ring-1 ring-border/30">
            <div className="absolute inset-0 flex items-center justify-center bg-surface text-text-muted">
              <p className="text-label-md">UI screenshot preview</p>
            </div>
            {filteredIssues.map((issue) => (
              <AnnotationMarker
                key={issue.id}
                number={parseInt(issue.id)}
                x={issue.location.x}
                y={issue.location.y}
                onClick={() => handleMarkerClick(issue.id)}
              />
            ))}
          </div>

          <div className="absolute bottom-lg left-lg flex items-center gap-md rounded-xl border border-border bg-surface/70 px-lg py-md backdrop-blur-lg">
            <span className="text-label-md text-accent-signal">
              AI Audit Active: Analysis {result.overall_score}% Complete
            </span>
          </div>
        </section>

        {/* Right: Report Panel */}
        <aside className="flex w-[40%] flex-col border-l border-border bg-surface">
          <div className="flex-1 overflow-y-auto px-lg pt-xl pb-xxl">
            <div className="mb-xl flex flex-col items-center">
              <CircularGauge value={result.overall_score} />
              <h2 className="mt-md text-headline-md font-medium text-text-primary">
                Overall Design Score
              </h2>
              {(() => {
                const cmp = getClosestBenchmark(result.overall_score);
                if (!cmp) return null;
                const { benchmark, diff, isAbove } = cmp;
                let text = '';
                if (diff <= 2) {
                  text = `${result.overall_score} — comparable to ${benchmark.name} (${benchmark.score})`;
                } else if (isAbove) {
                  text = `${result.overall_score} — ahead of ${benchmark.name} (${benchmark.score}) by ${diff} pts`;
                } else {
                  text = `${result.overall_score} — ${benchmark.name} (${benchmark.score}) is ${diff} pts ahead`;
                }
                return <p className="mt-2 text-label-sm text-text-muted">{text}</p>;
              })()}
            </div>

            <div className="mb-xl space-y-md">
              {Object.entries(result.category_scores).map(([key, value]) => (
                <CategoryScoreBar key={key} label={CATEGORY_LABELS[key] || key} value={value} />
              ))}
            </div>

            <div className="mb-lg flex flex-wrap gap-sm">
              {['all', ...Object.keys(result.category_scores)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`rounded-full border px-md py-1.5 text-label-sm transition-colors ${
                    activeFilter === cat
                      ? 'border-accent-signal bg-accent-soft-bg text-accent-signal'
                      : 'border-border text-text-secondary hover:bg-surface'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>

            <div className="space-y-lg">
              {filteredIssues.map((issue) => (
                <div
                  id={`issue-${issue.id}`}
                  key={issue.id}
                  className={`rounded-xl border p-lg transition-all ${
                    activeMarker === issue.id
                      ? 'border-accent-signal bg-accent-soft-bg'
                      : 'border-border bg-surface hover:border-accent-signal/50'
                  }`}
                >
                  <div className="mb-md flex items-start justify-between">
                    <span className={severityStyles[issue.severity]}>{issue.severity}</span>
                    <button
                      onClick={() => setActiveMarker(issue.id)}
                      className="text-text-secondary transition-colors hover:text-accent-signal"
                      title="Locate on image"
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
                      {expandedIssue === issue.id ? 'Hide recommendation' : 'Show recommendation'}
                    </button>
                    {expandedIssue === issue.id && (
                      <div className="mt-md rounded-lg border-l-4 border-accent-signal bg-surface p-md">
                        <p className="mb-1 text-label-md font-medium text-accent-signal">
                          Recommendation:
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
                        {expandedFix === issue.id ? 'Hide fix' : 'View fix'}
                      </button>
                      {expandedFix === issue.id && (
                        <div className="mt-md space-y-md">
                          {issue.code_fix.before && issue.code_fix.after && (
                            <div className="flex items-center gap-lg">
                              <div className="flex items-center gap-md">
                                <span className="text-label-sm text-text-muted">Before</span>
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
                                <span className="text-label-sm text-text-muted">After</span>
                                <div
                                  className="size-8 rounded border border-border"
                                  style={{ backgroundColor: issue.code_fix.after }}
                                />
                                <code className="text-label-sm text-accent-signal">
                                  {issue.code_fix.after}
                                </code>
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
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <footer className="flex gap-md border-t border-border bg-surface p-lg">
              <Button variant="outline" className="flex flex-1 items-center justify-center gap-sm">
                <Download className="size-4" />
                Export PDF
              </Button>
              <Button className="flex flex-1 items-center justify-center gap-sm">
                <Share2 className="size-4" />
                Share Report
              </Button>
            </footer>
          )}

          {isReadOnly && (
            <footer className="flex flex-col items-center gap-md border-t border-border bg-surface p-lg">
              <p className="text-label-sm text-text-muted">
                Made with{' '}
                <Link href="/" className="text-accent-signal hover:underline">
                  Poisik
                </Link>
              </p>
              <Link
                href="/projects/new-analysis"
                className="text-label-md font-medium text-accent-signal hover:underline"
              >
                Duplicate this analysis
              </Link>
            </footer>
          )}
        </aside>
      </main>
    </div>
  );
}
