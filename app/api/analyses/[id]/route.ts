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

  const cookieStore = (await import('next/headers')).cookies;
  const sessionId = (await cookieStore()).get('poisik_session')?.value;

  if (!analysis.isPublic && analysis.sessionId !== sessionId) {
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
