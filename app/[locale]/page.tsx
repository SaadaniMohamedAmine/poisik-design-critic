'use client';

import { PoisikLogo, LanguageSwitcher } from '@/components/poisik';
import { ArrowRight, Eye, Contrast, Lightbulb } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Visual Hierarchy',
    description:
      'Heatmap analysis reveals where user attention actually flows. We detect noise and suggest structural shifts for better conversion.',
  },
  {
    icon: Contrast,
    title: 'WCAG Contrast',
    description:
      'Real-time accessibility checks for AA and AAA compliance. Automated color suggestions ensure every user can experience your vision.',
  },
  {
    icon: Lightbulb,
    title: 'Actionable Recommendations',
    description:
      'Not just problems — solutions. Get specific CSS tweaks and layout adjustments to resolve friction points instantly.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[100px] -right-[100px] h-[600px] w-[600px] rounded-full bg-accent-glow/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -left-[200px] h-[600px] w-[600px] rounded-full bg-accent-signal/5 blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
        <div className="flex items-center gap-xl">
          <PoisikLogo size="md" />
          <nav className="hidden items-center gap-lg md:flex">
            <a
              href="#"
              className="border-b-2 border-accent-signal pb-1 text-label-md font-medium text-accent-signal"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              Audit Logs
            </a>
            <a
              href="#"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              Knowledge Base
            </a>
            <a
              href="#"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              Settings
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <LanguageSwitcher />
          <a
            href="/upload"
            className="rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            Run New Audit
          </a>
        </div>
      </header>

      <main className="relative pt-20">
        <section className="mx-auto flex max-w-7xl flex-col items-center px-margin pt-xxl pb-xxl text-center overflow-hidden">
          <div className="z-10 max-w-3xl">
            <h1 className="mb-md bg-gradient-to-b from-text-primary to-accent-signal bg-clip-text text-display-lg font-semibold tracking-tight text-transparent md:text-[64px]">
              Design and Passion, with poise.
            </h1>
            <p className="mx-auto mb-xl max-w-2xl text-body-lg text-text-secondary">
              Get an expert-level UX/UI audit in seconds — no consultant required. Powered by AI
              trained on elite design patterns and accessibility standards.
            </p>
            <div className="flex flex-col items-center justify-center gap-md sm:flex-row">
              <a
                href="/upload"
                className="flex items-center gap-sm rounded-full bg-accent-signal px-xl py-md text-body-md font-bold text-white transition-transform hover:scale-105"
              >
                Analyze your design
                <ArrowRight className="size-5" />
              </a>
              <a
                href="/demo"
                className="rounded-full border border-border px-xl py-md text-body-md font-medium text-text-primary transition-colors hover:bg-surface"
              >
                View Sample Audit
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-container-low py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-xl flex flex-col items-center text-center">
              <span className="mb-sm text-label-md font-bold uppercase tracking-[0.2em] text-accent-signal">
                Capabilities
              </span>
              <h2 className="text-headline-lg font-semibold text-text-primary">
                Comprehensive design oversight
              </h2>
            </div>
            <div className="grid gap-lg md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-start gap-md rounded-xl border border-border bg-surface/70 p-xl backdrop-blur-lg transition-all hover:-translate-y-1 hover:border-border-strong hover:bg-surface-hover"
                >
                  <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface text-accent-signal">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="text-headline-md font-medium text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-body-md text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-xxl">
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface/70 p-xxl text-center backdrop-blur-lg">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div
                className="size-full"
                style={{
                  backgroundImage: 'radial-gradient(circle, #1d2b3f 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>
            <h2 className="mb-md text-display-lg font-semibold text-text-primary">
              Ready for professional clarity?
            </h2>
            <p className="mx-auto mb-xl max-w-xl text-body-lg text-text-secondary">
              Join over 450+ senior design leads who use Poisik to validate their interface
              decisions before going to code.
            </p>
            <div className="flex flex-col items-center justify-center gap-md sm:flex-row">
              <a
                href="/upload"
                className="rounded-full bg-accent-signal px-xxl py-md text-body-md font-bold text-white transition-opacity hover:opacity-90"
              >
                Start Your First Audit
              </a>
              <span className="text-label-md text-text-muted">
                Free 7-day trial. No credit card required.
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-md border-t border-border px-margin py-xl md:flex-row">
        <div className="flex flex-col items-center gap-xs md:items-start">
          <span className="text-label-md font-bold text-text-primary">Poisik AI</span>
          <span className="text-label-sm text-text-muted opacity-60">
            &copy; 2024 Poisik AI. All rights reserved.
          </span>
        </div>
        <div className="flex gap-lg">
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Security
          </a>
          <a
            href="#"
            className="text-label-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Status
          </a>
        </div>
      </footer>
    </div>
  );
}
