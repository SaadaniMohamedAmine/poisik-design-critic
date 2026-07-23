import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE = 'poisik_session';
const SESSION_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    const newSessionId = uuidv4();
    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE, newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
