import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AnalysisResultSchema } from '@/lib/schemas';

const SESSION_COOKIE = 'poisik_session';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.json({ analyses: [] });
  }

  const analyses = await prisma.analysis.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ analyses });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const body = await req.json();

  const parsed = AnalysisResultSchema.safeParse(body.result);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid analysis result' }, { status: 400 });
  }

  const analysis = await prisma.analysis.create({
    data: {
      sessionId,
      imageUrl: body.imageUrl,
      result: parsed.data,
    },
  });

  return NextResponse.json({ analysis });
}
