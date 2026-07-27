import type { NextAuthConfig } from 'next-auth';

// Edge-safe subset of the full NextAuth config in auth.ts — no providers,
// no Prisma adapter, no bcrypt. middleware.ts runs on the Edge runtime and
// builds its own NextAuth() instance from just this config, so its bundle
// doesn't pull in @prisma/client (which alone pushed the Edge Function past
// Vercel's 1 MB size limit). The full config in auth.ts spreads this object
// and adds everything the Node-only routes/server components need.
export const authConfig = {
  pages: { signIn: '/sign-in' },
  session: { strategy: 'jwt' },
  providers: [],
} satisfies NextAuthConfig;
