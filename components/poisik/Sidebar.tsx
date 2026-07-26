'use client';

import { LayoutDashboard, FolderKanban, Plus } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { GettingStartedPill } from './GettingStartedPill';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: undefined },
  { href: '/projects', label: 'Projects', icon: FolderKanban, id: 'tour-projects-nav' },
] as const;

interface SidebarProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
}

export function Sidebar({ usage }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-20 bottom-0 left-0 hidden w-64 flex-col justify-between border-r border-border bg-surface px-md py-lg lg:flex">
      <div>
        <Link
          id="tour-new-analysis"
          href="/projects/new-analysis"
          className="mb-lg flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal px-md py-md font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Analysis
        </Link>
        <nav className="space-y-xs">
          {NAV_LINKS.map(({ href, label, icon: Icon, id }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                id={id}
                href={href}
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
          className="block rounded-xl border border-border p-md transition-colors hover:bg-surface-hover"
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
    </aside>
  );
}
