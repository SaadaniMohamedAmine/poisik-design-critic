import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '@/auth';
import {
  RouteTransitionLoader,
  RippleEffect,
  ScrollToTopButton,
  SplashScreen,
  CommandPalette,
} from '@/components/poisik';

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
