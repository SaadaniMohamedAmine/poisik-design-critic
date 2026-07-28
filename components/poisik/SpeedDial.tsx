'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Upload, FolderPlus, Lock } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface SpeedDialProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
}

const ACTIONS = [
  { id: 'new-analysis', label: 'New analysis', icon: Upload, href: '/projects/new-analysis' },
  { id: 'new-project', label: 'New project', icon: FolderPlus, href: '/projects?new=true' },
] as const;

// Floating action button, adapted from a mobile "speed dial" reference the
// user provided: a "+" circle fixed to the bottom-right of the viewport,
// expanding upward into a small stack of labeled circular actions on click,
// with the "+" itself rotating into an "X" rather than swapping icons.
// Replaces the sidebar's old full-width "New Analysis" button — this is
// mounted once in AppShellChrome (not inside SidebarNav), so it's identical
// and independent of whether the desktop sidebar or the mobile drawer is
// what's currently visible.
export function SpeedDial({ usage }: SpeedDialProps) {
  const isAtLimit = usage.limit !== null && usage.remaining === 0;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (isAtLimit) {
    return (
      <Link
        id="tour-new-analysis"
        href="/pricing"
        title="You're out of analyses this month — upgrade to keep going"
        className="fixed right-xl bottom-xl z-50 flex size-14 items-center justify-center rounded-full bg-accent-signal text-white shadow-2xl transition-opacity hover:opacity-90"
      >
        <Lock className="size-5" strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <div ref={ref} className="fixed right-xl bottom-xl z-50 flex flex-col items-center gap-md">
      <AnimatePresence>
        {open &&
          ACTIONS.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.8 }}
              transition={{ duration: 0.18, delay: (ACTIONS.length - 1 - i) * 0.05 }}
              className="flex flex-col items-center gap-xs"
            >
              <Link
                href={action.href}
                onClick={() => setOpen(false)}
                title={action.label}
                className="flex size-12 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-lg transition-colors hover:border-accent-signal/40 hover:text-accent-signal"
              >
                <action.icon className="size-5" strokeWidth={1.5} />
              </Link>
              <span className="rounded-md bg-bg-elevated px-xs py-0.5 text-[10px] font-bold whitespace-nowrap text-text-secondary shadow">
                {action.label}
              </span>
            </motion.div>
          ))}
      </AnimatePresence>

      <button
        id="tour-new-analysis"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-accent-signal text-white shadow-2xl transition-opacity hover:opacity-90"
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          <Plus className="size-6" strokeWidth={2} />
        </motion.span>
      </button>
    </div>
  );
}
