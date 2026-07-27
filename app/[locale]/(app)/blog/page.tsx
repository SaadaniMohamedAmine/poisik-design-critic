import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes on design systems, accessibility, and building Poisik.',
};

const POSTS = [
  {
    title: 'Why contrast ratio is the highest-leverage design fix you can make',
    excerpt:
      'A one-line color change is often the single biggest accessibility and readability win available to any product team. Here is how we prioritize contrast findings in every audit.',
    date: 'Coming soon',
  },
  {
    title: 'The design review most teams skip — and how to automate it',
    excerpt:
      'Spacing rhythm and typographic hierarchy rarely get dedicated review time. We break down what a senior designer actually looks for, and why it is teachable.',
    date: 'Coming soon',
  },
  {
    title: 'Building Poisik: designing an AI critique that designers trust',
    excerpt:
      'Getting an AI model to give feedback that reads like it came from a senior designer, not a linter, took more prompt iteration than we expected.',
    date: 'Coming soon',
  },
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-4xl px-margin pt-32 pb-xxl">
      <h1 className="mb-md text-display-lg font-semibold text-text-primary">Blog</h1>
      <p className="mb-xl text-body-lg text-text-secondary">
        Notes on design systems, accessibility, and what we&apos;re learning building Poisik.
      </p>

      <div className="space-y-lg">
        {POSTS.map((post) => (
          <article
            key={post.title}
            className="cursor-pointer rounded-xl border border-border bg-surface p-lg transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            <span className="text-label-sm font-bold uppercase tracking-widest text-accent-signal">
              {post.date}
            </span>
            <h2 className="mt-sm mb-sm text-headline-md font-semibold text-text-primary">
              {post.title}
            </h2>
            <p className="text-body-md text-text-secondary">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
