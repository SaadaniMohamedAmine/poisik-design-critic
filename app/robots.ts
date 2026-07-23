import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poisik.ai';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/upload', '/demo', '/compare'],
        disallow: ['/report/', '/design-system', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
