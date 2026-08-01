import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '@/auth';
import { SITE_URL } from '@/lib/metadata';
import {
  RouteTransitionLoader,
  RippleEffect,
  ScrollToTopButton,
  SplashScreen,
  CommandPalette,
} from '@/components/poisik';

// Locale-correct baseline (og:locale, canonical/alternate URLs) for every
// page under this segment that doesn't define its own generateMetadata —
// pages that do (buildMetadata callers) fully override this with their own
// title/description on top of the same locale-correct fields.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${SITE_URL}/${locale}`;
  return {
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en`, fr: `${SITE_URL}/fr` },
    },
    openGraph: { locale: locale === 'fr' ? 'fr_FR' : 'en_US', url },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [messages, session] = await Promise.all([getMessages(), auth()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SplashScreen />
      <CommandPalette isAuthenticated={!!session?.user} />
      <Suspense fallback={null}>
        <RouteTransitionLoader />
      </Suspense>
      <RippleEffect />
      {children}
      <ScrollToTopButton />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </NextIntlClientProvider>
  );
}
