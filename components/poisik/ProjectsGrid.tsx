'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useFormatter } from 'next-intl';
import { Search, FolderOpen, Clock, BarChart3, PlusCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { CreateProjectForm } from './CreateProjectForm';

export interface ProjectGridItem {
  id: string;
  name: string;
  updatedAt: string;
  imageUrl: string | undefined;
  score: number | undefined;
  analysisCount: number;
}

// Design reference: design_v2/all_projects (Stitch mockup). Kept the layout
// (search bar, aspect-video card, score badge, "add new" tile as a grid
// item rather than a header button) but adapted the content to what's
// actually real here: Poisik has no team/collaborator concept, so the
// mockup's avatar-stack row is replaced with the real analysis count; the
// score badge stays a single accent hue rather than the mockup's red/amber/
// blue score bands, per the monochrome brand rule used everywhere else in
// the app; and there's no kebab/"more" menu since there's no per-project
// action wired up yet — a decorative button that does nothing would be
// worse than not having one.
export function ProjectsGrid({ projects }: { projects: ProjectGridItem[] }) {
  const t = useTranslations('Projects');
  const format = useFormatter();
  const [query, setQuery] = useState('');
  // The sidebar's "New project" quick action links here with ?new=true so
  // it actually opens the create form instead of just landing on a page
  // where the user has to find and click the tile themselves.
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(searchParams.get('new') === 'true');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <div>
      <div className="mb-xl flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-md">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
            <FolderOpen className="size-5 text-accent-signal" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-text-primary">{t('title')}</h1>
            <p className="mt-xs text-body-md text-text-secondary">{t('subtitle')}</p>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="relative w-full md:w-64">
            <Search
              className="absolute top-1/2 left-md size-4 -translate-y-1/2 text-text-muted"
              strokeWidth={1.5}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-full border border-border bg-surface py-sm pr-lg pl-xl text-label-md text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-signal focus:outline-none"
            />
          </div>
        )}
      </div>

      {query && filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border border-border bg-surface py-xxl text-center">
          <Search className="size-6 text-text-muted" strokeWidth={1.5} />
          <p className="text-body-md text-text-secondary">{t('noMatch', { query })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col rounded-xl border border-border bg-surface p-lg transition-all hover:border-accent-signal/50 hover:bg-surface-hover"
            >
              <div className="relative mb-md aspect-video w-full overflow-hidden rounded-lg border border-border bg-bg-elevated">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset
                  <img
                    src={project.imageUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <FolderOpen className="size-8 text-text-muted" strokeWidth={1.5} />
                  </div>
                )}
                {project.score !== undefined && (
                  <div className="absolute top-md right-md rounded border border-border bg-bg-base/80 px-sm py-xs backdrop-blur-md">
                    <span className="text-label-sm font-bold text-accent-signal">
                      {project.score}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mb-sm truncate text-headline-sm font-bold text-text-primary">
                {project.name}
              </h3>

              <div className="mt-auto flex items-center justify-between gap-sm">
                <div className="flex min-w-0 items-center gap-xs text-text-secondary">
                  <Clock className="size-3.5 shrink-0" strokeWidth={1.5} />
                  <span className="truncate text-label-sm">
                    {t('updated', { time: format.relativeTime(new Date(project.updatedAt)) })}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-xs text-text-secondary">
                  <BarChart3 className="size-3.5" strokeWidth={1.5} />
                  <span className="text-label-sm">
                    {t('analysesCount', { count: project.analysisCount })}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {!query &&
            (creating ? (
              <div className="rounded-xl border border-border bg-surface p-lg">
                <CreateProjectForm />
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="group flex min-h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-lg text-center transition-colors hover:border-accent-signal/50 hover:bg-surface-hover"
              >
                <div className="mb-md flex size-14 items-center justify-center rounded-full bg-bg-elevated transition-transform group-hover:scale-110">
                  <PlusCircle className="size-6 text-accent-signal" strokeWidth={1.5} />
                </div>
                <span className="text-body-lg font-bold text-text-primary">
                  {t('startNewProject')}
                </span>
                <p className="mt-xs text-label-sm text-text-muted">{t('startNewProjectDesc')}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
