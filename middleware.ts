import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import createMiddleware from 'next-intl/middleware';

const SESSION_COOKIE = 'poisik_session';
const SESSION_MAX_AGE = 365 * 24 * 60 * 60;

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
