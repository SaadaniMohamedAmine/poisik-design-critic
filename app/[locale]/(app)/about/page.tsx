import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'The story and mission behind Poisik, the AI-powered design audit platform.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">About Poisik</h1>
      <p className="mb-xl text-body-lg text-text-secondary">
        Poisik was built on a simple belief: every product deserves an expert design review, not
        just the ones with a design team on staff.
      </p>

      <div className="space-y-lg text-body-md text-text-secondary">
        <p>
          Great UX/UI design is judged on hundreds of small decisions — contrast ratios, spacing
          rhythm, type hierarchy, accessibility affordances — that are easy to get wrong and
          expensive to get reviewed. Most teams either skip that review entirely or wait weeks for a
          senior designer&apos;s attention.
        </p>
        <p>
          We built Poisik to close that gap. Upload a screenshot or point us at a live URL, and our
          AI design auditor delivers the kind of structured, actionable critique a senior product
          designer would give — visual hierarchy, contrast, spacing, typography, consistency, and
          accessibility — usually in under a minute.
        </p>
        <p>
          Poisik isn&apos;t meant to replace designers. It&apos;s meant to give every team,
          regardless of size or budget, a fast first pass so the humans in the room can spend their
          time on the decisions that actually need judgment.
        </p>
      </div>

      <div className="mt-xxl border-t border-border pt-xl">
        <h2 className="mb-md text-headline-md font-semibold text-text-primary">
          What we care about
        </h2>
        <ul className="space-y-md text-body-md text-text-secondary">
          <li>
            <span className="font-semibold text-text-primary">Speed.</span> Design feedback is most
            useful before you&apos;ve shipped, not after.
          </li>
          <li>
            <span className="font-semibold text-text-primary">Specificity.</span> Generic advice
            doesn&apos;t fix anything — every finding comes with a concrete recommendation.
          </li>
          <li>
            <span className="font-semibold text-text-primary">Accessibility.</span> A design that
            only works for some users isn&apos;t a finished design.
          </li>
        </ul>
      </div>
    </main>
  );
}
