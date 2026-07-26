import { ArrowRight, FolderOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ProjectOverviewItem {
  id: string;
  name: string;
  score: number | undefined;
  analysisCount: number;
  imageUrl: string | undefined;
}

export function ProjectsOverviewWidget({ projects }: { projects: ProjectOverviewItem[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-bg-elevated p-lg">
        <h3 className="text-headline-sm font-bold text-text-primary">Top projects</h3>
        <Link
          href="/projects"
          className="flex items-center gap-xs text-label-sm text-accent-signal hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-sm p-xl text-center">
          <FolderOpen className="size-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">No projects yet</p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-md p-lg content-start">
          {projects.slice(0, 4).map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group flex items-center rounded-xl border border-border bg-bg-elevated p-md transition-all hover:border-accent-signal/50"
            >
              <div className="mr-md h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset
                  <img src={p.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <FolderOpen className="size-5 text-text-muted" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="truncate text-label-md font-bold text-text-primary">{p.name}</h5>
                <p className="text-label-sm text-text-secondary">
                  {p.analysisCount} {p.analysisCount === 1 ? 'analysis' : 'analyses'}
                </p>
              </div>
              <div className="shrink-0 text-label-md font-bold text-accent-signal">
                {p.score ?? '—'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
