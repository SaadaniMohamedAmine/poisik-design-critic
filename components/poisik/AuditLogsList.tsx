import { ArrowRight, FolderKanban } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export interface AuditLogItem {
  id: string;
  projectId: string;
  projectName: string;
  score: number | undefined;
  issuesCount: number;
  imageUrl: string;
  createdAt: Date;
}

// Same PASSED/WARNING/FAIL color convention as ProjectAnalysesList (the
// Project Detail page) — this is the same underlying data, just flattened
// across every project instead of scoped to one, so it keeps the same
// visual language rather than inventing a second status scheme.
function statusOf(score: number | undefined) {
  if (score === undefined) {
    return { label: '—', badgeClass: 'border-border bg-bg-elevated text-text-muted' };
  }
  if (score >= 80) {
    return {
      label: 'PASSED',
      badgeClass: 'border-accent-signal/20 bg-accent-soft-bg text-accent-signal',
    };
  }
  if (score >= 60) {
    return {
      label: 'WARNING',
      badgeClass: 'border-[#f3bf4f]/20 bg-[#f3bf4f]/10 text-[#f3bf4f]',
    };
  }
  return {
    label: 'FAIL',
    badgeClass: 'border-[#ffb4ab]/20 bg-[#ffb4ab]/10 text-[#ffb4ab]',
  };
}

// Renders the global, cross-project analysis history. Each row links to its
// full report, exactly like a per-project analyses list, but with the
// project name surfaced up front (via a small badge line) since rows here
// aren't already scoped to one project's page.
export function AuditLogsList({ items }: { items: AuditLogItem[] }) {
  return (
    <div className="space-y-sm">
      {items.map((item) => {
        const status = statusOf(item.score);
        return (
          <Link
            key={item.id}
            href={`/report/${item.id}`}
            className="group flex items-center gap-lg rounded-xl border border-border bg-surface p-md transition-all hover:border-accent-signal/30 hover:bg-surface-hover"
          >
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
              <img src={item.imageUrl} alt="" className="size-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs text-label-sm font-semibold text-accent-signal">
                <FolderKanban className="size-3.5 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.projectName}</span>
              </div>
              <p className="mt-0.5 truncate text-label-sm text-text-secondary">
                {item.createdAt.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {' · '}
                {item.issuesCount} issue{item.issuesCount === 1 ? '' : 's'} flagged
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-lg">
              <span className="hidden text-label-sm text-text-secondary sm:block">
                Score {item.score ?? '—'}
                {item.score !== undefined && <span className="text-text-muted">/100</span>}
              </span>
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
