import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Poisik uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">Cookie Policy</h1>
      <p className="mb-xl text-label-md text-text-secondary">Last updated: July 25, 2026</p>

      <div className="space-y-xl text-body-md text-text-secondary">
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            1. What cookies we use
          </h2>
          <p>
            Poisik uses a small number of essential cookies to keep you signed in and to remember
            your preferred language. These cookies are required for the service to function and
            cannot be disabled while remaining signed in.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            2. Why we use them
          </h2>
          <ul className="list-disc space-y-sm pl-lg">
            <li>
              <span className="font-semibold text-text-primary">Session cookies</span> keep you
              authenticated across pages so you don&apos;t have to sign in repeatedly.
            </li>
            <li>
              <span className="font-semibold text-text-primary">Preference cookies</span> remember
              settings like your selected language (English or French).
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            3. Third-party cookies
          </h2>
          <p>
            Our payment provider may set its own cookies during checkout to process your
            subscription securely. We do not use third-party advertising or tracking cookies.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            4. Managing cookies
          </h2>
          <p>
            Most browsers let you block or delete cookies through their settings. Because Poisik
            relies on essential cookies for authentication, blocking them will prevent you from
            staying signed in.
          </p>
        </section>
      </div>
    </main>
  );
}
