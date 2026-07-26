import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createNotification, type NotificationType } from '@/lib/notifications';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

// Used for the handful of events that have no server route of their own to
// hook a `createNotification` call into — right now that's just sign-out,
// fired from the client immediately before the session ends.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { type, title, message, link } = await req.json();
  if (!type || !title || !message) {
    return NextResponse.json({ error: 'Missing type, title, or message' }, { status: 400 });
  }

  const notification = await createNotification(
    userId,
    type as NotificationType,
    title,
    message,
    link
  );
  return NextResponse.json(notification, { status: 201 });
}
