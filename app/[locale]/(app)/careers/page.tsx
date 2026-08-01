import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Careers' });
  return buildMetadata({
    locale,
    path: '/careers',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default async function CareersPage() {
  const t = await getTranslations('Careers');
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-body-lg text-text-secondary">{t('intro')}</p>

      <div className="space-y-lg text-body-md text-text-secondary">
        <p>{t('p1')}</p>
      </div>

      <div className="mt-xxl rounded-xl border border-border bg-surface p-xl text-center">
        <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
          {t('noOpenPositionsTitle')}
        </h2>
        <p className="text-body-md text-text-secondary">{t('noOpenPositionsDesc')}</p>
      </div>
    </main>
  );
}
