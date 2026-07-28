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
import type { Category } from '@/lib/schemas';

interface CategoryGuide {
  key: Category;
  icon: LucideIcon;
  label: string;
  description: string;
  tips: string[];
}

// Real product documentation, not marketing copy — every claim here matches
// what the AI analysis pipeline actually does (lib/ai/prompt.ts's category
// set, lib/schemas.ts's severity levels and optional code_fix), so this
// page can't drift into promising something the tool doesn't deliver.
const CATEGORIES: CategoryGuide[] = [
  {
    key: 'visual_hierarchy',
    icon: Layers,
    label: 'Visual Hierarchy',
    description:
      'How clearly the design guides the eye toward what matters most. Primary actions, headlines, and key information should stand out through size, weight, contrast, and placement — not compete with everything else on the screen.',
    tips: [
      'Give each screen one dominant call-to-action',
      'Size and weight text according to its importance, not habit',
      'Group related elements tightly, separate unrelated ones clearly',
    ],
  },
  {
    key: 'contrast',
    icon: Contrast,
    label: 'Contrast',
    description:
      'Whether text and interactive elements are legible against their background — both for general readability and for WCAG accessibility compliance.',
    tips: [
      'Aim for at least 4.5:1 contrast ratio for body text',
      "Don't rely on color alone to convey meaning (add icons or text)",
      'Re-check contrast separately in light and dark states',
    ],
  },
  {
    key: 'spacing',
    icon: Ruler,
    label: 'Spacing',
    description:
      'Consistency and rhythm in padding, margins, and gaps. Cramped or uneven spacing reads as unpolished even when every individual element is well designed.',
    tips: [
      'Use a consistent spacing scale (e.g. 4 / 8 / 16 / 24px) instead of arbitrary values',
      'Give related elements less space between them than unrelated ones',
      "Don't let touch targets crowd each other on mobile layouts",
    ],
  },
  {
    key: 'typography',
    icon: Type,
    label: 'Typography',
    description:
      'Font choices, sizing scale, line height, and hierarchy — whether text is easy to scan and comfortable to read at every size it appears in.',
    tips: [
      'Limit a single screen to 2–3 font weights',
      'Keep body text line length between 45–75 characters',
      'Use a defined type scale instead of ad-hoc font sizes',
    ],
  },
  {
    key: 'accessibility',
    icon: Accessibility,
    label: 'Accessibility',
    description:
      'Everything beyond contrast: alt text, visible focus states, touch target size, and whether the interface works for people using assistive technology.',
    tips: [
      'Every interactive element needs a visible focus state',
      'Touch targets should be at least 44×44px',
      'Icon-only buttons need an accessible label, not just a tooltip',
    ],
  },
  {
    key: 'consistency',
    icon: Shapes,
    label: 'Consistency',
    description:
      'Whether components, patterns, and interactions repeat predictably across the interface, instead of reinventing the same button or flow differently on every screen.',
    tips: [
      'Reuse the same button, badge, and card styles everywhere they apply',
      'Keep icon style consistent (stroke width, fill, size)',
      'Match interaction patterns app-wide (e.g. how every modal closes)',
    ],
  },
];

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-xl">
      <div className="flex items-center gap-md">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated">
          <BookOpen className="size-5 text-accent-signal" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary">Knowledge Base</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            How Poisik scores a design, and what each category is actually looking for.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface p-lg">
        <h2 className="mb-sm text-headline-md font-bold text-text-primary">How scoring works</h2>
        <p className="mb-lg text-body-md text-text-secondary">
          Every analysis gets an overall score from 0 to 100, built from the six category scores
          below. Alongside the score, each issue found is tagged with one of three severities:
        </p>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
          <div className="rounded-lg border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 p-md">
            <div className="mb-xs flex items-center gap-xs text-[#ffb4ab]">
              <AlertCircle className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">Critical</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Usability or accessibility problems worth fixing immediately.
            </p>
          </div>
          <div className="rounded-lg border border-[#f3bf4f]/20 bg-[#f3bf4f]/10 p-md">
            <div className="mb-xs flex items-center gap-xs text-[#f3bf4f]">
              <AlertTriangle className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">Warning</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Noticeable inconsistencies or missed best practices.
            </p>
          </div>
          <div className="rounded-lg border border-accent-signal/20 bg-accent-soft-bg p-md">
            <div className="mb-xs flex items-center gap-xs text-accent-signal">
              <Sparkles className="size-4" strokeWidth={1.5} />
              <span className="text-label-md font-bold">Suggestion</span>
            </div>
            <p className="text-label-sm text-text-secondary">
              Polish-level improvements — nice to have, not urgent.
            </p>
          </div>
        </div>
        <p className="mt-lg text-body-md text-text-secondary">
          Where a fix is concrete enough to express in code (a color, spacing, or type value),
          the issue includes a copy-pasteable snippet on the report page instead of just a
          description.
        </p>
      </section>

      <section>
        <h2 className="mb-md text-headline-md font-bold text-text-primary">The 6 categories</h2>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          {CATEGORIES.map((cat) => (
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
                  <li key={tip} className="flex items-start gap-xs text-label-sm text-text-secondary">
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
