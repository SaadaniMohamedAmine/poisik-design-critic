'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleExport() {
    const res = await fetch('/api/account');
    if (!res.ok) {
      setActionError('Could not export your data. Please try again.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poisik-account-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (!res.ok) {
      setDeleting(false);
      setActionError('Something went wrong deleting your account. Please try again.');
      return;
    }
    await signOut({ callbackUrl: '/' });
  }

  return (
    <div className="max-w-2xl space-y-xl">
      <h1 className="text-headline-lg font-semibold text-text-primary">Settings</h1>

      <section className="space-y-sm rounded-xl border border-border bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Profile</h2>
        <p className="text-body-md text-text-secondary">{session?.user?.name ?? '—'}</p>
        <p className="text-body-md text-text-secondary">{session?.user?.email}</p>
        <p className="text-label-sm text-text-muted">
          Plan: {(session?.user as { plan?: string })?.plan ?? 'FREE'}
        </p>
        {(session?.user as { plan?: string })?.plan &&
          (session?.user as { plan?: string })?.plan !== 'FREE' && (
            <button
              onClick={async () => {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'portal' }),
                });
                const data = await res.json();
                if (data.url) window.location.assign(data.url);
              }}
              className="mt-sm rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              Manage subscription
            </button>
          )}
      </section>

      <section className="space-y-md rounded-xl border border-border bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Your data</h2>
        <button
          onClick={handleExport}
          className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
        >
          Export my data
        </button>
      </section>

      {actionError && <p className="text-label-sm text-accent-signal">{actionError}</p>}

      <section className="space-y-md rounded-xl border border-border-strong bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Delete account</h2>
        <p className="text-body-md text-text-secondary">
          This permanently deletes your account, projects, and analyses. This cannot be undone.
        </p>
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex items-center gap-md">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, permanently delete'}
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              className="text-label-md text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
