import { LifeBuoy, Mail, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const FAQ = [
  {
    q: 'What image formats can I upload?',
    a: 'JPG, PNG, and WebP, up to 10MB per screenshot — the same limits shown on the New Analysis page.',
  },
  {
    q: 'Is my uploaded design private?',
    a: "Yes. Every analysis is private by default and only visible to you. It's only reachable by anyone else after you explicitly click \"Share Report\" on that report's page.",
  },
  {
    q: 'Can I cancel my plan anytime?',
    a: 'Yes — manage or cancel your subscription anytime from Settings → Billing, via the Stripe customer portal. No lock-in period.',
  },
  {
    q: "What happens if an analysis fails?",
    a: "If an analysis fails partway through, the credit it would have used is refunded automatically — you won't lose a slot on a failed run.",
  },
];

// No new nav link needed for this one — it's linked from the sidebar's
// "Support" line (see SidebarNav.tsx), same tier as Documentation.
export default function SupportPage() {
  return (
    <div className="mx-auto max-w-160 space-y-xl">
      <div className="flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <LifeBuoy className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">Support</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            Need help? Check the answers below, or reach out directly.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-lg">
        <h2 className="mb-md text-headline-md font-bold text-text-primary">Common questions</h2>
        <div className="space-y-lg">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="mb-xs text-label-lg font-bold text-text-primary">{item.q}</h3>
              <p className="text-body-md text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-md rounded-xl border border-border bg-surface p-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-md">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
            <Mail className="size-4 text-accent-signal" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-label-md font-bold text-text-primary">Still stuck?</p>
            <p className="text-label-sm text-text-secondary">
              Email us at{' '}
              <a href="mailto:support@poisik.ai" className="text-accent-signal hover:underline">
                support@poisik.ai
              </a>{' '}
              — we usually reply within a day.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-md rounded-xl border border-accent-signal/20 bg-accent-soft-bg p-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-md">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
            <BookOpen className="size-4 text-accent-signal" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-label-md font-bold text-text-primary">
              Want to understand your score?
            </p>
            <p className="text-label-sm text-text-secondary">
              The Knowledge Base explains each category and how scoring works.
            </p>
          </div>
        </div>
        <Link
          href="/knowledge-base"
          className="shrink-0 rounded-xl border border-border-strong px-lg py-sm text-center text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover"
        >
          Open Knowledge Base
        </Link>
      </section>
    </div>
  );
}
