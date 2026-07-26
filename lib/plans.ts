// The Prisma `Plan` enum is FREE | PRO | ENTERPRISE — the pricing page's
// "Team" tier maps to ENTERPRISE here; there is no separate "TEAM" enum value.
export const PLAN_LIMITS: Record<'FREE' | 'PRO' | 'ENTERPRISE', number | null> = {
  FREE: 3,
  PRO: 100,
  ENTERPRISE: null, // "Team" tier in the UI — unlimited, manually provisioned
};
