export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Poisik',
    applicationCategory: 'DesignApplication',
    description:
      'AI-powered UX/UI audit tool. Upload a screen, get an expert-level design critique on visual hierarchy, contrast, spacing, typography, and accessibility.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://poisik.ai',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        description: 'Anonymous design audits with basic analysis.',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        description: 'Advanced analysis, priority processing, and PDF exports.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
