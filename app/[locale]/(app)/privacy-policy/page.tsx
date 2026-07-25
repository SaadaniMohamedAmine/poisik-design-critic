import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Poisik collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">Privacy Policy</h1>
      <p className="mb-xl text-label-md text-text-secondary">Last updated: July 25, 2026</p>

      <div className="space-y-xl text-body-md text-text-secondary">
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            1. Information we collect
          </h2>
          <p>
            When you create an account, we collect your name, email address, and authentication
            details. When you use Poisik to analyze a design, we process the screenshots or URLs you
            submit, along with the resulting analysis, in order to generate and store your reports.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            2. How we use your information
          </h2>
          <p>
            We use your information to provide and improve the Poisik service: authenticating your
            account, running design analyses, storing your project history, processing billing
            through our payment provider, and communicating important account or service updates.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            3. Uploaded content
          </h2>
          <p>
            Screenshots and designs you upload are used solely to generate your analysis and are
            stored under your account so you can revisit past reports. We do not use your uploaded
            content to train third-party AI models, and we do not sell your content or personal data
            to anyone.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            4. Third-party services
          </h2>
          <p>
            We rely on trusted third parties to operate Poisik, including cloud hosting, database
            storage, payment processing, and AI providers used to generate design critiques. These
            providers only receive the data necessary to perform their function.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">
            5. Data retention and deletion
          </h2>
          <p>
            You can export or permanently delete your account and all associated data at any time
            from your account settings. Deletion removes your projects, analyses, and personal
            information from our systems.
          </p>
        </section>
        <section>
          <h2 className="mb-sm text-headline-md font-semibold text-text-primary">6. Contact</h2>
          <p>
            Questions about this policy or your data can be sent to our support team through the
            contact options listed on this site.
          </p>
        </section>
      </div>
    </main>
  );
}
