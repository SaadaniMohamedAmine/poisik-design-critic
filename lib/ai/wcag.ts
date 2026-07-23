import { hex } from 'wcag-contrast';

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

export function checkContrast(foreground: string, background: string): ContrastCheck {
  const ratio = hex(foreground, background);

  return {
    foreground,
    background,
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}
