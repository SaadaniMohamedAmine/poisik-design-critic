import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';

const EXAMPLE_REQUEST = `curl -X POST https://poisik.ai/api/v1/analyze \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"imageUrl": "https://example.com/screenshot.png"}'`;

const EXAMPLE_RESPONSE = `{
  "overall_score": 84,
  "category_scores": {
    "visual_hierarchy": 90,
    "contrast": 65,
    "spacing": 78,
    "typography": 82,
    "accessibility": 70,
    "consistency": 95
  },
  "issues": [
    {
      "id": "1",
      "category": "contrast",
      "severity": "critical",
      "title": "Low Contrast Ratio",
      "description": "The primary CTA text #87a1c5 on #121a27 fails WCAG AA contrast standards.",
      "recommendation": "Increase brightness to #e3e9f2 for better legibility and WCAG compliance.",
      "code_fix": {
        "language": "hex",
        "snippet": "text-[#e3e9f2]",
        "before": "#87a1c5",
        "after": "#e3e9f2"
      },
      "location": { "x": 90, "y": 56 }
    }
  ]
}`;

const ERROR_ROWS = [
  { status: 400, key: 'error400' },
  { status: 401, key: 'error401' },
  { status: 502, key: 'error502' },
  { status: 500, key: 'error500' },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ApiDocs' });
  return buildMetadata({
    locale,
    path: '/api-docs',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-bg-base p-md">
      <pre className="text-label-sm text-text-primary">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default async function ApiDocsPage() {
  const t = await getTranslations('ApiDocs');

  return (
    <main className="mx-auto max-w-3xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-body-lg text-text-secondary">{t('subtitle')}</p>

      <div className="space-y-xl text-body-md text-text-secondary">
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('authTitle')}
          </h2>
          <p>{t('authBody')}</p>
        </section>

        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('endpointTitle')}
          </h2>
          <code className="mb-md inline-block rounded-md bg-bg-elevated px-md py-xs text-label-md font-bold text-accent-signal">
            POST /api/v1/analyze
          </code>
          <p className="mt-md">{t('endpointDesc')}</p>
        </section>

        <section>
          <h3 className="mb-sm text-label-lg font-bold text-text-primary">
            {t('requestBodyTitle')}
          </h3>
          <p className="mb-sm">{t('requestBodyIntro')}</p>
          <ul className="list-disc space-y-sm pl-lg">
            <li>
              <code className="text-text-primary">imageUrl</code> — {t('imageUrlDesc')}
            </li>
            <li>
              <code className="text-text-primary">imageBase64</code> +{' '}
              <code className="text-text-primary">mimeType</code> — {t('imageBase64Desc')}
            </li>
            <li>
              <code className="text-text-primary">model</code> — {t('modelDesc')}
            </li>
          </ul>
        </section>

        <section>
          <h3 className="mb-sm text-label-lg font-bold text-text-primary">
            {t('exampleRequestTitle')}
          </h3>
          <CodeBlock code={EXAMPLE_REQUEST} />
        </section>

        <section>
          <h3 className="mb-sm text-label-lg font-bold text-text-primary">
            {t('exampleResponseTitle')}
          </h3>
          <CodeBlock code={EXAMPLE_RESPONSE} />
        </section>

        <section>
          <h3 className="mb-sm text-label-lg font-bold text-text-primary">{t('errorsTitle')}</h3>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-elevated text-label-sm text-text-muted">
                  <th className="px-md py-sm font-semibold">{t('errorStatusHeader')}</th>
                  <th className="px-md py-sm font-semibold">{t('errorMeaningHeader')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ERROR_ROWS.map(({ status, key }) => (
                  <tr key={status}>
                    <td className="px-md py-sm font-mono text-label-md text-text-primary">
                      {status}
                    </td>
                    <td className="px-md py-sm text-label-md text-text-secondary">{t(key)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-accent-signal/20 bg-accent-soft-bg p-lg">
          <h3 className="mb-xs text-label-lg font-bold text-text-primary">{t('needKeyTitle')}</h3>
          <p className="mb-md">{t('needKeyDesc')}</p>
          <a
            href="mailto:support@poisik.ai"
            className="inline-flex rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            {t('contactSupportCta')}
          </a>
        </section>
      </div>
    </main>
  );
}
