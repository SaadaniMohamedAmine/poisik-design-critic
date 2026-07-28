'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      // Bottom-left, not bottom-right — the SpeedDial FAB (New
      // analysis/New project, authenticated pages only) already owns the
      // bottom-right corner; this button is global (every page, including
      // marketing), so it needs its own corner rather than conditionally
      // avoiding the FAB.
      className="fixed bottom-margin left-margin z-50 flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-surface text-text-primary shadow-2xl transition-colors hover:bg-surface-hover"
    >
      <ArrowUp className="size-5" strokeWidth={2} />
    </button>
  );
}
