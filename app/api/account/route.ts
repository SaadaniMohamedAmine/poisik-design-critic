import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      plan: true,
      createdAt: true,
      projects: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          analyses: {
            select: {
              id: true,
              imageUrl: true,
              result: true,
              isPublic: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(user, {
    headers: { 'Content-Disposition': 'attachment; filename="poisik-account-export.json"' },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 80) {
    return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: (session.user as { id: string }).id },
    data: { name },
    select: { name: true },
  });

  return NextResponse.json({ name: updated.name });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.user.delete({ where: { id: (session.user as { id: string }).id } });
  return NextResponse.json({ ok: true });
}
