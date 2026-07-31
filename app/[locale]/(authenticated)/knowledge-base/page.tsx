import {
  BookOpen,
  Layers,
  Contrast,
  Ruler,
  Type,
  Accessibility,
  Shapes,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Category } from '@/lib/schemas';

interface CategoryMeta {
  key: Category;
  icon: LucideIcon;
  // Prefix used to look up this category's `KnowledgeBase` translation keys
  // (`${prefix}Label`, `${prefix}Desc`, `${prefix}Tip1..3`).
  prefix: string;
}

// Real product documentation, not marketing copy — every claim here matches
// what the AI analysis pipeline actually does (lib/ai/prompt.ts's category
// set, lib/schemas.ts's severity levels and optional code_fix), so this
// page can't drift into promising something the tool doesn't deliver.
const CATEGORIES: CategoryMeta[] = [
  { key: 'visual_hierarchy', icon: Layers, prefix: 'visualHierarchy' },
  { key: 'contrast', icon: Contrast, prefix: 'contrast' },
  { key: 'spacing', icon: Ruler, prefix: 'spacing' },
  { key: 'typography', icon: Type, prefix: 'typography' },
  { key: 'accessibility', icon: Accessibility, prefix: 'accessibility' },
  { key: 'consistency', icon: Shapes, prefix: 'consistency' },
];

export default async function KnowledgeBasePage() {
  const t = await getTranslations('KnowledgeBase');
  const categories = CATEGORIES.map((cat) => ({
    ...cat,
    label: t(`${cat.prefix}Label`),
    description: t(`${cat.prefix}Desc`),
    tips: [t(`${cat.prefix}Tip1`), t(`${cat.prefix}Tip2`), t(`${cat.prefix}Tip3`)],
  }));

  return (
    <div className="space-y-xl">
      <div className="flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <BookOpen className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-xs text-body-md text-text-secondary">{t('subtitle')}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-lg">
        <h2 className="mb-sm text-headline-md font-bold text-text-primary">
          {t('howScoringWorksTitle')}
        </h2>
        <p className="mb-lg text-body-md text-text-secondary">{t('howScoringWorksDesc')}</p>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
          <div className="rounded-lg border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 p-md">
            <div className="mb-xs flex items-center gap-xs text-[#ffb4ab]">
              <AlertCircle className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">{t('criticalLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('criticalDesc')}</p>
          </div>
          <div className="rounded-lg border border-[#f3bf4f]/20 bg-[#f3bf4f]/10 p-md">
            <div className="mb-xs flex items-center gap-xs text-[#f3bf4f]">
              <AlertTriangle className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">{t('warningLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('warningDesc')}</p>
          </div>
          <div className="rounded-lg border border-accent-signal/20 bg-accent-soft-bg p-md">
            <div className="mb-xs flex items-center gap-xs text-accent-signal">
              <Sparkles className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">{t('suggestionLabel')}</span>
            </div>
            <p className="text-label-sm text-text-secondary">{t('suggestionDesc')}</p>
          </div>
        </div>
        <p className="mt-lg text-body-md text-text-secondary">{t('codeFixNote')}</p>
      </section>

      <section>
        <h2 className="mb-md text-headline-md font-bold text-text-primary">
          {t('categoriesTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.key} className="rounded-xl border border-border bg-surface p-lg">
              <div className="mb-sm flex items-center gap-sm">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                  <cat.icon className="size-4 text-accent-signal" strokeWidth={1.5} />
                </div>
                <h3 className="text-label-lg font-bold text-text-primary">{cat.label}</h3>
              </div>
              <p className="mb-md text-body-md text-text-secondary">{cat.description}</p>
              <ul className="space-y-xs">
                {cat.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-xs text-label-sm text-text-secondary"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent-signal" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
