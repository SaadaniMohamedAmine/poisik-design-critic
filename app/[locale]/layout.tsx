import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { RouteTransitionLoader, RippleEffect, ScrollToTopButton } from '@/components/poisik';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Suspense fallback={null}>
        <RouteTransitionLoader />
      </Suspense>
      <RippleEffect />
      {children}
      <ScrollToTopButton />
    </NextIntlClientProvider>
  );
}
