'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }
    const project = await res.json();
    router.push(`/projects/${project.id}/analyze`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
      <div className="flex gap-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My SaaS Landing Page"
          required
          className="flex-1 rounded-lg border border-border bg-surface px-md py-sm text-body-md text-text-primary placeholder:text-text-muted focus:border-accent-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
      {error && <p className="text-label-sm text-accent-signal">{error}</p>}
    </form>
  );
}
