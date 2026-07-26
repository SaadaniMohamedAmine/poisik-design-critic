import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Called from the report page's client component on mount. Not scoped to
// "this user's own report" specifically — it just marks that a signed-in
// user opened *a* report page, which is what the "View your first report"
// checklist step means in practice. (/api/analyses/[id] now does enforce
// real ownership for private analyses; this route just doesn't need that
// check for its own purposes.)
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
