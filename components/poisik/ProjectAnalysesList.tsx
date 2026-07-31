import { getTranslations, getFormatter } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export interface ProjectAnalysisItem {
  id: string;
  index: number; // 1-based, oldest = 1
  score: number | undefined;
  issuesCount: number;
  imageUrl: string;
  createdAt: Date;
}

// Per explicit request: match design_v2/project_alpha_details's colored
// PASSED/FAIL/WARNING status exactly, rather than the monochrome score
// tiers used elsewhere in the app (RecentActivityWidget, dashboard). Colors
// are real hex values lifted straight from the mockup's own Material theme
// (tertiary #f3bf4f, error #ffb4ab) since neither exists as a design token
// here — this is a deliberate, scoped exception for this page only.
function statusOf(score: number | undefined, t: (key: string) => string) {
  if (score === undefined) {
    return {
      label: '—',
      badgeClass: 'border-border bg-bg-elevated text-text-muted',
      barClass: 'bg-text-muted',
    };
  }
  if (score >= 80) {
    return {
      label: t('statusPassed'),
      badgeClass: 'border-accent-signal/20 bg-accent-soft-bg text-accent-signal',
      barClass: 'bg-accent-signal',
    };
  }
  if (score >= 60) {
    return {
      label: t('statusWarning'),
      badgeClass: 'border-[#f3bf4f]/20 bg-[#f3bf4f]/10 text-[#f3bf4f]',
      barClass: 'bg-[#f3bf4f]',
    };
  }
  return {
    label: t('statusFail'),
    badgeClass: 'border-[#ffb4ab]/20 bg-[#ffb4ab]/10 text-[#ffb4ab]',
    barClass: 'bg-[#ffb4ab]',
  };
}

// No per-analysis title exists in the data model (the AI doesn't name
// audits), and no "scan type" like the mockup's "Full System Scan"/"A/B
// Variant Analysis" — inventing either would be fake data, so each row is
// labeled "Audit #N" (chronological) + the real timestamp and real issue
// count instead.
export async function ProjectAnalysesList({ analyses }: { analyses: ProjectAnalysisItem[] }) {
  const t = await getTranslations('ProjectAnalysesList');
  const format = await getFormatter();

  return (
    <div className="space-y-sm">
      {analyses.map((a) => {
        const status = statusOf(a.score, t);
        return (
          <Link
            key={a.id}
            href={`/report/${a.id}`}
            className="group flex items-center gap-lg rounded-xl border border-border bg-surface p-md transition-all hover:border-accent-signal/30 hover:bg-surface-hover"
          >
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
              <img src={a.imageUrl} alt="" className="size-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-body-lg font-bold text-text-primary">
                {t('audit', { index: a.index })}
              </h4>
              <p className="text-label-sm text-text-secondary">
                {format.dateTime(a.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                {' · '}
                {t('issuesFlagged', { count: a.issuesCount })}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-lg">
              <div className="hidden flex-col items-end gap-xs sm:flex">
                <span className="text-label-sm text-text-secondary">
                  {t('score', { score: a.score ?? '—' })}
                  {a.score !== undefined && <span className="text-text-muted">/100</span>}
                </span>
                {a.score !== undefined && (
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-elevated">
                    <div
                      className={`h-full ${status.barClass}`}
                      style={{ width: `${Math.max(4, a.score)}%` }}
                    />
                  </div>
                )}
              </div>
              <span
                className={`rounded-full border px-md py-1 text-label-sm font-bold ${status.badgeClass}`}
              >
                {status.label}
              </span>
              <ArrowRight
                className="hidden size-4 text-text-muted transition-colors group-hover:text-accent-signal sm:block"
                strokeWidth={1.5}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
