import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';

// This route has no current callers (superseded by the project-scoped
// /api/projects/[id]/analyses) but is kept for the public API (see
// features/18-public-api.md) — auth-gated so it can't be used to burn AI
// credits for free, now that billing/usage limits exist.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageUrl, model } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    const result = await runAnalysisPipeline({ imageUrl, model });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The analysis didn't come back as expected — try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
