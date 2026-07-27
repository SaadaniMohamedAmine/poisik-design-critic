import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the team building Poisik, the AI-powered design audit platform.',
};

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">Careers</h1>
      <p className="mb-xl text-body-lg text-text-secondary">
        We&apos;re a small team building the design-review tool we always wished we had. There are
        no open roles listed today, but we&apos;re always happy to hear from people who care about
        design quality and craft.
      </p>

      <div className="space-y-lg text-body-md text-text-secondary">
        <p>
          Poisik is early — which means the next few hires will shape how we build product, talk to
          users, and think about design quality at scale. If that sounds interesting, reach out and
          tell us what you&apos;d want to work on.
        </p>
      </div>

      <div className="mt-xxl rounded-xl border border-border bg-surface p-xl text-center">
        <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
          No open positions right now
        </h2>
        <p className="text-body-md text-text-secondary">
          Check back later, or follow our blog for updates on when we start hiring.
        </p>
      </div>
    </main>
  );
}
