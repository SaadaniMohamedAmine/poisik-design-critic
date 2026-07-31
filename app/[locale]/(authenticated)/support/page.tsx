import { LifeBuoy, Mail, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const FAQ_KEYS = [
  { q: 'faqQ1', a: 'faqA1' },
  { q: 'faqQ2', a: 'faqA2' },
  { q: 'faqQ3', a: 'faqA3' },
  { q: 'faqQ4', a: 'faqA4' },
] as const;

// No new nav link needed for this one — it's linked from the sidebar's
// "Support" line (see SidebarNav.tsx), same tier as Documentation.
export default async function SupportPage() {
  const t = await getTranslations('Support');
  const faq = FAQ_KEYS.map(({ q, a }) => ({ q: t(q), a: t(a) }));

  return (
    <div className="mx-auto max-w-160 space-y-xl">
      <div className="flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <LifeBuoy className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-xs text-body-md text-text-secondary">{t('subtitle')}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-lg">
        <h2 className="mb-md text-headline-md font-bold text-text-primary">
          {t('commonQuestions')}
        </h2>
        <div className="space-y-lg">
          {faq.map((item) => (
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
            <p className="text-label-md font-bold text-text-primary">{t('stillStuck')}</p>
            <p className="text-label-sm text-text-secondary">
              {t('emailUsPrefix')}{' '}
              <a href="mailto:support@poisik.ai" className="text-accent-signal hover:underline">
                support@poisik.ai
              </a>{' '}
              {t('emailUsSuffix')}
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
            <p className="text-label-md font-bold text-text-primary">{t('wantToUnderstand')}</p>
            <p className="text-label-sm text-text-secondary">{t('kbExplains')}</p>
          </div>
        </div>
        <Link
          href="/knowledge-base"
          className="shrink-0 rounded-xl border border-border-strong px-lg py-sm text-center text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover"
        >
          {t('openKnowledgeBase')}
        </Link>
      </section>
    </div>
  );
}
