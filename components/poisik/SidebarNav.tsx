'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  History,
  BookOpen,
  Settings,
  ChevronDown,
  FileText,
  LifeBuoy,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { GettingStartedPill } from './GettingStartedPill';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: undefined },
  { href: '/audit-logs', label: 'Audit Logs', icon: History, id: undefined },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, id: undefined },
  { href: '/settings', label: 'Settings', icon: Settings, id: undefined },
] as const;

interface Project {
  id: string;
  name: string;
}

interface SidebarNavProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
  projects: Project[];
  onNavigate?: () => void;
}

// The shared nav content rendered both inside the desktop Sidebar (fixed
// left column, lg+) and the mobile drawer (TopBarAuth's burger menu, below
// lg) — one definition so the two surfaces can't drift apart.
export function SidebarNav({ usage, projects, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  // Redirect straight to /pricing instead of letting the user walk through
  // project selection only to hit the 402 at the very last step — the API
  // route still enforces this server-side regardless, this is just sparing
  // a dead-end click.
  const isAtLimit = usage.limit !== null && usage.remaining === 0;

  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (projectsRef.current && !projectsRef.current.contains(e.target as Node)) {
        setProjectsOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // /projects/new-analysis and /projects/new-analysis (etc.) aren't project
  // ids — only treat the segment after /projects/ as one when it's not a
  // known non-project route under that prefix.
  const projectSegmentMatch = pathname.match(/^\/projects\/([^/]+)/);
  const currentProjectId =
    projectSegmentMatch && projectSegmentMatch[1] !== 'new-analysis'
      ? projectSegmentMatch[1]
      : undefined;
  const currentProject = projects.find((p) => p.id === currentProjectId);
  const projectsActive = pathname.startsWith('/projects');

  function handleNavigate() {
    setProjectsOpen(false);
    onNavigate?.();
  }

  return (
    <>
      <div>
        {/* The old full-width "New Analysis" button used to sit here — it's
            now the floating SpeedDial (bottom-right FAB, mounted once in
            AppShellChrome), so the nav list starts right at the top. */}
        <nav className="space-y-xs">
          <Link
            href="/dashboard"
            onClick={handleNavigate}
            className={`flex items-center gap-md rounded-xl px-md py-md text-label-md transition-colors ${
              pathname.startsWith('/dashboard')
                ? 'bg-accent-soft-bg text-text-primary'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <LayoutDashboard className="size-4" strokeWidth={1.5} />
            Dashboard
          </Link>

          {/* Projects: not a plain link — toggles a dropdown ("All
              projects" + each project) instead of navigating on its own
              click. The currently active project (derived from the URL, not
              stored state) shows as a small muted line under the label so
              it stays visible even while the dropdown is closed. */}
          <div ref={projectsRef}>
            <button
              id="tour-projects-nav"
              onClick={() => setProjectsOpen((prev) => !prev)}
              aria-expanded={projectsOpen}
              className={`flex w-full items-center gap-md rounded-xl px-md py-md text-left text-label-md transition-colors ${
                projectsActive
                  ? 'bg-accent-soft-bg text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <FolderKanban className="size-4 shrink-0" strokeWidth={1.5} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">Projects</span>
                {currentProject && (
                  <span className="block truncate text-label-sm text-text-muted">
                    {currentProject.name}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`size-3.5 shrink-0 transition-transform ${projectsOpen ? 'rotate-180' : ''}`}
                strokeWidth={1.5}
              />
            </button>

            {projectsOpen && (
              <div className="mt-xs ml-lg space-y-xs border-l border-border pl-md">
                <Link
                  href="/projects"
                  onClick={handleNavigate}
                  className={`block truncate rounded-lg px-sm py-xs text-label-sm transition-colors ${
                    pathname === '/projects'
                      ? 'text-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All projects
                </Link>
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    onClick={handleNavigate}
                    className={`block truncate rounded-lg px-sm py-xs text-label-sm transition-colors ${
                      project.id === currentProjectId
                        ? 'text-text-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {project.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.slice(1).map(({ href, label, icon: Icon, id }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                id={id}
                href={href}
                onClick={handleNavigate}
                className={`flex items-center gap-md rounded-xl px-md py-md text-label-md transition-colors ${
                  active
                    ? 'bg-accent-soft-bg text-text-primary'
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <GettingStartedPill />
        <Link
          id="tour-plan-usage"
          href="/settings"
          onClick={handleNavigate}
          className={`block rounded-xl border p-md transition-colors ${
            isAtLimit
              ? 'border-accent-signal/50 bg-accent-soft-bg'
              : 'border-border hover:bg-surface-hover'
          }`}
        >
          <p className="mb-xs text-label-sm text-text-secondary">{usage.plan} plan</p>
          <p className="mb-sm text-label-md text-text-primary">
            {usage.limit === null
              ? 'Unlimited analyses'
              : `${usage.remaining} of ${usage.limit} analyses left`}
          </p>
          {usage.limit !== null && (
            <div className="h-1.5 overflow-hidden rounded-full bg-border-strong">
              <div
                className="h-full bg-accent-signal"
                style={{
                  width: `${Math.max(0, ((usage.limit - (usage.remaining ?? 0)) / usage.limit) * 100)}%`,
                }}
              />
            </div>
          )}
        </Link>

        <div className="mt-lg space-y-xs border-t border-border pt-md">
          <Link
            href="/knowledge-base"
            onClick={handleNavigate}
            className="flex items-center gap-sm px-md py-xs text-label-sm text-text-muted transition-colors hover:text-text-secondary"
          >
            <FileText className="size-3.5" strokeWidth={1.5} />
            Documentation
          </Link>
          <Link
            href="/support"
            onClick={handleNavigate}
            className="flex items-center gap-sm px-md py-xs text-label-sm text-text-muted transition-colors hover:text-text-secondary"
          >
            <LifeBuoy className="size-3.5" strokeWidth={1.5} />
            Support
          </Link>
        </div>
      </div>
    </>
  );
}
