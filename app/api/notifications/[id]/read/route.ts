import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await context.params;

  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json(updated);
}
