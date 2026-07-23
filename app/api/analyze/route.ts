import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as ColorThief from 'colorthief';
import { analyzeImage } from '@/lib/ai/client';
import { checkContrast } from '@/lib/ai/wcag';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, locale, model } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from URL' }, { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'image/png';

    const resized = await sharp(buffer)
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    const base64 = resized.toString('base64');

    const analysis = await analyzeImage({
      imageBase64: base64,
      mimeType,
      locale,
      model,
    });

    for (const issue of analysis.issues) {
      if (issue.category === 'contrast' && issue.description) {
        const hexMatch = issue.description.match(/#([0-9a-fA-F]{3,6})/g);
        if (hexMatch && hexMatch.length >= 2) {
          const fg = hexMatch[0];
          const bg = hexMatch[1];
          const { ratio, passesAA } = checkContrast(fg, bg);
          issue.recommendation = `${issue.recommendation} (WCAG AA: ${passesAA ? 'passes' : 'fails'} — measured ratio ${ratio}:1)`;
        }
      }
    }

    let palette: string[] | undefined;
    try {
      const colors = (await ColorThief.getPalette(resized, {
        colorCount: 6,
      })) as { _r: number; _g: number; _b: number }[] | null;
      palette = colors?.map(
        (c) =>
          `#${c._r.toString(16).padStart(2, '0')}${c._g.toString(16).padStart(2, '0')}${c._b.toString(16).padStart(2, '0')}`
      );
    } catch {
      console.warn('ColorThief extraction failed');
    }

    return NextResponse.json({ ...analysis, palette });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The analysis didn't come back as expected — try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
