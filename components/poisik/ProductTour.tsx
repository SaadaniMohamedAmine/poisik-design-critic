'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, X } from 'lucide-react';

export type TourStep = 1 | 2 | 3 | 4;

interface ProductTourProps {
  step: TourStep;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

// These ids are added directly to the real Sidebar / TopBarAuth DOM nodes —
// see Sidebar.tsx and UserDropdown.tsx. The tour spotlights the actual shell,
// not a mockup, so if those anchors ever get renamed this map needs updating.
const ANCHOR_IDS: Record<TourStep, string> = {
  1: 'tour-new-analysis',
  2: 'tour-projects-nav',
  3: 'tour-plan-usage',
  4: 'tour-avatar',
};

const CONTENT: Record<TourStep, { title: string; body: string }> = {
  1: {
    title: 'Start your first audit',
    body: 'Upload a screenshot or paste a live URL — your AI critique is ready in seconds.',
  },
  2: {
    title: 'Everything lives in a project',
    body: 'Group every analysis under a project to track its score over time.',
  },
  3: {
    title: 'Keep an eye on your quota',
    body: 'Track your monthly analysis credits here, and upgrade anytime.',
  },
  4: {
    title: 'Your account, one click away',
    body: 'Manage your profile, plan, and billing from here.',
  },
};

// Design reference: design_v3/product_tour_step_1..4 (Stitch LOT B) — the
// spotlight technique there used clip-path/mask math hand-tuned per mockup;
// here it's a single box with a huge `0 0 0 9999px` box-shadow, which
// achieves the same dimmed-everywhere-else effect but recomputes correctly
// from a live getBoundingClientRect() instead of hardcoded coordinates.
function useAnchorRect(id: string) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = document.getElementById(id);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [id]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    // Layout can shift a frame after mount (webfont swap, etc.) — one
    // delayed re-measure keeps the spotlight from freezing on a stale rect.
    const t = setTimeout(measure, 150);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      clearTimeout(t);
    };
  }, [measure]);

  return rect;
}

export function ProductTour({ step, onNext, onSkip, onFinish }: ProductTourProps) {
  const rect = useAnchorRect(ANCHOR_IDS[step]);

  // Null on the server (see useAnchorRect) and on mobile, where the sidebar
  // this tour targets is hidden entirely (`hidden lg:flex`) — OnboardingFlow
  // also skips straight past the tour on small screens, this is the
  // last-resort guard.
  if (!rect) return null;

  const { title, body } = CONTENT[step];
  const pad = 8;

  const spotlightStyle: CSSProperties = {
    position: 'fixed',
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    borderRadius: 12,
    border: '2px solid var(--color-accent-signal)',
    boxShadow: '0 0 0 9999px rgba(9,14,21,0.75), 0 0 20px rgba(98,148,218,0.3)',
    zIndex: 96,
    pointerEvents: 'none',
  };

  let tooltipStyle: CSSProperties = { position: 'fixed', zIndex: 97, width: 320 };
  if (step === 1) {
    // Anchor is now the floating SpeedDial FAB (bottom-right corner), not a
    // sidebar row — there's no room to its right or below, so the tooltip
    // opens to its left instead, bottom-aligned with the button.
    tooltipStyle = {
      ...tooltipStyle,
      right: window.innerWidth - rect.left + 24,
      bottom: window.innerHeight - rect.bottom,
    };
  } else if (step === 2) {
    tooltipStyle = { ...tooltipStyle, left: rect.right + 24, top: rect.top };
  } else if (step === 3) {
    tooltipStyle = {
      ...tooltipStyle,
      left: rect.left,
      top: rect.top - 16,
      transform: 'translateY(-100%)',
    };
  } else {
    tooltipStyle = { ...tooltipStyle, top: rect.bottom + 16, right: window.innerWidth - rect.right };
  }

  return (
    <>
      {/* Blocks interaction with the rest of the shell while the tour is
          active — the spotlight box above is transparent itself, its huge
          box-shadow only paints the dim tint, so a separate element is
          needed to actually intercept clicks. */}
      <div className="fixed inset-0 z-[95]" />
      <div style={spotlightStyle} />
      <div
        style={tooltipStyle}
        className="flex flex-col gap-md rounded-xl border border-border bg-bg-elevated p-lg shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-semibold tracking-wider text-text-secondary uppercase">
            Step {step} of 4
          </span>
          <button
            onClick={onSkip}
            aria-label="Close tour"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-sm">
          <h3 className="text-headline-sm font-bold text-text-primary">{title}</h3>
          <p className="text-body-md leading-relaxed text-text-secondary">{body}</p>
        </div>

        <div className="flex flex-col gap-lg pt-sm">
          <div className="flex gap-sm">
            {([1, 2, 3, 4] as TourStep[]).map((i) => (
              <div
                key={i}
                className={
                  i === step
                    ? 'size-1.5 rounded-full bg-accent-signal'
                    : 'size-1.5 rounded-full bg-border'
                }
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            {step < 4 ? (
              <>
                <button
                  onClick={onSkip}
                  className="text-label-md text-text-secondary transition-colors hover:text-text-primary"
                >
                  Skip tour
                </button>
                <button
                  onClick={onNext}
                  className="flex items-center gap-sm rounded-xl bg-accent-signal px-lg py-sm font-bold text-white shadow-lg shadow-accent-signal/10 transition-opacity hover:opacity-90"
                >
                  Next
                  <ArrowRight className="size-4" strokeWidth={2} />
                </button>
              </>
            ) : (
              <button
                onClick={onFinish}
                className="ml-auto rounded-xl bg-accent-signal px-lg py-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
