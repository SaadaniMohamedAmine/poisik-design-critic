'use client';

import { useEffect } from 'react';

/**
 * Global, event-delegated ripple effect. Mounted once at the root layout so
 * every <button> on the platform gets it automatically — no per-component
 * wiring needed. Uses `currentColor` so the ripple always matches the
 * button's own text color (white on filled accent buttons, accent-signal on
 * outline/ghost buttons, etc.).
 */
export function RippleEffect() {
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      const button = target?.closest('button') as HTMLElement | null;
      if (!button) return;
      if (button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const computedStyle = window.getComputedStyle(button);
      if (computedStyle.position === 'static') {
        button.style.position = 'relative';
      }
      if (computedStyle.overflow !== 'hidden') {
        button.style.overflow = 'hidden';
      }

      const ripple = document.createElement('span');
      ripple.className = 'poisik-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      const cleanup = () => ripple.remove();
      ripple.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 700);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
}
