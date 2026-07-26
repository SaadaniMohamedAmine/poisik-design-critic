import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email as string } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(creds.password as string, user.passwordHash);
        return valid ? user : null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Facebook: intentionally NOT added here yet. Keep FACEBOOK_CLIENT_ID /
    // FACEBOOK_CLIENT_SECRET documented in .env.example and gate any UI with
    // NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED — do not show a working
    // "Continue with Facebook" button until this flag is flipped to true.
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? 'FREE';
        token.planRefreshedAt = Date.now();
        return token;
      }

      // Settings page calls `update({ name })` after a successful PATCH to
      // /api/account — patch the JWT's name claim immediately instead of
      // leaving the displayed name stale until the next sign-in.
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
        return token;
      }

      // The JWT's `plan` claim is only set at sign-in above — without this,
      // it would never reflect a plan change a Stripe webhook makes later
      // (checkout, cancellation, etc.), so a paying user would see no change
      // anywhere until they signed out and back in. Re-read from the DB at
      // most once a minute rather than on every request, to bound the cost.
      const refreshedAt = (token.planRefreshedAt as number | undefined) ?? 0;
      if (Date.now() - refreshedAt > 60_000 && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.planRefreshedAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string; plan: string }).id =
          token.id as string;
        (session.user as typeof session.user & { id: string; plan: string }).plan =
          (token.plan as string) ?? 'FREE';
      }
      return session;
    },
  },
  events: {
    // Fires on every successful sign-in (Credentials or Google, every time —
    // not just the first one), which is exactly what "Welcome back" should
    // do. This is the single persistence point for the login notification;
    // the ephemeral toast is a separate concern handled client-side by
    // WelcomeToast.tsx via a `?welcome=1` redirect flag.
    async signIn({ user }) {
      if (!user.id) return;
      const name = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'there';
      await createNotification(
        user.id,
        'WELCOME',
        'Welcome back',
        `Welcome back to Poisik, ${name}!`
      );
    },
  },
});
