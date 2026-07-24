import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? 'FREE';
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
});
