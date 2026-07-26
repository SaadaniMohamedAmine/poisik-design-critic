import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function toPublicShape(analysis: { id: string; imageUrl: string; result: unknown; isPublic: boolean }) {
  return {
    id: analysis.id,
    imageUrl: analysis.imageUrl,
    result: analysis.result,
    isPublic: analysis.isPublic,
  };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { project: { select: { userId: true } } },
  });

  if (!analysis) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  // Public share links stay open to anyone. Otherwise this is a private
  // analysis — only its owner (the project's userId) may view it. Both the
  // "doesn't exist" and "exists but isn't yours" cases return the same 404
  // so a private analysis ID can't be probed for existence.
  if (!analysis.isPublic) {
    const session = await auth();
    const viewerId = (session?.user as { id?: string } | undefined)?.id;
    if (!viewerId || viewerId !== analysis.project.userId) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ analysis: toPublicShape(analysis) });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();

  // This previously had no ownership check at all — anyone who guessed or
  // saw an analysis id could flip isPublic on someone else's private
  // design. Load the owning project first and reject anything that isn't
  // the caller's own analysis before writing.
  const existing = await prisma.analysis.findUnique({
    where: { id },
    select: { project: { select: { userId: true } } },
  });
  if (!existing || existing.project.userId !== userId) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  const analysis = await prisma.analysis.update({
    where: { id },
    data: { isPublic: Boolean(body.isPublic) },
  });

  return NextResponse.json({ analysis: toPublicShape(analysis) });
}
