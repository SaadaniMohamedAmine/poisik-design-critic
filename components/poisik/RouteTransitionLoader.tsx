'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const MIN_VISIBLE_MS = 500;
// Belt-and-suspenders: this component has twice now gotten stuck showing
// forever because some navigation path started the loader without ever
// producing a pathname/searchParams change to clear it. Rather than chase
// every possible such path individually, force-clear after a generous
// timeout no legitimate navigation should ever take.
const MAX_VISIBLE_MS = 8000;

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

    // Next calls pushState/replaceState even when the target URL is the one
    // already on screen (e.g. clicking a sidebar link to the current page).
    // That's not a real navigation — pathname/searchParams never change, so
    // the effect below (which is the only place that turns `loading` back
    // off) never fires, leaving the overlay stuck on screen indefinitely.
    // Only start the loader when the destination actually differs.
    function isRealNavigation(url: string | URL | null | undefined): boolean {
      if (!url) return false;
      const target = new URL(url, window.location.href);
      return (
        target.pathname !== window.location.pathname || target.search !== window.location.search
      );
    }

    window.history.pushState = function patchedPushState(
      ...args: Parameters<typeof window.history.pushState>
    ) {
      if (isRealNavigation(args[2])) startLoading();
      return originalPushState(...args);
    };
    window.history.replaceState = function patchedReplaceState(
      ...args: Parameters<typeof window.history.replaceState>
    ) {
      if (isRealNavigation(args[2])) startLoading();
      return originalReplaceState(...args);
    };

    // Unlike pushState/replaceState (intercepted before the URL changes),
    // popstate fires after window.location already reflects the
    // destination — so "is this a real navigation" here means comparing
    // against the last known route, not against window.location itself.
    // Without this guard, a back/forward that lands on a URL matching
    // currentKeyRef.current (e.g. a history entry that doesn't change
    // pathname/searchParams) starts the loader but the effect that's
    // supposed to clear it never fires, since it only fires on a key
    // change — leaving the overlay stuck on screen indefinitely.
    function startLoadingOnPopstate() {
      const newKey = `${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`;
      if (newKey === currentKeyRef.current) return;
      startLoading();
    }

    window.addEventListener('popstate', startLoadingOnPopstate);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', startLoadingOnPopstate);
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

  useEffect(() => {
    if (!loading) return;
    const safety = setTimeout(() => {
      setLoading(false);
      shownAtRef.current = null;
    }, MAX_VISIBLE_MS);
    return () => clearTimeout(safety);
  }, [loading]);

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
