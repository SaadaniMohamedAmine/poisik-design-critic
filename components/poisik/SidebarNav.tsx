'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  History,
  BookOpen,
  Settings,
  Plus,
  X,
  Upload,
  FolderPlus,
  ChevronDown,
  Lock,
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

  const [dialOpen, setDialOpen] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dialRef.current && !dialRef.current.contains(e.target as Node)) setDialOpen(false);
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
    setDialOpen(false);
    setProjectsOpen(false);
    onNavigate?.();
  }

  return (
    <>
      <div>
        {/* Design reference: a mobile "speed dial" FAB pattern the user
            provided (collapsed "+" circle that expands into a small stack of
            labeled actions, closed via an "X"). Adapted to the sidebar's
            fixed-width column: instead of a floating overlay, the two
            actions render inline as regular nav-style rows directly below
            the toggle, pushing the rest of the nav down rather than
            overlapping it — simpler and safer in a narrow 256px column than
            an absolutely-positioned popover. At-limit state keeps the
            original single lock button (nothing to "dial" if every action
            just bounces to /pricing anyway). */}
        <div ref={dialRef} className="mb-lg">
          {isAtLimit ? (
            <Link
              id="tour-new-analysis"
              href="/pricing"
              title="You're out of analyses this month — upgrade to keep going"
              onClick={handleNavigate}
              className="flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal px-md py-md font-bold text-white transition-opacity hover:opacity-90"
            >
              <Lock className="size-4" strokeWidth={1.5} />
              Upgrade to analyze
            </Link>
          ) : (
            <>
              <button
                id="tour-new-analysis"
                onClick={() => setDialOpen((prev) => !prev)}
                aria-label={dialOpen ? 'Close quick actions' : 'Open quick actions'}
                aria-expanded={dialOpen}
                className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                  dialOpen
                    ? 'border border-border-strong bg-bg-elevated text-text-primary'
                    : 'bg-accent-signal text-white hover:opacity-90'
                }`}
              >
                {dialOpen ? (
                  <X className="size-5" strokeWidth={1.5} />
                ) : (
                  <Plus className="size-5" strokeWidth={2} />
                )}
              </button>
              {dialOpen && (
                <div className="mt-sm space-y-xs">
                  <Link
                    href="/projects/new-analysis"
                    onClick={handleNavigate}
                    className="flex items-center gap-md rounded-xl px-md py-md text-label-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Upload className="size-4" strokeWidth={1.5} />
                    New analysis
                  </Link>
                  <Link
                    href="/projects?new=true"
                    onClick={handleNavigate}
                    className="flex items-center gap-md rounded-xl px-md py-md text-label-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <FolderPlus className="size-4" strokeWidth={1.5} />
                    New project
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

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
      </div>
    </>
  );
}
