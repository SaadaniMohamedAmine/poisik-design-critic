import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { JsonLd } from '@/components/poisik/JsonLd';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Poisik — Design and Passion, with poise.',
    template: '%s — Poisik',
  },
  description:
    'AI-powered UX/UI audit tool. Upload a screen, get an expert-level design critique on visual hierarchy, contrast, spacing, typography, and accessibility.',
  openGraph: {
    title: 'Poisik — Design and Passion, with poise.',
    description: 'AI-powered UX/UI audit tool. Get an expert-level design critique in seconds.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://poisik.ai',
    siteName: 'Poisik',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poisik — Design and Passion, with poise.',
    description: 'AI-powered UX/UI audit tool. Get an expert-level design critique in seconds.',
    images: ['/opengraph-image.png'],
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // A single SessionProvider for the whole app — pre-fetching the session here
  // (rather than nesting a second provider inside AppShell) avoids the
  // module-level `next-auth/react` session state getting wiped out whenever a
  // client-side navigation unmounts a nested provider (e.g. the command
  // palette's "Go to Pricing" action navigating from an authenticated page to
  // a public one), which would otherwise strand every other page's
  // `useSession()` in a stale "unauthenticated" state for the rest of the SPA
  // session.
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <SessionProvider session={session}>
          <TooltipProvider>{children}</TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
