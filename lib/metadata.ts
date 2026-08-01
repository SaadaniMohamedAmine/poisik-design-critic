import type { Metadata } from 'next';

// Real deployed URL — the previous fallback ('https://poisik.ai') was an
// aspirational domain that was never actually wired up anywhere (DNS, env
// vars), so any page relying on the fallback link-previewed with a dead URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://poisik-design-critic.vercel.app';

const OG_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630 };

// Per-page metadata (title/description/OG/Twitter) for pages that can run
// generateMetadata (Server Components). Client Component pages can't export
// this at all — see LandingPageClient/PricingPageClient/DemoPageClient's
// page.tsx wrappers for the pattern used to still give those a real page.
export function buildMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string; // '' for the section root, else e.g. '/about'
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const ogLocale = locale === 'fr' ? 'fr_FR' : 'en_US';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        fr: `${SITE_URL}/fr${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Poisik',
      images: [OG_IMAGE],
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
