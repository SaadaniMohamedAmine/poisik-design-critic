import { Link } from '@/i18n/navigation';

interface ProjectOverviewItem {
  id: string;
  name: string;
  score: number | undefined;
}

export function ProjectsOverviewWidget({ projects }: { projects: ProjectOverviewItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <div className="mb-md flex items-center justify-between">
        <p className="text-label-sm text-text-secondary">Projects</p>
        <Link href="/projects" className="text-label-sm text-accent-signal hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-1">
        {projects.slice(0, 4).map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-body-md transition-colors hover:bg-surface-hover"
            >
              <span className="text-text-primary">{p.name}</span>
              <span className="text-accent-signal">{p.score ?? '—'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
