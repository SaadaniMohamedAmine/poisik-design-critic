import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Called from the report page's client component on mount. Deliberately not
// scoped to "this user's own report" — /api/analyses/[id] doesn't yet
// support owner-authenticated reads of private analyses (only isPublic ones),
// so ownership can't be checked from here either. Signed-in users reach a
// /report/[id] page almost exclusively right after running their own
// analysis, so "has this user opened a report page" is a good enough proxy
// for the "View your first report" checklist step without touching that
// separate, pre-existing gap.
export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  await prisma.user.updateMany({
    where: { id: userId, firstReportViewedAt: null },
    data: { firstReportViewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
