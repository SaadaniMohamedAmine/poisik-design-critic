'use client';

import { ReportView } from '@/components/poisik/ReportView';
import type { AnalysisResult } from '@/lib/schemas';

const DEMO_RESULT: AnalysisResult = {
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
      description: 'The primary CTA text #87a1c5 on #121a27 fails WCAG AA contrast standards.',
      recommendation: 'Increase brightness to #e3e9f2 for better legibility and WCAG compliance.',
      code_fix: { language: 'hex', snippet: 'text-[#e3e9f2]', before: '#87a1c5', after: '#e3e9f2' },
      location: { x: 50, y: 8 },
    },
    {
      id: '2',
      category: 'spacing',
      severity: 'warning',
      title: 'Cramped Button Padding',
      description:
        "The 'Submit' button has insufficient internal spacing, leading to a low tap target quality for mobile users.",
      recommendation: 'Add minimum 16px horizontal and 12px vertical padding.',
      code_fix: { language: 'css', snippet: 'padding: 12px 16px;', before: 'padding: 4px 8px', after: 'padding: 12px 16px' },
      location: { x: 25, y: 35 },
    },
    {
      id: '3',
      category: 'consistency',
      severity: 'suggestion',
      title: 'Inconsistent Icon Weights',
      description:
        'Icons in the navigation bar use varying stroke widths, breaking visual consistency.',
      recommendation: 'Standardize all icons to a 1.5px stroke weight across the interface.',
      code_fix: { language: 'tailwind', snippet: 'stroke-[1.5px]', before: 'mixed stroke widths', after: '1.5px stroke' },
      location: { x: 20, y: 15 },
    },
  ],
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <ReportView result={DEMO_RESULT} isReadOnly />
    </div>
  );
}
