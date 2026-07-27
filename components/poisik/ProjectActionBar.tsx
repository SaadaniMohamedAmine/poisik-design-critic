import { Plus, GitCompare, FolderOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ProjectActionBarProps {
  projectId: string;
  projectName: string;
  showCompare: boolean;
}

// Sticky (not fixed-to-viewport) action bar — replaces the earlier fixed
// bottom bar attempt. `top-20` docks it right below TopBarAuth's fixed
// height once scrolled to, so New Analysis/Compare and the active project
// name stay reachable while scrolling through a long analyses list, without
// behaving like a mobile app's bottom tab bar or breaking the app's
// consistent "content lives in padded, rounded cards" layout.
export function ProjectActionBar({ projectId, projectName, showCompare }: ProjectActionBarProps) {
  return (
    <div className="sticky top-20 z-30 flex flex-col gap-md rounded-xl border border-border bg-bg-elevated/95 p-md shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-sm text-text-secondary">
        <FolderOpen className="size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
        <span className="truncate text-label-md">
          Active project: <span className="font-bold text-text-primary">{projectName}</span>
        </span>
      </div>
      <div className="flex gap-sm">
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
  );
}
