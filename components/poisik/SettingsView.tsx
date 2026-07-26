'use client';

import { useState, type FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { User, CreditCard, ShieldAlert, Lock, Download, Settings as SettingsIcon } from 'lucide-react';
import { PlanUsageWidget } from './PlanUsageWidget';

type Tab = 'profile' | 'billing' | 'danger';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'danger', label: 'Danger zone', icon: ShieldAlert },
];

interface SettingsViewProps {
  initialName: string | null;
  email: string;
  image: string | null;
  plan: string;
  remaining: number | null;
  limit: number | null;
  hasStripeCustomer: boolean;
}

// Design reference: design_v2/settings_profile, design_v3/settings_profile,
// settings_billing, settings_danger_zone (Stitch mockups). Kept the tabbed
// structure and card layout, but adapted to what's real here: no avatar
// upload (image comes from the OAuth provider, read-only), no "Linked
// Accounts" tab (Poisik only has Google/Credentials sign-in, nothing to
// list), and Billing has no fake payment-method list or invoice history —
// those live in the real Stripe Customer Portal, linked via "Manage
// subscription" rather than reproduced with placeholder data. Danger zone
// drops the mockup's decorative "Status Archive"/"Account Protection" cards
// since neither is backed by real tracked data.
export function SettingsView({
  initialName,
  email,
  image,
  plan,
  remaining,
  limit,
  hasStripeCustomer,
}: SettingsViewProps) {
  const { update } = useSession();
  const [tab, setTab] = useState<Tab>('profile');

  // --- Profile: name edit ---
  const [name, setName] = useState(initialName ?? '');
  const [savedName, setSavedName] = useState(initialName ?? '');
  const [savingName, setSavingName] = useState(false);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === savedName) return;
    setSavingName(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error();
      await update({ name: trimmed });
      setSavedName(trimmed);
      toast.success('Profile updated.');
    } catch {
      toast.error("Couldn't save your name — please try again.");
    } finally {
      setSavingName(false);
    }
  }

  // --- Billing: Stripe customer portal ---
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      window.location.assign(data.url);
    } catch {
      toast.error("Couldn't open the billing portal — please try again.");
      setPortalLoading(false);
    }
  }

  // --- Danger zone ---
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/account');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'poisik-account-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (!res.ok) {
      setDeleting(false);
      toast.error('Something went wrong deleting your account. Please try again.');
      return;
    }
    await signOut({ callbackUrl: '/' });
  }

  return (
    <div>
      <div className="mb-xl flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <SettingsIcon className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">Settings</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            Manage your profile, plan, and data.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-lg lg:flex-row lg:gap-xl">
        {/* Horizontal scrollable pills on mobile, vertical list from lg up. */}
        <nav className="flex gap-xs overflow-x-auto pb-xs lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-md rounded-xl px-md py-md text-label-md whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-accent-soft-bg text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <Icon className="size-4" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 max-w-2xl flex-1">
          {tab === 'profile' && (
            <div className="space-y-lg rounded-xl border border-border bg-surface p-lg">
              <div>
                <h2 className="text-headline-md font-bold text-text-primary">Profile</h2>
                <p className="mt-xs text-label-md text-text-secondary">
                  This is how you appear across Poisik.
                </p>
              </div>

              <div className="flex items-center gap-lg border-y border-border/60 py-lg">
                <div className="size-16 shrink-0 overflow-hidden rounded-full border border-border bg-accent-soft-bg">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- OAuth-provider avatar URL, not a static local asset
                    <img src={image} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-headline-md text-text-primary">
                      {(savedName || email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-body-md font-bold text-text-primary">
                    {savedName || 'Unnamed'}
                  </p>
                  <span className="mt-xs inline-block rounded-full border border-border-strong px-md py-1 text-label-sm font-bold tracking-widest text-text-primary uppercase">
                    {plan}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveName} className="space-y-md">
                <div className="space-y-xs">
                  <label htmlFor="full-name" className="text-label-md text-text-primary">
                    Full name
                  </label>
                  <input
                    id="full-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-border bg-bg-elevated p-md text-body-md text-text-primary transition-colors focus:border-accent-signal focus:outline-none"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md text-text-primary">Email address</label>
                  <div className="relative">
                    <input
                      readOnly
                      value={email}
                      className="w-full cursor-not-allowed rounded-xl border border-border/60 bg-bg-base p-md text-body-md text-text-muted"
                    />
                    <Lock
                      className="absolute top-1/2 right-md size-4 -translate-y-1/2 text-text-muted"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-label-sm text-text-muted">
                    Email is tied to your sign-in method and can&apos;t be changed here.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingName || !name.trim() || name.trim() === savedName}
                    className="w-full rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
                  >
                    {savingName ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-lg">
              <div className="rounded-xl border border-border bg-surface p-lg">
                <h2 className="text-headline-md font-bold text-text-primary">Plan &amp; usage</h2>
                <p className="mt-xs text-label-md text-text-secondary">
                  Your current subscription and monthly analysis quota.
                </p>
              </div>

              <PlanUsageWidget plan={plan} remaining={remaining} limit={limit} />

              {plan !== 'FREE' && hasStripeCustomer && (
                <div className="rounded-xl border border-border bg-surface p-lg">
                  <h3 className="text-body-lg font-bold text-text-primary">
                    Payments &amp; invoices
                  </h3>
                  <p className="mt-xs text-label-md text-text-secondary">
                    Update your payment method, download invoices, or cancel your plan securely
                    through Stripe.
                  </p>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="mt-md w-full rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover disabled:opacity-50 sm:w-auto"
                  >
                    {portalLoading ? 'Opening...' : 'Manage subscription'}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'danger' && (
            <div className="space-y-lg">
              <div className="space-y-md rounded-xl border border-border bg-surface p-lg">
                <div>
                  <h2 className="text-headline-md font-bold text-text-primary">
                    Export your data
                  </h2>
                  <p className="mt-xs text-label-md text-text-secondary">
                    Download a JSON archive of your projects, analyses, and account details.
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex w-full items-center justify-center gap-sm rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover disabled:opacity-50 sm:w-auto"
                >
                  <Download className="size-4" strokeWidth={1.5} />
                  {exporting ? 'Preparing...' : 'Export my data'}
                </button>
              </div>

              <div className="space-y-md rounded-xl border border-border-strong bg-surface p-lg">
                <div>
                  <h2 className="text-headline-md font-bold text-text-primary">Delete account</h2>
                  <p className="mt-xs text-label-md text-text-secondary">
                    This permanently deletes your account, projects, and analyses. This cannot be
                    undone.
                  </p>
                </div>
                {!confirmOpen ? (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="w-full rounded-xl border border-border-strong px-lg py-sm text-label-md font-bold text-text-primary transition-colors hover:bg-surface-hover sm:w-auto"
                  >
                    Delete my account
                  </button>
                ) : (
                  <div className="flex flex-col gap-md sm:flex-row sm:items-center">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-xl bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
