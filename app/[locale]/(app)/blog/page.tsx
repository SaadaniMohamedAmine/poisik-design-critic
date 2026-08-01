import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';

const POST_KEYS = [
  { titleKey: 'post1Title', excerptKey: 'post1Excerpt' },
  { titleKey: 'post2Title', excerptKey: 'post2Excerpt' },
  { titleKey: 'post3Title', excerptKey: 'post3Excerpt' },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return buildMetadata({
    locale,
    path: '/blog',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
}

export default async function BlogPage() {
  const t = await getTranslations('Blog');
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">{t('title')}</h1>
      <p className="mb-xl text-body-lg text-text-secondary">{t('subtitle')}</p>

      <div className="space-y-lg">
        {POST_KEYS.map(({ titleKey, excerptKey }) => (
          <article
            key={titleKey}
            className="cursor-pointer rounded-xl border border-border bg-surface p-lg transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            <span className="text-label-sm font-bold uppercase tracking-widest text-accent-signal">
              {t('comingSoon')}
            </span>
            <h2 className="mt-sm mb-sm text-headline-md font-semibold text-text-primary">
              {t(titleKey)}
            </h2>
            <p className="text-body-md text-text-secondary">{t(excerptKey)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
