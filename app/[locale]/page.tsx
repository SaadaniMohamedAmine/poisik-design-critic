'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PoisikLogo, LanguageSwitcher } from '@/components/poisik';
import {
  ArrowRight,
  Upload,
  Search,
  CheckCircle2,
  Network,
  Contrast,
  Ruler,
  Type,
  Accessibility,
  Sparkles,
  Lock,
} from 'lucide-react';

const PROCESS_STEPS = [
  { icon: Upload, titleKey: 'processStep1Title', descKey: 'processStep1Desc' },
  { icon: Search, titleKey: 'processStep2Title', descKey: 'processStep2Desc' },
  { icon: CheckCircle2, titleKey: 'processStep3Title', descKey: 'processStep3Desc' },
] as const;

const FEATURES = [
  { icon: Network, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: Contrast, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: Ruler, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: Type, titleKey: 'feature4Title', descKey: 'feature4Desc' },
  { icon: Accessibility, titleKey: 'feature5Title', descKey: 'feature5Desc' },
  { icon: Sparkles, titleKey: 'feature6Title', descKey: 'feature6Desc' },
] as const;

export default function LandingPage() {
  const t = useTranslations('Landing');
  const n = useTranslations('Navigation');

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center border-b border-border bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-margin">
          <div className="flex items-center gap-xl">
            <PoisikLogo size="md" className="text-headline-lg font-extrabold text-accent-signal" />
            <nav className="hidden items-center gap-lg md:flex">
              <a
                href="#features"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('features')}
              </a>
              <Link
                href="/demo"
                className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
              >
                {n('demo')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <span className="hidden rounded-full border border-border px-md py-xs text-label-sm font-medium text-text-secondary md:inline">
              {n('freePlan')}
            </span>
            <LanguageSwitcher />
            <Link
              href="/upload"
              className="rounded-full bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden pt-xxl pb-xxl text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-accent-signal/10 blur-[120px]" />
          </div>
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-md text-display-lg font-semibold tracking-tight text-text-primary md:text-[64px]">
                {t('tagline')}
              </h1>
              <p className="mx-auto mb-xl max-w-2xl text-body-lg text-text-secondary">
                {t('heroSubtitle')}
              </p>
              <div className="mb-xxl flex flex-col items-center justify-center gap-md sm:flex-row">
                <Link
                  href="/upload"
                  className="rounded bg-accent-signal px-xl py-md text-body-md font-bold text-white transition-transform hover:scale-105"
                >
                  {t('cta')}
                </Link>
                <Link
                  href="/demo"
                  className="flex items-center gap-sm rounded border border-border px-xl py-md text-body-md font-medium text-text-primary transition-colors hover:bg-surface"
                >
                  {t('viewLiveExample')}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 -z-10 rounded-xl bg-accent-signal/10 blur-[100px]" />
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <Image
                  src="/hero-dashboard.jpg"
                  alt={t('heroImageAlt')}
                  width={512}
                  height={279}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-xxl grid grid-cols-2 gap-gutter border-t border-border pt-xl md:grid-cols-4">
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">
                  {t('statCategoriesValue')}
                </span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">
                  {t('statCategoriesLabel')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">
                  {t('statComplianceValue')}
                </span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">
                  {t('statComplianceLabel')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">
                  {t('statSpeedValue')}
                </span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">
                  {t('statSpeedLabel')}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">
                  {t('statPriceValue')}
                </span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">
                  {t('statPriceLabel')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-bg-elevated py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <span className="mb-xl block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
              {t('processEyebrow')}
            </span>
            <div className="grid grid-cols-1 gap-xxl md:grid-cols-3">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.titleKey} className="flex flex-col gap-md">
                  <div className="flex items-center gap-md">
                    <span className="text-headline-lg font-bold text-text-primary/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <step.icon className="size-6 text-accent-signal" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-headline-md font-medium text-text-primary">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-body-md text-text-secondary">{t(step.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-xl text-center md:text-left">
              <span className="mb-sm block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
                {t('featuresEyebrow')}
              </span>
              <h2 className="text-headline-lg font-semibold text-text-primary">
                {t('featuresSectionTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="flex flex-col gap-sm rounded-xl border border-border p-lg transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  <feature.icon className="size-5 text-accent-signal" strokeWidth={1.5} />
                  <h4 className="text-headline-md font-medium text-text-primary">
                    {t(feature.titleKey)}
                  </h4>
                  <p className="text-body-md text-text-secondary">{t(feature.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="bg-bg-elevated py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-xl text-center">
              <span className="mb-sm block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
                {t('differentiatorsEyebrow')}
              </span>
              <h2 className="text-headline-lg font-semibold text-text-primary">
                {t('differentiatorsSectionTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
              {/* Fix it in code */}
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="p-lg">
                  <h5 className="mb-sm text-headline-md font-medium text-text-primary">
                    {t('diffCodeTitle')}
                  </h5>
                  <p className="text-body-md text-text-secondary">{t('diffCodeDesc')}</p>
                </div>
                <div className="h-48 overflow-hidden border-t border-border bg-bg-elevated p-md font-mono text-[13px] text-accent-signal/80">
                  <div className="mb-2 flex gap-2 opacity-60">
                    <div className="size-2 rounded-full bg-border-strong" />
                    <div className="size-2 rounded-full bg-text-muted" />
                    <div className="size-2 rounded-full bg-accent-signal" />
                  </div>
                  <pre>
                    <code>{`.hero-text {
  /* AI Refinement: Increased tracking */
  letter-spacing: -0.04em;
  /* AI Refinement: Contrast adjust */
  color: #e3e9f2;
  font-weight: 600;
  line-height: 1.1;
}`}</code>
                  </pre>
                </div>
              </div>

              {/* Analyze any live URL */}
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="p-lg">
                  <h5 className="mb-sm text-headline-md font-medium text-text-primary">
                    {t('diffUrlTitle')}
                  </h5>
                  <p className="text-body-md text-text-secondary">{t('diffUrlDesc')}</p>
                </div>
                <div className="px-md pb-md">
                  <div className="flex items-center gap-sm rounded-full border border-border bg-bg-elevated px-lg py-3">
                    <Lock className="size-4 text-text-secondary" strokeWidth={1.5} />
                    <span className="text-label-md text-text-secondary">
                      https://poisik.ai/audit/dash...
                    </span>
                  </div>
                  <div className="mt-md h-32 rounded-t-lg border-x border-t border-border bg-bg-elevated p-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="col-span-3 h-20 rounded bg-surface-hover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* See how you compare */}
              <div className="flex flex-col rounded-xl border border-border bg-surface p-lg">
                <h5 className="mb-sm text-headline-md font-medium text-text-primary">
                  {t('diffCompareTitle')}
                </h5>
                <p className="mb-lg text-body-md text-text-secondary">{t('diffCompareDesc')}</p>
                <div className="mt-auto space-y-md">
                  <div className="flex items-center justify-between text-label-md text-text-primary">
                    <span>{t('diffCompareYourDesign')}</span>
                    <span className="font-bold text-accent-signal">92/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-bg-elevated">
                    <div
                      className="h-full rounded-full bg-accent-signal"
                      style={{ width: '92%' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-label-md text-text-secondary opacity-70">
                    <span>{t('diffCompareIndustryAvg')}</span>
                    <span>74/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-bg-elevated">
                    <div
                      className="h-full rounded-full bg-border-strong"
                      style={{ width: '74%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-xxl">
          <div className="mx-auto max-w-7xl px-margin text-center">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-xxl">
              <h2 className="mb-md text-display-lg font-semibold text-text-primary">
                {t('finalCtaTitle')}
              </h2>
              <p className="mx-auto mb-xl max-w-xl text-body-lg text-text-secondary">
                {t('finalCtaDesc')}
              </p>
              <Link
                href="/demo"
                className="rounded-full bg-accent-signal px-xxl py-md text-body-md font-bold text-white transition-opacity hover:opacity-90"
              >
                {t('finalCtaButton')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-bg-elevated py-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-xl px-margin md:grid-cols-4">
          <div>
            <span className="mb-sm block text-headline-md font-bold lowercase tracking-tight text-text-primary">
              poisik
            </span>
            <p className="max-w-[220px] text-label-md text-text-secondary">{t('footerTagline')}</p>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerProductHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#features" className="transition-colors hover:text-accent-signal">
                  {n('features')}
                </a>
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
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerApiDocsLink')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerCompanyHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerAboutLink')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerBlogLink')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerCareersLink')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerLegalHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('terms')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerCookiePolicyLink')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-xl max-w-7xl border-t border-border px-margin pt-lg">
          <span className="text-label-sm text-text-secondary opacity-60">
            {t('footerCopyright')}
          </span>
        </div>
      </footer>
    </div>
  );
}
