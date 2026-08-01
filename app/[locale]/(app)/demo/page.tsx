import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/metadata';
import { DemoPageClient } from './DemoPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Demo' });
  return buildMetadata({
    locale,
    path: '/demo',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default function DemoPage() {
  return <DemoPageClient />;
}
