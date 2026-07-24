import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), userId: (session.user as { id: string }).id },
  });
  return NextResponse.json(project, { status: 201 });
}
