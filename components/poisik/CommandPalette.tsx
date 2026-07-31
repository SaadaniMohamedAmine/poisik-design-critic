'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Command } from 'cmdk';
import {
  Search,
  Upload,
  FolderOpen,
  LayoutDashboard,
  GitCompare,
  Settings,
  LogOut,
  Sparkles,
  Layers,
  DollarSign,
  Eye,
  LogIn,
  UserPlus,
  Languages,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  run?: () => void;
}

interface ActionMeta {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  href: string;
}

function switchLanguage() {
  const current = window.location.pathname;
  const newLocale = current.startsWith('/fr') ? 'en' : 'fr';
  window.location.href = current.replace(/^\/(en|fr)/, `/${newLocale}`);
}

// Only the actions a signed-in user can actually reach — everything here
// lives under the (authenticated) route group. "Compare" has no standalone
// route (it's always /projects/[id]/compare), so it sends you to the
// project picker instead of a dead link.
const AUTH_ACTIONS: ActionMeta[] = [
  { id: 'dashboard', labelKey: 'authDashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'new-analysis', labelKey: 'authNewAnalysis', icon: Upload, href: '/projects/new-analysis' },
  { id: 'projects', labelKey: 'authProjects', icon: FolderOpen, href: '/projects' },
  { id: 'compare', labelKey: 'authCompare', icon: GitCompare, href: '/projects' },
  { id: 'settings', labelKey: 'authSettings', icon: Settings, href: '/settings' },
  { id: 'pricing', labelKey: 'authPricing', icon: DollarSign, href: '/pricing' },
];

// What an anonymous visitor sees instead — the same links the marketing
// header itself offers, not app routes that would just bounce them to
// sign-in.
const PUBLIC_ACTIONS: ActionMeta[] = [
  { id: 'features', labelKey: 'publicFeatures', icon: Sparkles, href: '/#features' },
  {
    id: 'beyond-critique',
    labelKey: 'publicBeyondCritique',
    icon: Layers,
    href: '/#beyond-critique',
  },
  { id: 'pricing', labelKey: 'publicPricing', icon: DollarSign, href: '/pricing' },
  { id: 'demo', labelKey: 'publicDemo', icon: Eye, href: '/demo' },
  { id: 'sign-in', labelKey: 'publicSignIn', icon: LogIn, href: '/sign-in' },
  { id: 'sign-up', labelKey: 'publicSignUp', icon: UserPlus, href: '/sign-up' },
];

// A visible trigger (topbar button) needs to open this same palette instance
// without lifting `open` state into a shared store — a plain window event is
// enough for a single global palette mounted once in the root layout.
const OPEN_EVENT = 'poisik:open-command-palette';

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface CommandPaletteProps {
  isAuthenticated?: boolean;
}

export function CommandPalette({ isAuthenticated = false }: CommandPaletteProps) {
  const t = useTranslations('CommandPalette');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, openHandler);
    return () => window.removeEventListener(OPEN_EVENT, openHandler);
  }, []);

  const runAction = useCallback(
    (action: Action) => {
      setOpen(false);
      if (action.run) {
        action.run();
        return;
      }
      router.push(action.href || '');
    },
    [router]
  );

  const actions: Action[] = (isAuthenticated ? AUTH_ACTIONS : PUBLIC_ACTIONS).map((a) => ({
    id: a.id,
    label: t(a.labelKey),
    icon: a.icon,
    href: a.href,
  }));

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]',
        open ? 'visible' : 'invisible'
      )}
    >
      {open && <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />}
      <div
        className={cn(
          'relative z-10 w-full max-w-128 rounded-xl border border-border-strong bg-surface shadow-2xl transition-all',
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <Command className="overflow-hidden rounded-xl" shouldFilter={false}>
          <div className="flex items-center border-b border-border px-md">
            <Search className="mr-2 size-4 text-text-muted" />
            <Command.Input
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent py-3 text-body-md text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-label-md text-text-muted">
              {t('noResults')}
            </Command.Empty>
            {actions.map((action) => (
              <Command.Item
                key={action.id}
                onSelect={() => runAction(action)}
                className="flex cursor-pointer items-center gap-md rounded-lg px-md py-2 text-label-md text-text-primary data-[selected=true]:bg-accent-soft-bg data-[selected=true]:text-accent-signal"
              >
                <action.icon className="size-4 text-text-muted" />
                {action.label}
              </Command.Item>
            ))}
            <Command.Item
              onSelect={() =>
                runAction({ id: 'lang', label: '', icon: Languages, run: switchLanguage })
              }
              className="flex cursor-pointer items-center gap-md rounded-lg px-md py-2 text-label-md text-text-primary data-[selected=true]:bg-accent-soft-bg data-[selected=true]:text-accent-signal"
            >
              <Languages className="size-4 text-text-muted" />
              {t('switchLanguage')}
            </Command.Item>
            {isAuthenticated && (
              <Command.Item
                onSelect={() =>
                  runAction({ id: 'sign-out', label: '', icon: LogOut, run: () => signOut() })
                }
                className="flex cursor-pointer items-center gap-md rounded-lg px-md py-2 text-label-md text-text-primary data-[selected=true]:bg-accent-soft-bg data-[selected=true]:text-accent-signal"
              >
                <LogOut className="size-4 text-text-muted" />
                {t('signOut')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
