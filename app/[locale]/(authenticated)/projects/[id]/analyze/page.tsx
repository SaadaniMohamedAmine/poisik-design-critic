'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { UploadDropzone } from '@/components/poisik';
import { Link2, Lightbulb } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  async function createAnalysis(imageUrl: string) {
    setLoading(true);
    const toastId = toast.loading('Running your AI audit...');
    const res = await fetch(`/api/projects/${params.id}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      // The API route already sanitizes this — never the raw provider
      // error body. A toast is enough here; a failure also lands in the
      // notification bell (ANALYSIS_FAILED) so it isn't lost once the
      // toast auto-closes.
      const message =
        data.error === 'MONTHLY_LIMIT_REACHED'
          ? "You've reached your monthly analysis limit — upgrade to keep auditing."
          : (data.error ?? "The analysis didn't come back as expected — try again.");
      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 5000 });
      return;
    }
    const analysis = await res.json();
    toast.update(toastId, {
      render: 'Analysis complete — your report is ready.',
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
            Upload screenshot
          </button>
          <button
            disabled
            title="Coming soon — live URL analysis needs a screenshot-capture step that isn't wired up yet"
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-medium text-text-muted opacity-50"
          >
            <Link2 className="size-4" />
            Analyze a URL — coming soon
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-lg shadow-[inset_0_0_20px_rgba(98,148,218,0.05)]">
          <UploadDropzone onAnalyze={createAnalysis} />
          {loading && <p className="mt-md text-label-md text-text-secondary">Analyzing...</p>}
        </div>

        <div className="mt-lg flex items-start gap-md rounded-xl border border-border/50 bg-bg-elevated/50 p-md">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-signal" strokeWidth={1.5} />
          <p className="text-label-md text-text-secondary italic">{t('proTip')}</p>
        </div>
      </div>
    </div>
  );
}
