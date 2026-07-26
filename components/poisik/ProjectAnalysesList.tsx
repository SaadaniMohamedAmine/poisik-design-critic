import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export interface ProjectAnalysisItem {
  id: string;
  index: number; // 1-based, oldest = 1
  score: number | undefined;
  imageUrl: string;
  createdAt: Date;
}

// Same monochrome score-tier logic as RecentActivityWidget's scoreBadgeClass
// — kept identical so the same score reads the same way everywhere in the
// app, not just visually similar.
function scoreBadgeClass(score: number | undefined) {
  if (score === undefined) return 'border-border bg-bg-elevated text-text-muted';
  if (score >= 85) return 'border-accent-signal/20 bg-accent-soft-bg text-accent-signal';
  if (score >= 60) return 'border-border bg-bg-elevated text-text-secondary';
  return 'border-border bg-bg-elevated text-text-muted';
}

// No per-analysis title exists in the data model (the AI doesn't name
// audits), and no "scan type" like the design_v2 mockup's "Full System
// Scan"/"A/B Variant Analysis" — inventing either would be fake data, so
// each row is labeled "Audit #N" (chronological) + the real timestamp
// instead.
export function ProjectAnalysesList({ analyses }: { analyses: ProjectAnalysisItem[] }) {
  return (
    <div className="space-y-sm">
      {analyses.map((a) => (
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
              Audit #{a.index}
            </h4>
            <p className="text-label-sm text-text-secondary">
              {a.createdAt.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-lg">
            <div className="hidden flex-col items-end gap-xs sm:flex">
              <span className="text-label-sm text-text-secondary">
                Score {a.score ?? '—'}
                {a.score !== undefined && <span className="text-text-muted">/100</span>}
              </span>
              {a.score !== undefined && (
                <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full bg-accent-signal"
                    style={{ width: `${Math.max(4, a.score)}%` }}
                  />
                </div>
              )}
            </div>
            <span
              className={`rounded-full border px-md py-1 text-label-sm font-bold ${scoreBadgeClass(a.score)}`}
            >
              {a.score ?? '—'}
            </span>
            <ArrowRight
              className="hidden size-4 text-text-muted transition-colors group-hover:text-accent-signal sm:block"
              strokeWidth={1.5}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
