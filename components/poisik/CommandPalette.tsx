'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Upload, History, DollarSign, Eye, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { id: 'upload', label: 'New analysis', icon: Upload, href: '/projects/new-analysis' },
  { id: 'history', label: 'Go to Projects', icon: History, href: '/projects' },
  { id: 'pricing', label: 'Go to Pricing', icon: DollarSign, href: '/pricing' },
  { id: 'demo', label: 'Go to Demo', icon: Eye, href: '/demo' },
];

export function CommandPalette() {
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

  const runAction = useCallback(
    (action: (typeof ACTIONS)[0]) => {
      setOpen(false);
      if (action.id === 'lang') {
        const current = window.location.pathname;
        const newLocale = current.startsWith('/fr') ? 'en' : 'fr';
        window.location.href = current.replace(/^\/(en|fr)/, `/${newLocale}`);
        return;
      }
      router.push(action.href || '');
    },
    [router]
  );

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
          'relative z-10 w-full max-w-lg rounded-xl border border-border-strong bg-surface shadow-2xl transition-all',
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <Command className="overflow-hidden rounded-xl" shouldFilter={false}>
          <div className="flex items-center border-b border-border px-md">
            <Search className="mr-2 size-4 text-text-muted" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent py-3 text-body-md text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-label-md text-text-muted">
              No results found.
            </Command.Empty>
            {ACTIONS.map((action) => (
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
              onSelect={() => {
                setOpen(false);
                const current = window.location.pathname;
                const newLocale = current.startsWith('/fr') ? 'en' : 'fr';
                window.location.href = current.replace(/^\/(en|fr)/, `/${newLocale}`);
              }}
              className="flex cursor-pointer items-center gap-md rounded-lg px-md py-2 text-label-md text-text-primary data-[selected=true]:bg-accent-soft-bg data-[selected=true]:text-accent-signal"
            >
              <Languages className="size-4 text-text-muted" />
              Switch language
            </Command.Item>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
