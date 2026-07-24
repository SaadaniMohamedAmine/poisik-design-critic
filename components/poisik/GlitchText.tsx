'use client';

import { useEffect, useRef } from 'react';

export function GlitchText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.92) {
        container.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
        container.style.opacity = '0.7';
        setTimeout(() => {
          container.style.transform = 'translate(0, 0)';
          container.style.opacity = '1';
        }, 80);
      }
    }, 150);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative mb-lg select-none" ref={containerRef}>
      <h1
        className="relative text-[120px] font-black leading-none tracking-tighter text-border-strong/30 md:text-[200px]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {text}
      </h1>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(29, 43, 63, 0.15) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(98, 148, 218, 0.1), transparent)',
          animationDuration: '3s',
        }}
      />
    </div>
  );
}
