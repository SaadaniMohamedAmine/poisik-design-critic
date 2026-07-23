'use client';

import { cn } from '@/lib/utils';

interface AnnotationMarkerProps {
  number: number;
  x: number;
  y: number;
  className?: string;
  onClick?: () => void;
}

export function AnnotationMarker({ number, x, y, className, onClick }: AnnotationMarkerProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'absolute flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-accent-signal bg-accent-signal text-xs font-bold text-white shadow-[0_0_0_4px_rgba(98,148,218,0.2)] transition-transform hover:scale-110',
        className
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {number}
    </div>
  );
}
