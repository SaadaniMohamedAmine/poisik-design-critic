import { prisma } from '@/lib/prisma';

// Kept as a plain string union (not a Prisma enum) in the schema — see the
// comment on the `Notification` model. This union is the single source of
// truth for every notification trigger in the app; `NotificationBell` maps
// each value to an icon by the same string key.
export type NotificationType =
  | 'WELCOME'
  | 'GOODBYE'
  | 'PROJECT_CREATED'
  | 'ANALYSIS_COMPLETED'
  | 'USAGE_LIMIT_REACHED'
  | 'PLAN_UPGRADED'
  | 'PLAN_DOWNGRADED';

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}
