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

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.user.delete({ where: { id: (session.user as { id: string }).id } });
  return NextResponse.json({ ok: true });
}
