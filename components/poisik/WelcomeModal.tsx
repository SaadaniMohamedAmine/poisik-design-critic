'use client';

import { Sparkles, Upload, X, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export type WelcomeStep = 0 | 1 | 2;

interface WelcomeModalProps {
  step: WelcomeStep;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

function ProgressDots({ step }: { step: WelcomeStep }) {
  return (
    <div className="flex gap-sm">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={
            i === step
              ? 'size-2.5 rounded-full bg-accent-signal'
              : 'size-2.5 rounded-full border border-border'
          }
        />
      ))}
    </div>
  );
}

// Design reference: design_v3/onboarding_welcome_to_poisik,
// onboarding_how_it_works, onboarding_you_re_all_set (Stitch LOT A).
export function WelcomeModal({ step, onNext, onBack, onSkip, onFinish }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-bg-base/80 p-md backdrop-blur-md">
      <div className="relative w-full max-w-[560px] rounded-xl border border-border bg-bg-elevated p-margin shadow-[0_0_40px_-10px_rgba(95,156,242,0.15)]">
        <button
          onClick={onSkip}
          aria-label="Skip onboarding"
          className="absolute top-md right-md rounded-lg p-1 text-text-muted transition-colors hover:text-accent-signal"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>

        {step === 0 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-lg flex size-16 items-center justify-center rounded-xl border border-border bg-bg-base">
              <Sparkles className="size-8 text-accent-signal" strokeWidth={1.5} />
            </div>
            <h1 className="mb-md text-headline-lg font-bold tracking-tight text-text-primary">
              Welcome to poisik
            </h1>
            <p className="mb-xl max-w-[420px] text-body-lg leading-relaxed text-text-secondary">
              Your AI-powered design critic — precise, fast, and built for people who ship.
            </p>
            <button
              onClick={onNext}
              className="mb-md w-full rounded-lg bg-accent-signal py-md font-bold text-white shadow-lg shadow-accent-signal/10 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Next
            </button>
            <button
              onClick={onSkip}
              className="mb-xl text-label-md text-text-muted transition-colors hover:text-accent-signal"
            >
              Skip intro
            </button>
            <ProgressDots step={step} />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-lg">
            <h2 className="text-headline-md font-semibold tracking-tight text-text-primary">
              Three steps to a sharper design
            </h2>

            <div className="flex flex-col gap-md">
              {[
                {
                  icon: Upload,
                  label: 'Upload',
                  desc: 'Drop a screenshot or paste a live URL',
                },
                {
                  icon: Sparkles,
                  label: 'AI Analysis',
                  desc: 'Our engine audits accessibility, hierarchy, and consistency',
                },
                {
                  icon: CheckCircle2,
                  label: 'Report',
                  desc: 'Get a scored, actionable breakdown in seconds',
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-md">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded border border-border bg-border/30 text-accent-signal">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-md font-semibold text-text-primary">{label}</span>
                    <p className="text-label-md text-text-secondary">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-md pt-1">
              <button
                onClick={onNext}
                className="w-full rounded-lg bg-accent-signal py-md font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Next
              </button>
              <button
                onClick={onBack}
                className="text-label-md text-text-muted transition-colors hover:text-accent-signal hover:underline"
              >
                Back
              </button>
              <ProgressDots step={step} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-xl">
              <h1 className="mb-sm text-headline-lg font-bold tracking-tight text-text-primary">
                You&apos;re all set
              </h1>
              <p className="text-body-md text-text-secondary">
                Create your first project to run your first audit.
              </p>
            </div>

            <button
              onClick={onFinish}
              className="group mb-xl flex h-14 w-full items-center justify-center gap-sm rounded-lg bg-accent-signal px-lg font-bold text-white shadow-lg shadow-accent-signal/10 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Create your first project
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mb-xl grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs rounded-lg border border-border bg-border/10 p-md transition-colors hover:bg-border/20">
                <div className="mb-1 flex items-center gap-sm">
                  <Zap className="size-4 text-text-primary" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold tracking-wider text-text-primary uppercase">
                    AI Powered
                  </span>
                </div>
                <p className="text-label-sm font-medium text-text-muted">Real-time heuristics</p>
              </div>
              <div className="flex flex-col gap-xs rounded-lg border border-border bg-border/10 p-md transition-colors hover:bg-border/20">
                <div className="mb-1 flex items-center gap-sm">
                  <CheckCircle2 className="size-4 text-text-primary" strokeWidth={1.5} />
                  <span className="text-[11px] font-semibold tracking-wider text-text-primary uppercase">
                    Standardized
                  </span>
                </div>
                <p className="text-label-sm font-medium text-text-muted">WCAG &amp; ISO Ready</p>
              </div>
            </div>

            <div className="flex justify-center">
              <ProgressDots step={step} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
