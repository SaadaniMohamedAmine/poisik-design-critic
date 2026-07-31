import { getTranslations } from 'next-intl/server';
import { Activity } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface RecentActivityItem {
  id: string;
  projectId: string;
  projectName: string;
  imageUrl: string;
  score: number | undefined;
  createdAt: Date;
}

function scoreBadgeClass(score: number | undefined) {
  if (score === undefined) return 'border-border bg-bg-elevated text-text-muted';
  if (score >= 85) return 'border-accent-signal/20 bg-accent-soft-bg text-accent-signal';
  if (score >= 60) return 'border-border bg-bg-elevated text-text-secondary';
  return 'border-border bg-bg-elevated text-text-muted';
}

export async function RecentActivityWidget({ analyses }: { analyses: RecentActivityItem[] }) {
  const t = await getTranslations('RecentActivityWidget');

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-bg-elevated p-lg">
        <h3 className="text-headline-sm font-bold text-text-primary">{t('title')}</h3>
      </div>

      {analyses.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-sm p-xl text-center">
          <Activity className="size-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">{t('empty')}</p>
          <p className="text-label-sm text-text-muted">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/report/${a.id}`}
              className="group flex items-center justify-between gap-md p-lg transition-colors hover:bg-surface-hover"
            >
              <div className="flex min-w-0 items-center gap-md">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-elevated">
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset */}
                  <img src={a.imageUrl} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-label-md font-medium text-text-primary transition-colors group-hover:text-accent-signal">
                    {a.projectName}
                  </h4>
                  <p className="text-label-sm text-text-secondary">{t('designAudit')}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-lg">
                <p className="hidden text-label-sm text-text-secondary sm:block">
                  {a.createdAt.toLocaleDateString()}
                </p>
                <span
                  className={`rounded-full border px-md py-1 text-label-sm font-bold ${scoreBadgeClass(a.score)}`}
                >
                  {a.score ?? '—'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
