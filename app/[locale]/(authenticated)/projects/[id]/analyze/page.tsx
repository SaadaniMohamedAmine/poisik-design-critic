'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { UploadDropzone } from '@/components/poisik/UploadDropzone';
import { UpgradeModal } from '@/components/poisik/UpgradeModal';
import { Link2, Lightbulb, CloudOff, Zap, RefreshCw } from 'lucide-react';
import type { Plan } from '@/lib/plans';

type AnalysisError = { kind: 'limit' | 'api'; message: string; imageUrl: string };

// Design reference: design_v1/upload_design_poisik ("Analyze Interface").
// The mockup's own top nav/footer are the app's real chrome elsewhere
// (Sidebar/TopBarAuth already render around this page) so only the content
// column is reproduced: the display-size headline, ambient background
// blobs, the "ai-glow" inset shadow on the upload card, and the pro-tip
// callout — all copy already existed in messages/en.json (`Upload.*`) from
// an earlier pass but wasn't wired into the actual layout or into
// UploadDropzone (which had the matching English strings hardcoded
// instead); both are now driven by the same translations. Kept the
// Upload/URL toggle, which isn't in the mockup — it's real, honest product
// state (URL analysis is disabled pending a screenshot-capture step), not
// something to drop for fidelity.
export default function ProjectAnalyzePage() {
  const t = useTranslations('Upload');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const plan = ((session?.user as { plan?: string } | undefined)?.plan ?? 'FREE') as Plan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function createAnalysis(imageUrl: string) {
    setLoading(true);
    setError(null);
    const toastId = toast.loading(t('toastRunning'));
    const res = await fetch(`/api/projects/${params.id}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      const isLimit = data.error === 'MONTHLY_LIMIT_REACHED';
      // The API route already sanitizes this — never the raw provider
      // error body.
      const message = isLimit ? t('errorLimitReached') : (data.error ?? t('errorGeneric'));
      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 5000 });
      // The toast auto-closes and is easy to miss; a failure also lands in
      // the notification bell (ANALYSIS_FAILED), but a persistent inline
      // card with a real retry affordance (design_v1/system_status_poisik)
      // is the honest fix here rather than making the user re-select the
      // file from scratch.
      setError({ kind: isLimit ? 'limit' : 'api', message, imageUrl });
      return;
    }
    const analysis = await res.json();
    toast.update(toastId, {
      render: t('toastComplete'),
      type: 'success',
      isLoading: false,
      autoClose: 4000,
    });
    router.push(`/report/${analysis.id}`);
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent-signal/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-accent-signal/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-xl text-center">
          <h1 className="mb-sm text-display-lg font-bold text-text-primary">{t('title')}</h1>
          <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
        </div>

        <div className="mb-lg flex rounded-lg border border-border bg-surface p-1">
          <button className="flex-1 rounded-md bg-accent-signal px-4 py-2 text-label-md font-medium text-white transition-colors">
            {t('uploadTab')}
          </button>
          <button
            disabled
            title={t('urlTabTooltip')}
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-medium text-text-muted opacity-50"
          >
            <Link2 className="size-4" />
            {t('urlTab')}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-lg shadow-[inset_0_0_20px_rgba(98,148,218,0.05)]">
          <UploadDropzone onAnalyze={createAnalysis} />
          {loading && <p className="mt-md text-label-md text-text-secondary">{t('analyzing')}</p>}
        </div>

        {error && (
          <div
            className={`mt-lg flex flex-col gap-md rounded-xl border p-lg sm:flex-row sm:items-start ${
              error.kind === 'limit'
                ? 'border-border bg-surface'
                : 'border-accent-signal/20 bg-accent-soft-bg'
            }`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                error.kind === 'limit' ? 'bg-bg-elevated' : 'bg-accent-signal/10'
              }`}
            >
              {error.kind === 'limit' ? (
                <Zap className="size-5 text-text-secondary" strokeWidth={1.5} />
              ) : (
                <CloudOff className="size-5 text-accent-signal" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-label-md font-bold text-text-primary">
                {error.kind === 'limit' ? t('outOfCredits') : t('analysisFailed')}
              </h3>
              <p className="mt-xs text-body-md text-text-secondary">{error.message}</p>
            </div>
            {error.kind === 'limit' ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="shrink-0 self-start rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                {t('upgradeToPro')}
              </button>
            ) : (
              <button
                onClick={() => createAnalysis(error.imageUrl)}
                disabled={loading}
                className="flex shrink-0 items-center justify-center gap-sm self-start rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold whitespace-nowrap text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw className="size-4" strokeWidth={2} />
                {t('retryAnalysis')}
              </button>
            )}
          </div>
        )}

        <div className="mt-lg flex items-start gap-md rounded-xl border border-border/50 bg-bg-elevated/50 p-md">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
          <p className="text-label-md text-text-secondary italic">{t('proTip')}</p>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} plan={plan} />
    </div>
  );
}
