import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  MarketingHeader,
  MarketingFooter,
  ReportView,
  ReportViewedTracker,
  AppShellChrome,
  loadShellData,
} from '@/components/poisik';
import type { AnalysisResult } from '@/lib/schemas';

// Deliberately NOT under (app) or (authenticated) — this route needs a
// layout decision that neither route group's static layout.tsx can make on
// its own: an owner viewing their own analysis from the dashboard should
// get the real app shell (Sidebar + TopBarAuth), while a public share link
// (anonymous, or a different signed-in account) gets the light marketing
// chrome. That choice depends on runtime auth + ownership, so it's made
// here instead of by a shared layout.
export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const viewerId = (session?.user as { id?: string } | undefined)?.id;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { project: { select: { userId: true } } },
  });

  if (!analysis) notFound();

  // Same visibility rule as GET /api/analyses/[id]: public analyses are
  // open to anyone, private ones only to their owner. Same 404 either way
  // so a private id can't be probed for existence.
  const isOwner = !!viewerId && viewerId === analysis.project.userId;
  if (!analysis.isPublic && !isOwner) notFound();

  const reportView = (
    <>
      <ReportViewedTracker />
      <ReportView
        result={analysis.result as AnalysisResult}
        imageUrl={analysis.imageUrl}
        showOwnerActions={isOwner}
      />
    </>
  );

  if (isOwner && session) {
    const shellData = await loadShellData(session);
    return (
      <AppShellChrome session={session} shellData={shellData}>
        {reportView}
      </AppShellChrome>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <MarketingHeader />
      <div className="mx-auto max-w-[1280px] px-lg pb-24 pt-32">{reportView}</div>
      <MarketingFooter />
    </div>
  );
}
