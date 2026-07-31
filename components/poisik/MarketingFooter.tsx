'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { PoisikLogo } from './PoisikLogo';

export function MarketingFooter() {
  const t = useTranslations('Landing');
  const n = useTranslations('Navigation');

  return (
    <footer className="border-t border-border bg-bg-elevated py-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-xl px-margin md:grid-cols-4">
        <div>
          <Link href="/" className="mb-sm inline-block cursor-pointer">
            <PoisikLogo size="md" className="font-black capitalize text-accent-signal" />
          </Link>
          <p className="max-w-[220px] text-label-md text-text-secondary">{t('footerTagline')}</p>
        </div>
        <div>
          <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
            {t('footerProductHeading')}
          </h6>
          <ul className="space-y-md text-label-md text-text-secondary">
            <li>
              <Link href="/#features" className="transition-colors hover:text-accent-signal">
                {n('features')}
              </Link>
            </li>
            <li>
              <Link href="/demo" className="transition-colors hover:text-accent-signal">
                {n('demo')}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition-colors hover:text-accent-signal">
                {t('footerPricingLink')}
              </Link>
            </li>
            <li>
              <Link href="/api-docs" className="transition-colors hover:text-accent-signal">
                {t('footerApiDocsLink')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
            {t('footerCompanyHeading')}
          </h6>
          <ul className="space-y-md text-label-md text-text-secondary">
            <li>
              <Link href="/about" className="transition-colors hover:text-accent-signal">
                {t('footerAboutLink')}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-accent-signal">
                {t('footerBlogLink')}
              </Link>
            </li>
            <li>
              <Link href="/careers" className="transition-colors hover:text-accent-signal">
                {t('footerCareersLink')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
            {t('footerLegalHeading')}
          </h6>
          <ul className="space-y-md text-label-md text-text-secondary">
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-accent-signal">
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="transition-colors hover:text-accent-signal">
                {t('terms')}
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="transition-colors hover:text-accent-signal">
                {t('footerCookiePolicyLink')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-xl max-w-7xl border-t border-border px-margin pt-lg">
        <span className="text-label-sm text-text-secondary opacity-60">{t('footerCopyright')}</span>
      </div>
    </footer>
  );
}
