import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, locale, model } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    const result = await runAnalysisPipeline({ imageUrl, locale, model });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The analysis didn't come back as expected — try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
