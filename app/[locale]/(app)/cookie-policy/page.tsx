import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CookiePolicy' });
  return buildMetadata({
    locale,
    path: '/cookie-policy',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default async function CookiePolicyPage() {
  const t = await getTranslations('CookiePolicy');
  return (
    <main className="mx-auto max-w-3xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-label-md text-text-secondary">{t('lastUpdated')}</p>

      <div className="space-y-xl text-body-md text-text-secondary">
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('section1Title')}
          </h2>
          <p>{t('section1Body')}</p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('section2Title')}
          </h2>
          <ul className="list-disc space-y-sm pl-lg">
            <li>
              <span className="font-semibold text-text-primary">{t('sessionCookiesLabel')}</span>{' '}
              {t('sessionCookiesDesc')}
            </li>
            <li>
              <span className="font-semibold text-text-primary">{t('preferenceCookiesLabel')}</span>{' '}
              {t('preferenceCookiesDesc')}
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('section3Title')}
          </h2>
          <p>{t('section3Body')}</p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            {t('section4Title')}
          </h2>
          <p>{t('section4Body')}</p>
        </section>
      </div>
    </main>
  );
}
