'use client';

import { LayoutDashboard, FolderKanban, Settings, Plus, Lock } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { GettingStartedPill } from './GettingStartedPill';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: undefined },
  { href: '/projects', label: 'Projects', icon: FolderKanban, id: 'tour-projects-nav' },
  { href: '/settings', label: 'Settings', icon: Settings, id: undefined },
] as const;

interface SidebarNavProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
  onNavigate?: () => void;
}

// The shared nav content rendered both inside the desktop Sidebar (fixed
// left column, lg+) and the mobile drawer (TopBarAuth's burger menu, below
// lg) — one definition so the two surfaces can't drift apart.
export function SidebarNav({ usage, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  // Redirect straight to /pricing instead of letting the user walk through
  // project selection only to hit the 402 at the very last step — the API
  // route still enforces this server-side regardless, this is just sparing
  // a dead-end click.
  const isAtLimit = usage.limit !== null && usage.remaining === 0;

  return (
    <>
      <div>
        <Link
          id="tour-new-analysis"
          href={isAtLimit ? '/pricing' : '/projects/new-analysis'}
          title={
            isAtLimit ? "You're out of analyses this month — upgrade to keep going" : undefined
          }
          onClick={onNavigate}
          className="mb-lg flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal px-md py-md font-bold text-white transition-opacity hover:opacity-90"
        >
          {isAtLimit ? (
            <Lock className="size-4" strokeWidth={1.5} />
          ) : (
            <Plus className="size-4" strokeWidth={1.5} />
          )}
          {isAtLimit ? 'Upgrade to analyze' : 'New Analysis'}
        </Link>
        <nav className="space-y-xs">
          {NAV_LINKS.map(({ href, label, icon: Icon, id }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                id={id}
                href={href}
                onClick={onNavigate}
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
          onClick={onNavigate}
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
