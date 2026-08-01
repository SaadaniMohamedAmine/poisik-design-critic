import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';
import { LandingPageClient } from './LandingPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Landing' });
  const base = buildMetadata({
    locale,
    path: '',
    title: t('metaTitle'),
    description: t('metaDescription'),
  });
  // The homepage is the one page where "Poisik — <tagline>" (brand first)
  // reads better than every other page's "<Page> — Poisik" template —
  // `absolute` bypasses the root layout's title.template so it isn't
  // double-appended into "Poisik — <tagline> — Poisik".
  return { ...base, title: { absolute: t('metaTitle') } };
}

export default function LandingPage() {
  return <LandingPageClient />;
}
