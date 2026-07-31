import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function AboutPage() {
  const t = await getTranslations('About');
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-body-lg text-text-secondary">{t('intro')}</p>

      <div className="space-y-lg text-body-md text-text-secondary">
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
        <p>{t('p3')}</p>
      </div>

      <div className="mt-xxl border-t border-border pt-xl">
        <h2 className="mb-md text-headline-md font-semibold text-text-primary">
          {t('careAboutTitle')}
        </h2>
        <ul className="space-y-md text-body-md text-text-secondary">
          <li>
            <span className="font-semibold text-text-primary">{t('speedLabel')}</span>{' '}
            {t('speedDesc')}
          </li>
          <li>
            <span className="font-semibold text-text-primary">{t('specificityLabel')}</span>{' '}
            {t('specificityDesc')}
          </li>
          <li>
            <span className="font-semibold text-text-primary">{t('accessibilityLabel')}</span>{' '}
            {t('accessibilityDesc')}
          </li>
        </ul>
      </div>
    </main>
  );
}
