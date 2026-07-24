import sharp from 'sharp';
import * as ColorThief from 'colorthief';
import { analyzeImage } from '@/lib/ai/client';
import { checkContrast } from '@/lib/ai/wcag';

interface RunAnalysisParams {
  imageUrl: string;
  locale?: string;
  model?: string;
}

export async function runAnalysisPipeline({ imageUrl, locale, model }: RunAnalysisParams) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch image from URL');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'image/png';

  const resized = await sharp(buffer)
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const base64 = resized.toString('base64');

  const analysis = await analyzeImage({
    imageBase64: base64,
    mimeType,
    locale,
    model: model as Parameters<typeof analyzeImage>[0]['model'],
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
    const colors = (await ColorThief.getPalette(resized, { colorCount: 6 })) as
      { _r: number; _g: number; _b: number }[] | null;
    palette = colors?.map(
      (c) =>
        `#${c._r.toString(16).padStart(2, '0')}${c._g.toString(16).padStart(2, '0')}${c._b.toString(16).padStart(2, '0')}`
    );
  } catch {
    console.warn('ColorThief extraction failed');
  }

  return { ...analysis, palette };
}
