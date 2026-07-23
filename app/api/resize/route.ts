import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

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

    return NextResponse.json({ base64, mimeType });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong processing this image — try again.' },
      { status: 500 }
    );
  }
}
