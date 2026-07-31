import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

const SECTION_KEYS = [1, 2, 3, 4, 5, 6] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TermsOfService' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function TermsOfServicePage() {
  const t = await getTranslations('TermsOfService');
  return (
    <main className="mx-auto max-w-3xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-label-md text-text-secondary">{t('lastUpdated')}</p>

      <div className="space-y-xl text-body-md text-text-secondary">
        {SECTION_KEYS.map((n) => (
          <section key={n}>
            <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
              {t(`section${n}Title`)}
            </h2>
            <p>{t(`section${n}Body`)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
