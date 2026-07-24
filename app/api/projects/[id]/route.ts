import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: (session.user as { id: string }).id },
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const result = await prisma.project.updateMany({
    where: { id, userId: (session.user as { id: string }).id },
    data: { name: name.trim() },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const result = await prisma.project.deleteMany({
    where: { id, userId: (session.user as { id: string }).id },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
