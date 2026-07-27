'use client';

import { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
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
      toast.error(data.error ?? "Couldn't create the project — try again.");
      return;
    }
    const project = await res.json();
    toast.success(`"${project.name}" created.`);
    router.push(`/projects/${project.id}/analyze`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-lg text-left">
      <div className="space-y-sm">
        <label htmlFor="project-name" className="ml-1 block text-label-md text-text-secondary">
          Project name
        </label>
        <input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My SaaS Landing Page"
          required
          className="w-full rounded-lg border border-border bg-bg-elevated px-lg py-md text-body-md text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-signal focus:outline-none"
        />
      </div>

      {error && <p className="text-label-sm text-accent-signal">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal py-md text-label-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          'Creating...'
        ) : (
          <>
            Create project
            <ArrowRight className="size-4" strokeWidth={2} />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-xs pt-xs text-label-sm text-text-muted uppercase tracking-widest">
        <Lock className="size-3.5" strokeWidth={2} />
        Secure &amp; Private Workspace
      </div>
    </form>
  );
}
