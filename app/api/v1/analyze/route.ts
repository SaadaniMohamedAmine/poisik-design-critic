import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { analyzeImage } from '@/lib/ai/client';
import { checkContrast } from '@/lib/ai/wcag';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey || apiKey !== process.env.POISIK_API_KEY) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  try {
    const { imageUrl, imageBase64, mimeType, locale, model } = await req.json();

    let base64 = imageBase64;
    let mt = mimeType || 'image/png';

    if (imageUrl && !base64) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      mt = response.headers.get('content-type') || 'image/png';
      const resized = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      base64 = resized.toString('base64');
    }

    if (!base64) {
      return NextResponse.json({ error: 'Provide imageUrl or imageBase64' }, { status: 400 });
    }

    const analysis = await analyzeImage({ imageBase64: base64, mimeType: mt, locale, model });

    for (const issue of analysis.issues) {
      if (issue.category === 'contrast') {
        const hexMatch = issue.description?.match(/#([0-9a-fA-F]{3,6})/g);
        if (hexMatch && hexMatch.length >= 2) {
          const { ratio, passesAA } = checkContrast(hexMatch[0], hexMatch[1]);
          issue.recommendation = `${issue.recommendation} (WCAG AA: ${passesAA ? 'passes' : 'fails'} — ${ratio}:1)`;
        }
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
