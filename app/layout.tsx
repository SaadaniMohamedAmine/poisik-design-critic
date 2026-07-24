import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { JsonLd } from '@/components/poisik/JsonLd';
import { CommandPalette } from '@/components/poisik/CommandPalette';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <CommandPalette />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
