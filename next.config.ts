import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  // `serverExternalPackages` alone stops Next from bundling sharp's JS, but
  // its native .so binaries live under separate @img/sharp-* optional-dep
  // packages that Next's file tracer doesn't always follow automatically —
  // without this, every route using sharp 500s on Vercel with ERR_DLOPEN_FAILED.
  outputFileTracingIncludes: {
    '/api/projects/[id]/analyses': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
    '/api/v1/analyze': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
    '/api/resize': ['./node_modules/sharp/**/*', './node_modules/@img/**/*'],
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
});
