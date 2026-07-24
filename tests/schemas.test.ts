import { describe, it, expect } from 'vitest';
import { AnalysisResultSchema } from '@/lib/schemas';

const validResult = {
  overall_score: 84,
  category_scores: {
    visual_hierarchy: 90,
    contrast: 65,
    spacing: 78,
    typography: 82,
    accessibility: 70,
    consistency: 95,
  },
  issues: [
    {
      id: '1',
      category: 'contrast',
      severity: 'critical',
      title: 'Low Contrast Ratio',
      description: 'The primary CTA text fails WCAG AA contrast standards.',
      recommendation: 'Increase brightness for better legibility.',
      location: { x: 50, y: 8 },
    },
  ],
};

describe('AI analysis schema validation', () => {
  it('validates a correct result', () => {
    const parsed = AnalysisResultSchema.safeParse(validResult);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing overall_score', () => {
    const { success } = AnalysisResultSchema.safeParse({
      ...validResult,
      overall_score: undefined,
    });
    expect(success).toBe(false);
  });

  it('rejects overall_score out of range', () => {
    const { success } = AnalysisResultSchema.safeParse({
      ...validResult,
      overall_score: 150,
    });
    expect(success).toBe(false);
  });

  it('rejects missing category', () => {
    const { success } = AnalysisResultSchema.safeParse({
      ...validResult,
      category_scores: { visual_hierarchy: 80 },
    });
    expect(success).toBe(false);
  });

  it('rejects invalid severity', () => {
    const { success } = AnalysisResultSchema.safeParse({
      ...validResult,
      issues: [
        {
          ...validResult.issues[0],
          severity: 'invalid',
        },
      ],
    });
    expect(success).toBe(false);
  });

  it('rejects location outside 0-100', () => {
    const { success } = AnalysisResultSchema.safeParse({
      ...validResult,
      issues: [
        {
          ...validResult.issues[0],
          location: { x: 150, y: 50 },
        },
      ],
    });
    expect(success).toBe(false);
  });
});
