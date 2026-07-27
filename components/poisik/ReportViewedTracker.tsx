'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Powers the "View your first report" onboarding checklist step (see
// GettingStartedProvider in AppShell.tsx). Split out of the report page
// itself (now a server component) so this one client-only side effect
// doesn't force the whole page into 'use client'. Fires for any signed-in
// viewer who opens a report they can access — not scoped to "their own"
// report specifically, see mark-report-viewed's route comment.
export function ReportViewedTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/onboarding/mark-report-viewed', { method: 'POST' }).catch(() => {});
  }, [session]);

  return null;
}
