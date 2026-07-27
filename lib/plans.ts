// The Prisma `Plan` enum is FREE | PRO | ENTERPRISE — the pricing page's
// "Team" tier maps to ENTERPRISE here; there is no separate "TEAM" enum value.
export type Plan = 'FREE' | 'PRO' | 'ENTERPRISE';

export const PLAN_LIMITS: Record<'FREE' | 'PRO' | 'ENTERPRISE', number | null> = {
  FREE: 3,
  PRO: 100,
  ENTERPRISE: null, // "Team" tier in the UI — unlimited, manually provisioned
};

export const PLAN_LABELS: Record<'FREE' | 'PRO' | 'ENTERPRISE', string> = {
  FREE: 'Free',
  PRO: 'Pro',
  ENTERPRISE: 'Team',
};

// Single source of truth for "what's the next tier up" — used by the
// upgrade modal so the Free -> Pro -> Team ladder can't drift out of sync
// with PLAN_LIMITS. `null` means the plan is already the top tier.
export const NEXT_PLAN: Record<'FREE' | 'PRO' | 'ENTERPRISE', 'PRO' | 'ENTERPRISE' | null> = {
  FREE: 'PRO',
  PRO: 'ENTERPRISE',
  ENTERPRISE: null,
};
