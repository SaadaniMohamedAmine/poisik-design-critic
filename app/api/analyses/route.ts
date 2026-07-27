import { NextResponse } from 'next/server';

// Analysis is now project-scoped (see prisma/schema.prisma and
// features/07-history.md) instead of keyed by an anonymous session cookie.
// These anonymous-session endpoints are superseded by the /api/projects
// endpoints landing in Phase B — kept as inert stubs here only so existing
// callers (the History page) don't hard-crash in the meantime.

export async function GET() {
  return NextResponse.json({ analyses: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is retired — analyses are now created within a project.' },
    { status: 410 }
  );
}
