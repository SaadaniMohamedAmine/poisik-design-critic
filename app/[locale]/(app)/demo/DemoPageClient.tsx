'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ReportView } from '@/components/poisik/ReportView';
import type { AnalysisResult } from '@/lib/schemas';

const DEMO_RESULT_EN: AnalysisResult = {
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
      location: { x: 90, y: 56 },
    },
    {
      id: '2',
      category: 'spacing',
      severity: 'warning',
      title: 'Cramped Button Padding',
      description:
        "The 'Submit' button has insufficient internal spacing, leading to a low tap target quality for mobile users.",
      recommendation: 'Add minimum 16px horizontal and 12px vertical padding.',
      code_fix: {
        language: 'css',
        snippet: 'padding: 12px 16px;',
        before: 'padding: 4px 8px',
        after: 'padding: 12px 16px',
      },
      location: { x: 90, y: 50 },
    },
    {
      id: '3',
      category: 'consistency',
      severity: 'suggestion',
      title: 'Inconsistent Icon Weights',
      description:
        'Icons in the navigation bar use varying stroke widths, breaking visual consistency.',
      recommendation: 'Standardize all icons to a 1.5px stroke weight across the interface.',
      code_fix: {
        language: 'tailwind',
        snippet: 'stroke-[1.5px]',
        before: 'mixed stroke widths',
        after: '1.5px stroke',
      },
      location: { x: 90, y: 7 },
    },
  ],
};

const DEMO_RESULT_FR: AnalysisResult = {
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
      title: 'Ratio de contraste faible',
      description:
        'Le texte du CTA principal #87a1c5 sur #121a27 ne respecte pas les normes de contraste WCAG AA.',
      recommendation:
        'Augmentez la luminosité vers #e3e9f2 pour une meilleure lisibilité et la conformité WCAG.',
      code_fix: { language: 'hex', snippet: 'text-[#e3e9f2]', before: '#87a1c5', after: '#e3e9f2' },
      location: { x: 90, y: 56 },
    },
    {
      id: '2',
      category: 'spacing',
      severity: 'warning',
      title: 'Padding de bouton trop serré',
      description:
        'Le bouton « Envoyer » a un espacement interne insuffisant, réduisant la qualité de la zone tactile sur mobile.',
      recommendation: 'Ajoutez au minimum 16px de padding horizontal et 12px vertical.',
      code_fix: {
        language: 'css',
        snippet: 'padding: 12px 16px;',
        before: 'padding: 4px 8px',
        after: 'padding: 12px 16px',
      },
      location: { x: 90, y: 50 },
    },
    {
      id: '3',
      category: 'consistency',
      severity: 'suggestion',
      title: 'Épaisseurs d’icônes incohérentes',
      description:
        'Les icônes de la barre de navigation utilisent des épaisseurs de trait variables, ce qui casse la cohérence visuelle.',
      recommendation: 'Uniformisez toutes les icônes à une épaisseur de trait de 1,5px.',
      code_fix: {
        language: 'tailwind',
        snippet: 'stroke-[1.5px]',
        before: 'épaisseurs mixtes',
        after: 'trait de 1,5px',
      },
      location: { x: 90, y: 7 },
    },
  ],
};

export function DemoPageClient() {
  const t = useTranslations('Demo');
  const locale = useLocale();
  const demoResult = locale === 'fr' ? DEMO_RESULT_FR : DEMO_RESULT_EN;

  return (
    <div className="mx-auto max-w-[1280px] px-lg pb-24 pt-32">
      <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto mb-12 max-w-2xl text-center duration-700">
        <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-accent-signal">
          {t('eyebrow')}
        </p>
        <h1 className="mb-4 text-headline-lg font-bold text-text-primary">{t('title')}</h1>
        <p className="text-body-lg text-text-secondary">{t('subtitle')}</p>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-150 duration-700">
        <ReportView result={demoResult} isDemo />
      </div>
    </div>
  );
}
