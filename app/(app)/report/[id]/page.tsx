'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Share2, MapPin } from 'lucide-react';
import { PoisikLogo, CircularGauge, AnnotationMarker, CategoryScoreBar } from '@/components/poisik';

import { Button } from '@/components/ui/button';
import type { AnalysisResult } from '@/lib/schemas';

const MOCK_RESULT: AnalysisResult = {
  overall_score: 84,
  category_scores: {
    visual_hierarchy: 90,
    contrast: 65,
    spacing: 78,
    typography: 82,
    accessibility: 70,
    consistency: 95,
  },
  issues: [
    {
      id: '1',
      category: 'contrast',
      severity: 'critical',
      title: 'Low Contrast Ratio',
      description: 'The primary CTA text #87a1c5 on #121a27 fails WCAG AA contrast standards.',
      recommendation: 'Increase brightness to #e3e9f2 for better legibility and WCAG compliance.',
      location: { x: 50, y: 8 },
    },
    {
      id: '2',
      category: 'spacing',
      severity: 'warning',
      title: 'Cramped Button Padding',
      description:
        "The 'Submit' button has insufficient internal spacing, leading to a low tap target quality for mobile users.",
      recommendation: 'Add minimum 16px horizontal and 12px vertical padding.',
      location: { x: 25, y: 35 },
    },
    {
      id: '3',
      category: 'consistency',
      severity: 'suggestion',
      title: 'Inconsistent Icon Weights',
      description:
        'Icons in the navigation bar use varying stroke widths, breaking visual consistency.',
      recommendation: 'Standardize all icons to a 1.5px stroke weight across the interface.',
      location: { x: 20, y: 15 },
    },
  ],
  palette: ['#0a0f16', '#6294da', '#87a1c5', '#121a27'],
};

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

export default function ReportPage() {
  const params = useParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const result = MOCK_RESULT;

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

  const handleLocateClick = (issueId: string) => {
    setActiveMarker(issueId);
    setTimeout(() => setActiveMarker(null), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary antialiased">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-surface px-margin">
        <div className="flex items-center gap-xl">
          <PoisikLogo size="md" />
          <div className="hidden items-center gap-lg md:flex">
            <a
              href="#"
              className="border-b-2 border-accent-signal pb-1 text-label-md font-medium text-accent-signal"
            >
              Analyze
            </a>
            <a
              href="#"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              History
            </a>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <span className="rounded-full border border-border px-md py-1 text-label-sm font-semibold uppercase tracking-wider text-text-secondary">
            Free Plan
          </span>
        </div>
      </nav>

      {/* Main Split View */}
      <main className="flex h-[calc(100vh-80px)] w-full max-w-[1280px] mx-auto overflow-hidden">
        {/* Left: Screenshot + Annotations (60%) */}
        <section className="relative flex w-[60%] items-center justify-center overflow-hidden bg-surface p-xl">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent-signal/20 via-transparent to-transparent" />
          </div>

          {/* Screenshot mockup */}
          <div className="relative aspect-[9/19.5] w-full max-w-[400px] overflow-hidden rounded-[3rem] border-[8px] border-border bg-surface shadow-2xl ring-1 ring-border/30">
            <div className="absolute inset-0 flex items-center justify-center bg-surface text-text-muted">
              <p className="text-label-md">UI screenshot preview</p>
            </div>

            {/* Annotation Markers */}
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

          {/* Floating AI badge */}
          <div className="absolute bottom-lg left-lg flex items-center gap-md rounded-xl border border-border bg-surface/70 px-lg py-md backdrop-blur-lg">
            <span className="text-label-md text-accent-signal">
              AI Audit Active: Analysis {result.overall_score}% Complete
            </span>
          </div>
        </section>

        {/* Right: Report Panel (40%) */}
        <aside className="flex w-[40%] flex-col border-l border-border bg-surface">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-lg pt-xl pb-xxl">
            {/* Score Header */}
            <div className="mb-xl flex flex-col items-center">
              <CircularGauge value={result.overall_score} />
              <h2 className="mt-md text-headline-md font-medium text-text-primary">
                Overall Design Score
              </h2>
            </div>

            {/* Category Score Bars */}
            <div className="mb-xl space-y-md">
              {Object.entries(result.category_scores).map(([key, value]) => (
                <CategoryScoreBar key={key} label={CATEGORY_LABELS[key] || key} value={value} />
              ))}
            </div>

            {/* Filter Chips */}
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

            {/* Issue List */}
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
                      onClick={() => handleLocateClick(issue.id)}
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
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Footer */}
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
        </aside>
      </main>
    </div>
  );
}
