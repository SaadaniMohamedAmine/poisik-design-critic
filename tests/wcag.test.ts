import { describe, it, expect } from 'vitest';
import { checkContrast } from '@/lib/ai/wcag';

describe('WCAG contrast checks', () => {
  it('passes AA for #e3e9f2 on #0a0f16', () => {
    const result = checkContrast('#e3e9f2', '#0a0f16');
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    expect(result.passesAA).toBe(true);
  });

  it('fails AA for #87a1c5 on #ffffff', () => {
    const result = checkContrast('#87a1c5', '#ffffff');
    expect(result.ratio).toBeLessThan(4.5);
    expect(result.passesAA).toBe(false);
  });

  it('passes AAA for white on black', () => {
    const result = checkContrast('#ffffff', '#000000');
    expect(result.ratio).toBeGreaterThanOrEqual(7);
    expect(result.passesAAA).toBe(true);
  });

  it('fails AA for light gray on white', () => {
    const result = checkContrast('#cccccc', '#ffffff');
    expect(result.ratio).toBeLessThan(4.5);
    expect(result.passesAA).toBe(false);
    expect(result.passesAAA).toBe(false);
  });
});
