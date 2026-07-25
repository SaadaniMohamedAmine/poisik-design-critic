import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { auth } from '@/auth';

// No current callers (the "Analyze a URL" mode is disabled pending
// features/14-live-url-analysis.md) — auth-gated so an unauthenticated
// caller can't launch headless Chromium against an arbitrary URL for free
// (cost/DoS exposure), now that billing/usage limits exist elsewhere.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const buffer = await page.screenshot({ type: 'png' });
    const base64 = buffer.toString('base64');
    await browser.close();

    return NextResponse.json({ base64, mimeType: 'image/png' });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load that page — try uploading a screenshot instead." },
      { status: 502 }
    );
  }
}
