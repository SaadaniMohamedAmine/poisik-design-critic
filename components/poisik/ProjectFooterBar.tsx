import { Plus, GitCompare } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ProjectFooterBarProps {
  projectId: string;
  projectName: string;
  showCompare: boolean;
}

// Per design_v2/project_alpha_details: a fixed bottom action bar instead of
// putting New Analysis/Compare in the header. Same offset technique as
// TopBarAuth (lg:ml-64 to clear the fixed sidebar, then center within
// max-w-7xl) so it lines up with the rest of the page's content column.
export function ProjectFooterBar({ projectId, projectName, showCompare }: ProjectFooterBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 z-40 flex h-20 w-full items-center border-t border-border bg-bg-elevated">
      <div className="flex-1 px-md lg:ml-64 lg:px-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-md">
          <p className="hidden text-label-sm text-text-secondary sm:block">
            Active project: <span className="text-text-primary">{projectName}</span>
          </p>
          <div className="flex w-full gap-sm sm:w-auto">
            {showCompare && (
              <Link
                href={`/projects/${projectId}/compare`}
                className="flex flex-1 items-center justify-center gap-sm rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover sm:flex-none"
              >
                <GitCompare className="size-4" strokeWidth={1.5} />
                Compare
              </Link>
            )}
            <Link
              href={`/projects/${projectId}/analyze`}
              className="flex flex-1 items-center justify-center gap-sm rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 sm:flex-none"
            >
              <Plus className="size-4" strokeWidth={2} />
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
