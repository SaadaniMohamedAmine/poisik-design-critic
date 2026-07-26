'use client';

import { useCallback, useEffect, useState } from 'react';
import { WelcomeModal, type WelcomeStep } from './WelcomeModal';
import { ProductTour, type TourStep } from './ProductTour';

type Phase = 'welcome' | 'how' | 'set' | 'tour1' | 'tour2' | 'tour3' | 'tour4' | null;

const WELCOME_STEP: Record<'welcome' | 'how' | 'set', WelcomeStep> = {
  welcome: 0,
  how: 1,
  set: 2,
};

const TOUR_STEP: Record<'tour1' | 'tour2' | 'tour3' | 'tour4', TourStep> = {
  tour1: 1,
  tour2: 2,
  tour3: 3,
  tour4: 4,
};

// Mounted once in AppShell for brand-new users (server-gated by
// `!user.onboardingCompletedAt`). Owns the 7-screen sequence end to end:
// welcome modal (3 steps, design_v3 LOT A) -> product tour (4 steps, LOT B).
// Skipping at any point, or finishing the last tour step, both call
// /api/onboarding/complete so this never shows again for that account.
export function OnboardingFlow({ show }: { show: boolean }) {
  const [phase, setPhase] = useState<Phase>(show ? 'welcome' : null);
  // The tour spotlights the sidebar, which is `hidden lg:flex` — on mobile
  // there's nothing to point at, so mobile users only get the welcome modal.
  const [canTour, setCanTour] = useState(false);

  useEffect(() => {
    setCanTour(window.innerWidth >= 1024);
  }, []);

  useEffect(() => {
    if (phase === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [phase]);

  const complete = useCallback(() => {
    setPhase(null);
    fetch('/api/onboarding/complete', { method: 'PATCH' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') complete();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, complete]);

  if (phase === null) return null;

  if (phase === 'welcome' || phase === 'how' || phase === 'set') {
    return (
      <WelcomeModal
        step={WELCOME_STEP[phase]}
        onNext={() => setPhase(phase === 'welcome' ? 'how' : 'set')}
        onBack={() => setPhase('welcome')}
        onSkip={complete}
        onFinish={() => (canTour ? setPhase('tour1') : complete())}
      />
    );
  }

  return (
    <ProductTour
      step={TOUR_STEP[phase]}
      onNext={() =>
        setPhase(phase === 'tour1' ? 'tour2' : phase === 'tour2' ? 'tour3' : 'tour4')
      }
      onSkip={complete}
      onFinish={complete}
    />
  );
}
