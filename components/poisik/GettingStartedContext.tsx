'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface GettingStartedItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

interface GettingStartedState {
  items: GettingStartedItem[];
  dismissed: boolean;
  minimized: boolean;
  minimize: () => void;
  expand: () => void;
  dismiss: () => void;
}

const STORAGE_KEY = 'poisik-getting-started-minimized';

const GettingStartedContext = createContext<GettingStartedState | null>(null);

// Wraps the authenticated shell (mounted once in AppShell) so the checklist
// card (dashboard main content) and its collapsed pill (sidebar footer) stay
// in sync without prop-drilling through two unrelated component trees.
// `items` come from the server (real project/analysis/report/overview
// signals, computed in AppShell) — this component only owns the two purely
// client-side toggles: whether it's minimized (cosmetic, localStorage) and
// whether it's dismissed (durable, persisted to the User row via the API).
export function GettingStartedProvider({
  items,
  initialDismissed,
  children,
}: {
  items: GettingStartedItem[];
  initialDismissed: boolean;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(initialDismissed);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    setMinimized(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  const minimize = useCallback(() => {
    setMinimized(true);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  const expand = useCallback(() => {
    setMinimized(false);
    localStorage.setItem(STORAGE_KEY, '0');
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    fetch('/api/onboarding/dismiss-checklist', { method: 'PATCH' }).catch(() => {});
  }, []);

  return (
    <GettingStartedContext.Provider
      value={{ items, dismissed, minimized, minimize, expand, dismiss }}
    >
      {children}
    </GettingStartedContext.Provider>
  );
}

export function useGettingStarted() {
  return useContext(GettingStartedContext);
}
