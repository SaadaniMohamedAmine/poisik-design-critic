import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
  });

  if (!analysis) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  // Anonymous-session ownership no longer applies (see prisma/schema.prisma —
  // Analysis is project-scoped now). Only the public-share path still applies
  // until Phase B adds real project-ownership checks (see features/07-history.md).
  if (!analysis.isPublic) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  return NextResponse.json({ analysis });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();

  const analysis = await prisma.analysis.update({
    where: { id },
    data: { isPublic: body.isPublic },
  });

  return NextResponse.json({ analysis });
}
