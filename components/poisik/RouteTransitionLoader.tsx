'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const MIN_VISIBLE_MS = 500;

/**
 * Brief branded loader shown while navigating between pages (client-side
 * transitions only — the initial full page load is covered by
 * SplashScreen).
 *
 * Next.js's App Router has no public "navigation started" event, but every
 * client-side transition — Link clicks, router.push/replace, back/forward —
 * ultimately goes through the History API. Patching pushState/replaceState
 * is the reliable way to catch all of them, rather than trying to intercept
 * every possible trigger (clicks, programmatic navigation, etc.) one by one.
 */
export function RouteTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const currentKeyRef = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    function startLoading() {
      shownAtRef.current = Date.now();
      // Next.js can call pushState/replaceState synchronously from inside a
      // React useInsertionEffect during a route transition, and React
      // forbids scheduling a state update in that phase ("useInsertionEffect
      // must not schedule updates"). Deferring by a tick moves this state
      // update outside that restricted call stack.
      setTimeout(() => setLoading(true), 0);
    }

    window.history.pushState = function patchedPushState(
      ...args: Parameters<typeof window.history.pushState>
    ) {
      startLoading();
      return originalPushState(...args);
    };
    window.history.replaceState = function patchedReplaceState(
      ...args: Parameters<typeof window.history.replaceState>
    ) {
      startLoading();
      return originalReplaceState(...args);
    };

    window.addEventListener('popstate', startLoading);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', startLoading);
    };
  }, []);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (key === currentKeyRef.current) return;
    currentKeyRef.current = key;

    // If somehow the navigation completed without us catching the start
    // (edge case), still flash the loader briefly rather than skip it.
    if (shownAtRef.current === null) {
      shownAtRef.current = Date.now() - MIN_VISIBLE_MS;
      setLoading(true);
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(() => {
      setLoading(false);
      shownAtRef.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg-base/80 backdrop-blur-md">
      <div className="flex items-end gap-[6.8px]" role="status" aria-label="Loading page">
        <span
          className="animate-bar-pulse h-8 w-[13.6px] rounded-sm bg-accent-signal"
          style={{ animationDelay: '0s' }}
        />
        <span
          className="animate-bar-pulse h-8 w-[13.6px] rounded-sm bg-accent-signal"
          style={{ animationDelay: '0.16s' }}
        />
        <span
          className="animate-bar-pulse h-8 w-[13.6px] rounded-sm bg-accent-signal"
          style={{ animationDelay: '0.32s' }}
        />
      </div>
    </div>
  );
}
