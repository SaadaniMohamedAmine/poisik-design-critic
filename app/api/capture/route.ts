import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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

    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const base64 = await page.screenshot({ encoding: 'base64', type: 'png' });
    await browser.close();

    return NextResponse.json({ base64, mimeType: 'image/png' });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load that page — try uploading a screenshot instead." },
      { status: 502 }
    );
  }
}
