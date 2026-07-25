import { Link } from '@/i18n/navigation';

interface RecentActivityItem {
  id: string;
  projectName: string;
  score: number | undefined;
}

export function RecentActivityWidget({ analyses }: { analyses: RecentActivityItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <p className="mb-md text-label-sm text-text-secondary">Recent activity</p>
      <ul className="space-y-1">
        {analyses.map((a) => (
          <li key={a.id}>
            <Link
              href={`/report/${a.id}`}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-body-md transition-colors hover:bg-surface-hover"
            >
              <span className="text-text-primary">{a.projectName}</span>
              <span className="text-accent-signal">{a.score ?? '—'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
