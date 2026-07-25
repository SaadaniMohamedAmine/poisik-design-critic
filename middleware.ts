import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';

const SESSION_COOKIE = 'poisik_session';
const SESSION_MAX_AGE = 365 * 24 * 60 * 60;

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

const PROTECTED_PATH_RE = /^\/(en|fr)\/(dashboard|settings|projects)(\/|$)/;

export default async function middleware(request: NextRequest) {
  if (PROTECTED_PATH_RE.test(request.nextUrl.pathname)) {
    const session = await auth();
    if (!session?.user) {
      const locale = request.nextUrl.pathname.startsWith('/fr') ? 'fr' : 'en';
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const response = intlMiddleware(request) || NextResponse.next();

  if (!sessionId) {
    response.cookies.set(SESSION_COOKIE, uuidv4(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
