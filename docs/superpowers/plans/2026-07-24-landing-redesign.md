# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraint for this project:** no command or file change runs without the user's explicit go-ahead first. Pause before `git push` and show the user what is about to run. This plan intentionally does NOT push or open a PR at the end — the user described this as "the first commit" of a broader redesign effort (branch `feat-redesign-app-part-2`), so more work is coming before a PR is opened.

**Goal:** replace the current landing page (`app/[locale]/page.tsx`) with the new, richer design the user supplied (full-page screenshot + a Stitch-generated `code.html` + `design/luxe_intelligence_audit/DESIGN.md`), translated into this codebase's actual conventions — real design tokens, next-intl translations, existing shared components, lucide-react icons.

**Architecture:** One cohesive page composition (`app/[locale]/page.tsx`), following this codebase's existing convention of large single-file page/view components (e.g. `components/poisik/ReportView.tsx` is 279 lines) rather than splitting into many small section components that aren't reused elsewhere. All copy goes through `next-intl` (`useTranslations`), all colors/spacing/radius through the existing design tokens in `app/globals.css` (no new tokens needed — everything the new design calls for already exists), all icons through `lucide-react`.

**Tech Stack:** Next.js 16 (App Router), next-intl, Tailwind CSS v4 (tokens already wired in `app/globals.css`), shadcn/ui, lucide-react.

## Global Constraints

- Package manager: **pnpm** throughout.
- **No other hue anywhere in the product** — monochrome navy family only (per `features/00-design-system-reference.md`). The source mockup's "Fix it in code" card uses red/amber/blue macOS-style traffic-light dots — **user decision: render these three dots in monochrome navy tones instead** (`bg-border-strong`, `bg-text-muted`, `bg-accent-signal` — do not use red/amber/green anywhere).
- Icons: **lucide-react only** — the source mockup uses Google "Material Symbols" icon names (`upload_file`, `search_check`, etc.); every one must be mapped to an existing `lucide-react` icon (mapping table is in Task 3 below). Do not add any other icon package.
- All existing design tokens already exist in `app/globals.css` and must be reused as-is — do not add new CSS custom properties for this task. Reference table (already wired, confirmed by reading the file):
  - Colors: `bg-bg-base`, `bg-bg-elevated`, `bg-surface`, `bg-surface-hover`, `border-border`, `border-border-strong`, `text-text-muted`, `text-text-secondary`, `text-text-primary`, `bg-accent-signal` / `text-accent-signal`, `bg-accent-signal-hover`, `bg-accent-glow` / `text-accent-glow`, `bg-accent-soft-bg`
  - Spacing (already custom utilities, do NOT use raw Tailwind `p-4` etc. for these — use the named ones for consistency with existing code): `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (48px), `xxl` (80px), `gutter` (24px), `margin` (32px) — usable as `p-xl`, `gap-lg`, `px-margin`, etc.
  - Radius: `rounded-sm` (0.125rem), `rounded-md` (0.375rem), `rounded-lg` (0.5rem), `rounded-xl` (0.75rem), `rounded-2xl` (1rem), `rounded-3xl` (1.5rem), `rounded-full` (Tailwind default)
  - Font sizes: `text-display-lg` (48px), `text-headline-lg` (32px), `text-headline-md` (24px), `text-headline-sm` (20px), `text-body-lg` (18px), `text-body-md` (16px), `text-label-md` (14px), `text-label-sm` (12px) — combine with separate `font-semibold`/`font-medium`/`tracking-tight`/etc. utilities, matching how `app/[locale]/page.tsx` currently does it (there is no single composite "typography style" utility in this codebase).
  - Container width: `max-w-7xl` (1280px) + `px-margin`, matching the mockup's `max-w-[1280px]` and the current page's own convention.
- No drop shadows — depth via borders (`border-border` / `border-border-strong`) and surface layering, per the design system. (The mockup's hero image container does use `shadow-2xl` in the source HTML — this plan omits it, using the border-based approach instead, consistent with the rest of the app and with `features/00-design-system-reference.md`'s elevation rules.)
- `href` links: follow the CURRENT codebase's existing convention of plain `<a href="...">` tags (not `next/link`, not locale-prefixed manually) — this matches every link already in `app/[locale]/page.tsx`. Do not introduce `next/link` in this task; that would be an unrelated change outside this task's scope.
- i18n: every user-facing string goes through `useTranslations`. Decorative/example-only content that isn't meant to be understood as real UI copy (the CSS code snippet, the example URL string, the mini-browser skeleton blocks) does NOT need translation — it's illustrative, not literal product copy.
- `features/`, `design/` are read-only references — must be untouched by any task's diff.
- Definition of Done:
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` all exit 0
  - `pnpm dev`, visit `/en` and `/fr`, visually compare against the supplied screenshot — every section present, no missing translations (no raw key names rendered), hero image renders
  - `grep -rn '#[0-9a-fA-F]\{3,6\}' app/\[locale\]/page.tsx` returns nothing (no raw hex, tokens only)
  - No new hue introduced anywhere (spot-check: only navy-family colors used, confirmed by reading the final diff)

---

### Task 1: Translation keys (`messages/en.json`, `messages/fr.json`)

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/fr.json`

**Interfaces:**
- Produces: every `Navigation.*` and `Landing.*` key Task 3 consumes via `useTranslations('Navigation')` / `useTranslations('Landing')`.

- [ ] **Step 1: Add two new keys to the existing `Navigation` object in both files**

`messages/en.json`, inside the existing `"Navigation": { ... }` object, add (don't remove or rename any existing key — `upload/page.tsx` also reads from this namespace):
```json
"features": "Features",
"demo": "Demo"
```

`messages/fr.json`, same object:
```json
"features": "Fonctionnalités",
"demo": "Démo"
```

- [ ] **Step 2: Add new keys to the existing `Landing` object in both files**

`messages/en.json`, inside the existing `"Landing": { ... }` object, add all of these (leave every existing key untouched — some, like `tagline` and `cta`, are reused as-is by the new page; the rest below are new):
```json
"heroSubtitle": "The authoritative AI auditing platform for senior designers. Precise insights, clear metrics, and sophisticated feedback for your most critical products.",
"viewLiveExample": "See a live example",
"heroImageAlt": "Poisik audit dashboard showing a usability score and design issue breakdown",
"statCategoriesValue": "6",
"statCategoriesLabel": "Categories analyzed",
"statComplianceValue": "WCAG 2.1 AA",
"statComplianceLabel": "Compliance checked",
"statSpeedValue": "<10s",
"statSpeedLabel": "Average analysis time",
"statPriceValue": "$0",
"statPriceLabel": "To get started",
"processEyebrow": "Process",
"processStep1Title": "Upload assets",
"processStep1Desc": "Drop your Figma frames, PNGs, or live URLs directly into the audit engine.",
"processStep2Title": "AI Processing",
"processStep2Desc": "Our vision models analyze every pixel against established design systems and WCAG rules.",
"processStep3Title": "Fix & Export",
"processStep3Desc": "Receive a detailed report with specific action items to perfect your design's poise.",
"featuresEyebrow": "What we check",
"featuresSectionTitle": "Six categories, zero guesswork.",
"feature1Title": "Visual Hierarchy",
"feature1Desc": "Ensuring the most important information is seen first through luminance and scale.",
"feature2Title": "Contrast",
"feature2Desc": "Automated WCAG 2.1 compliance checks for every color pair across your entire UI.",
"feature3Title": "Spacing",
"feature3Desc": "Precision 8pt grid alignment detection to identify visual \"noise\" and misalignments.",
"feature4Title": "Typography",
"feature4Desc": "Auditing font-weights, line-heights, and readability for a premium reading experience.",
"feature5Title": "Accessibility",
"feature5Desc": "Going beyond color to check focus states, touch targets, and ARIA labels.",
"feature6Title": "Consistency",
"feature6Desc": "Detecting component deviations to maintain a cohesive brand voice throughout.",
"differentiatorsEyebrow": "Beyond Critique",
"differentiatorsSectionTitle": "It doesn't just tell you what's wrong — it fixes it.",
"diffCodeTitle": "Fix it in code",
"diffCodeDesc": "Export optimized CSS and Tailwind tokens for every detected improvement.",
"diffUrlTitle": "Analyze any live URL",
"diffUrlDesc": "Paste a link and watch Poisik crawl and audit your production site in seconds.",
"diffCompareTitle": "See how you compare",
"diffCompareDesc": "Benchmark your scores against industry leaders and competitor benchmarks.",
"diffCompareYourDesign": "Your Design",
"diffCompareIndustryAvg": "Industry Avg",
"finalCtaTitle": "Don't take our word for it",
"finalCtaDesc": "Experience the precision of the world's most sophisticated design auditor. Upload your first file and see the difference.",
"finalCtaButton": "Try the live demo",
"footerTagline": "Auditing the world's finest digital products with absolute poise.",
"footerProductHeading": "Product",
"footerCompanyHeading": "Company",
"footerLegalHeading": "Legal",
"footerPricingLink": "Pricing",
"footerApiDocsLink": "API Docs",
"footerAboutLink": "About",
"footerBlogLink": "Blog",
"footerCareersLink": "Careers",
"footerCookiePolicyLink": "Cookie Policy",
"footerCopyright": "© 2024 poisik. All rights reserved."
```

`messages/fr.json`, same object, French translations (professional/senior-consultant tone per `features/00-design-system-reference.md` — no exclamation marks, no cheerleading, no emoji):
```json
"heroSubtitle": "La plateforme d'audit IA de référence pour les designers seniors. Des analyses précises, des métriques claires et un retour sophistiqué pour vos produits les plus critiques.",
"viewLiveExample": "Voir un exemple concret",
"heroImageAlt": "Tableau de bord d'audit Poisik affichant un score d'utilisabilité et la répartition des problèmes de design",
"statCategoriesValue": "6",
"statCategoriesLabel": "Catégories analysées",
"statComplianceValue": "WCAG 2.1 AA",
"statComplianceLabel": "Conformité vérifiée",
"statSpeedValue": "<10s",
"statSpeedLabel": "Temps d'analyse moyen",
"statPriceValue": "0 €",
"statPriceLabel": "Pour commencer",
"processEyebrow": "Processus",
"processStep1Title": "Importez vos fichiers",
"processStep1Desc": "Déposez vos frames Figma, PNG ou URLs directement dans le moteur d'audit.",
"processStep2Title": "Traitement par l'IA",
"processStep2Desc": "Nos modèles de vision analysent chaque pixel selon les design systems établis et les règles WCAG.",
"processStep3Title": "Corrigez et exportez",
"processStep3Desc": "Recevez un rapport détaillé avec des actions précises pour parfaire la poise de votre design.",
"featuresEyebrow": "Ce que nous vérifions",
"featuresSectionTitle": "Six catégories, aucune approximation.",
"feature1Title": "Hiérarchie visuelle",
"feature1Desc": "Garantir que l'information la plus importante est perçue en premier, grâce à la luminance et à l'échelle.",
"feature2Title": "Contraste",
"feature2Desc": "Vérifications automatisées de conformité WCAG 2.1 pour chaque paire de couleurs de votre interface.",
"feature3Title": "Espacement",
"feature3Desc": "Détection précise de l'alignement sur grille de 8pt pour identifier le bruit visuel et les désalignements.",
"feature4Title": "Typographie",
"feature4Desc": "Audit des graisses, interlignages et de la lisibilité pour une expérience de lecture premium.",
"feature5Title": "Accessibilité",
"feature5Desc": "Au-delà de la couleur : états de focus, zones tactiles et libellés ARIA.",
"feature6Title": "Cohérence",
"feature6Desc": "Détection des écarts entre composants pour une identité de marque cohérente.",
"differentiatorsEyebrow": "Au-delà de la critique",
"differentiatorsSectionTitle": "Il ne se contente pas de dire ce qui ne va pas — il le corrige.",
"diffCodeTitle": "Corrigez-le dans le code",
"diffCodeDesc": "Exportez du CSS optimisé et des tokens Tailwind pour chaque amélioration détectée.",
"diffUrlTitle": "Analysez n'importe quelle URL en ligne",
"diffUrlDesc": "Collez un lien et laissez Poisik explorer et auditer votre site en production en quelques secondes.",
"diffCompareTitle": "Comparez vos résultats",
"diffCompareDesc": "Comparez vos scores à ceux des leaders du secteur et de vos concurrents.",
"diffCompareYourDesign": "Votre design",
"diffCompareIndustryAvg": "Moyenne du secteur",
"finalCtaTitle": "Ne nous croyez pas sur parole",
"finalCtaDesc": "Découvrez la précision de l'auditeur de design le plus sophistiqué au monde. Importez votre premier fichier et voyez la différence.",
"finalCtaButton": "Essayer la démo en direct",
"footerTagline": "L'audit des meilleurs produits digitaux au monde, avec une poise absolue.",
"footerProductHeading": "Produit",
"footerCompanyHeading": "Entreprise",
"footerLegalHeading": "Mentions légales",
"footerPricingLink": "Tarifs",
"footerApiDocsLink": "Documentation API",
"footerAboutLink": "À propos",
"footerBlogLink": "Blog",
"footerCareersLink": "Carrières",
"footerCookiePolicyLink": "Politique de cookies",
"footerCopyright": "© 2024 poisik. Tous droits réservés."
```

- [ ] **Step 3: Verify both files are valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))" && echo OK`
Run: `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json'))" && echo OK`
Expected: both print `OK`.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/fr.json
git commit -m "feat(landing): add translation keys for redesigned landing page"
```

---

### Task 2: Hero image asset

**Files:**
- Rename: `public/unnamed.jpg` → `public/hero-dashboard.jpg`

**Interfaces:**
- Produces: `/hero-dashboard.jpg` — the exact path Task 3's `next/image` `src` uses.

- [ ] **Step 1: Rename the file**

```bash
git mv public/unnamed.jpg public/hero-dashboard.jpg
```

- [ ] **Step 2: Confirm dimensions**

Run: `node -e "const fs=require('fs');const b=fs.readFileSync('public/hero-dashboard.jpg');let i=2;while(i<b.length){if(b[i]!==0xFF){i++;continue;}const m=b[i+1];if(m===0xC0||m===0xC2){console.log(b.readUInt16BE(i+7),'x',b.readUInt16BE(i+5));break;}i+=2+b.readUInt16BE(i+2);}"`
Expected: `512 x 279`. Task 3's `<Image>` `width`/`height` props must match these exact values (512×279) so Next.js doesn't warn about aspect ratio mismatch.

Note for your report: this source image is fairly low-resolution (512×279) for a hero visual that will render at a much larger display width. It will look acceptable but not razor-sharp when scaled up — flag this in your report as a known limitation, not something to silently "fix" (there's no higher-res version available right now).

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(landing): rename hero image asset for clarity"
```
(The `git mv` in Step 1 already stages the rename; this commits it.)

---

### Task 3: Rebuild `app/[locale]/page.tsx`

**Files:**
- Modify: `app/[locale]/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: every key from Task 1 (`Navigation.features`, `Navigation.demo`, and all new `Landing.*` keys, plus the pre-existing `Landing.tagline`, `Landing.cta`, `Landing.footerRights`-style keys where explicitly reused below), `/hero-dashboard.jpg` from Task 2, existing components `PoisikLogo` and `LanguageSwitcher` from `@/components/poisik` (already exported via `components/poisik/index.ts` — confirmed by the current file's import), existing design tokens from `app/globals.css` (see Global Constraints table — nothing new to add).
- Produces: the redesigned landing page — this is the final consumer in this plan, nothing downstream depends on new exports from this file.

**Icon mapping (Material Symbols name in the source mockup → lucide-react import), import all of these from `'lucide-react'`:**
| Mockup icon | lucide-react |
|---|---|
| `arrow_right` (implicit, existing CTA arrow) | `ArrowRight` |
| `upload_file` | `Upload` |
| `search_check` | `Search` |
| `check_circle` | `CheckCircle2` |
| `account_tree` | `Network` |
| `contrast` | `Contrast` |
| `straighten` | `Ruler` |
| `match_case` | `Type` |
| `accessibility` | `Accessibility` |
| `auto_awesome` | `Sparkles` |
| `lock` | `Lock` |

- [ ] **Step 1: Read the current file once more**

Open `app/[locale]/page.tsx` to confirm it still matches what this task assumes (imports, structure) before replacing it — in particular confirm `PoisikLogo` and `LanguageSwitcher` are still exported from `@/components/poisik`.

- [ ] **Step 2: Replace the full file content**

Replace `app/[locale]/page.tsx` with exactly this:

```tsx
'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PoisikLogo, LanguageSwitcher } from '@/components/poisik';
import {
  ArrowRight,
  Upload,
  Search,
  CheckCircle2,
  Network,
  Contrast,
  Ruler,
  Type,
  Accessibility,
  Sparkles,
  Lock,
} from 'lucide-react';

const PROCESS_STEPS = [
  { icon: Upload, titleKey: 'processStep1Title', descKey: 'processStep1Desc' },
  { icon: Search, titleKey: 'processStep2Title', descKey: 'processStep2Desc' },
  { icon: CheckCircle2, titleKey: 'processStep3Title', descKey: 'processStep3Desc' },
] as const;

const FEATURES = [
  { icon: Network, titleKey: 'feature1Title', descKey: 'feature1Desc' },
  { icon: Contrast, titleKey: 'feature2Title', descKey: 'feature2Desc' },
  { icon: Ruler, titleKey: 'feature3Title', descKey: 'feature3Desc' },
  { icon: Type, titleKey: 'feature4Title', descKey: 'feature4Desc' },
  { icon: Accessibility, titleKey: 'feature5Title', descKey: 'feature5Desc' },
  { icon: Sparkles, titleKey: 'feature6Title', descKey: 'feature6Desc' },
] as const;

export default function LandingPage() {
  const t = useTranslations('Landing');
  const n = useTranslations('Navigation');

  return (
    <div className="min-h-screen bg-bg-base text-text-primary antialiased">
      <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base/80 px-margin backdrop-blur-md">
        <div className="flex items-center gap-xl">
          <PoisikLogo size="md" />
          <nav className="hidden items-center gap-lg md:flex">
            <a
              href="#features"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              {n('features')}
            </a>
            <a
              href="/demo"
              className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
            >
              {n('demo')}
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <span className="hidden rounded-full border border-border px-md py-xs text-label-sm font-medium text-text-secondary md:inline">
            {n('freePlan')}
          </span>
          <LanguageSwitcher />
          <a
            href="/upload"
            className="rounded-full bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            {t('cta')}
          </a>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden pt-xxl pb-xxl text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-[600px] w-[600px] rounded-full bg-accent-signal/10 blur-[120px]" />
          </div>
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-md text-display-lg font-semibold tracking-tight text-text-primary md:text-[64px]">
                {t('tagline')}
              </h1>
              <p className="mx-auto mb-xl max-w-2xl text-body-lg text-text-secondary">
                {t('heroSubtitle')}
              </p>
              <div className="mb-xxl flex flex-col items-center justify-center gap-md sm:flex-row">
                <a
                  href="/upload"
                  className="rounded bg-accent-signal px-xl py-md text-body-md font-bold text-white transition-transform hover:scale-105"
                >
                  {t('cta')}
                </a>
                <a
                  href="/demo"
                  className="flex items-center gap-sm rounded border border-border px-xl py-md text-body-md font-medium text-text-primary transition-colors hover:bg-surface"
                >
                  {t('viewLiveExample')}
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 -z-10 rounded-xl bg-accent-signal/10 blur-[100px]" />
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <Image
                  src="/hero-dashboard.jpg"
                  alt={t('heroImageAlt')}
                  width={512}
                  height={279}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-xxl grid grid-cols-2 gap-gutter border-t border-border pt-xl md:grid-cols-4">
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">{t('statCategoriesValue')}</span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">{t('statCategoriesLabel')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">{t('statComplianceValue')}</span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">{t('statComplianceLabel')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">{t('statSpeedValue')}</span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">{t('statSpeedLabel')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-headline-md font-bold text-accent-signal">{t('statPriceValue')}</span>
                <span className="text-label-sm uppercase tracking-widest text-text-secondary">{t('statPriceLabel')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-bg-elevated py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <span className="mb-xl block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
              {t('processEyebrow')}
            </span>
            <div className="grid grid-cols-1 gap-xxl md:grid-cols-3">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.titleKey} className="flex flex-col gap-md">
                  <div className="flex items-center gap-md">
                    <span className="text-headline-lg font-bold text-text-primary/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <step.icon className="size-6 text-accent-signal" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-headline-md font-medium text-text-primary">{t(step.titleKey)}</h3>
                  <p className="text-body-md text-text-secondary">{t(step.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-xl text-center md:text-left">
              <span className="mb-sm block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
                {t('featuresEyebrow')}
              </span>
              <h2 className="text-headline-lg font-semibold text-text-primary">{t('featuresSectionTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.titleKey}
                  className="flex flex-col gap-sm rounded-xl border border-border p-lg transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  <feature.icon className="size-5 text-accent-signal" strokeWidth={1.5} />
                  <h4 className="text-headline-md font-medium text-text-primary">{t(feature.titleKey)}</h4>
                  <p className="text-body-md text-text-secondary">{t(feature.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="bg-bg-elevated py-xxl">
          <div className="mx-auto max-w-7xl px-margin">
            <div className="mb-xl text-center">
              <span className="mb-sm block text-label-sm font-bold uppercase tracking-[0.2em] text-accent-signal">
                {t('differentiatorsEyebrow')}
              </span>
              <h2 className="text-headline-lg font-semibold text-text-primary">{t('differentiatorsSectionTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
              {/* Fix it in code */}
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="p-lg">
                  <h5 className="mb-sm text-headline-md font-medium text-text-primary">{t('diffCodeTitle')}</h5>
                  <p className="text-body-md text-text-secondary">{t('diffCodeDesc')}</p>
                </div>
                <div className="h-48 overflow-hidden border-t border-border bg-bg-elevated p-md font-mono text-[13px] text-accent-signal/80">
                  <div className="mb-2 flex gap-2 opacity-60">
                    <div className="size-2 rounded-full bg-border-strong" />
                    <div className="size-2 rounded-full bg-text-muted" />
                    <div className="size-2 rounded-full bg-accent-signal" />
                  </div>
                  <pre>
                    <code>{`.hero-text {
  /* AI Refinement: Increased tracking */
  letter-spacing: -0.04em;
  /* AI Refinement: Contrast adjust */
  color: #e3e9f2;
  font-weight: 600;
  line-height: 1.1;
}`}</code>
                  </pre>
                </div>
              </div>

              {/* Analyze any live URL */}
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="p-lg">
                  <h5 className="mb-sm text-headline-md font-medium text-text-primary">{t('diffUrlTitle')}</h5>
                  <p className="text-body-md text-text-secondary">{t('diffUrlDesc')}</p>
                </div>
                <div className="px-md pb-md">
                  <div className="flex items-center gap-sm rounded-full border border-border bg-bg-elevated px-lg py-3">
                    <Lock className="size-4 text-text-secondary" strokeWidth={1.5} />
                    <span className="text-label-md text-text-secondary">https://poisik.ai/audit/dash...</span>
                  </div>
                  <div className="mt-md h-32 rounded-t-lg border-x border-t border-border bg-bg-elevated p-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="h-10 rounded bg-surface-hover" />
                      <div className="col-span-3 h-20 rounded bg-surface-hover" />
                    </div>
                  </div>
                </div>
              </div>

              {/* See how you compare */}
              <div className="flex flex-col rounded-xl border border-border bg-surface p-lg">
                <h5 className="mb-sm text-headline-md font-medium text-text-primary">{t('diffCompareTitle')}</h5>
                <p className="mb-lg text-body-md text-text-secondary">{t('diffCompareDesc')}</p>
                <div className="mt-auto space-y-md">
                  <div className="flex items-center justify-between text-label-md text-text-primary">
                    <span>{t('diffCompareYourDesign')}</span>
                    <span className="font-bold text-accent-signal">92/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-bg-elevated">
                    <div className="h-full rounded-full bg-accent-signal" style={{ width: '92%' }} />
                  </div>
                  <div className="flex items-center justify-between text-label-md text-text-secondary opacity-70">
                    <span>{t('diffCompareIndustryAvg')}</span>
                    <span>74/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-bg-elevated">
                    <div className="h-full rounded-full bg-border-strong" style={{ width: '74%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-xxl">
          <div className="mx-auto max-w-7xl px-margin text-center">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-xxl">
              <h2 className="mb-md text-display-lg font-semibold text-text-primary">{t('finalCtaTitle')}</h2>
              <p className="mx-auto mb-xl max-w-xl text-body-lg text-text-secondary">{t('finalCtaDesc')}</p>
              <a
                href="/demo"
                className="rounded-full bg-accent-signal px-xxl py-md text-body-md font-bold text-white transition-opacity hover:opacity-90"
              >
                {t('finalCtaButton')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-bg-elevated py-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-xl px-margin md:grid-cols-4">
          <div>
            <span className="mb-sm block text-headline-md font-bold lowercase tracking-tight text-text-primary">
              poisik
            </span>
            <p className="max-w-[220px] text-label-md text-text-secondary">{t('footerTagline')}</p>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerProductHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#features" className="transition-colors hover:text-accent-signal">
                  {n('features')}
                </a>
              </li>
              <li>
                <a href="/demo" className="transition-colors hover:text-accent-signal">
                  {n('demo')}
                </a>
              </li>
              <li>
                <a href="/pricing" className="transition-colors hover:text-accent-signal">
                  {t('footerPricingLink')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerApiDocsLink')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerCompanyHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerAboutLink')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerBlogLink')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerCareersLink')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="mb-lg text-label-sm font-bold uppercase tracking-widest text-text-primary">
              {t('footerLegalHeading')}
            </h6>
            <ul className="space-y-md text-label-md text-text-secondary">
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('terms')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-signal">
                  {t('footerCookiePolicyLink')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-xl max-w-7xl border-t border-border px-margin pt-lg">
          <span className="text-label-sm text-text-secondary opacity-60">{t('footerCopyright')}</span>
        </div>
      </footer>
    </div>
  );
}
```

Note on the two reused existing keys `privacy` and `terms`: these already exist in the `Landing` namespace from before this redesign (`"privacy": "Privacy Policy"` / `"terms": "Terms of Service"` in English, matching French equivalents) — confirmed reusable as-is, no new key needed for them.

- [ ] **Step 3: Verify translations resolve, no missing-key errors**

Run: `pnpm dev`, visit `http://localhost:3000/en`, then `http://localhost:3000/fr`. Confirm:
- No raw translation key names appear anywhere (e.g. no literal text like `Landing.feature1Title` rendered)
- Every section from the reference screenshot is present: header/nav, hero + stats row, "How it Works" (3 steps), features grid (6 cards), differentiators (3 cards, code/URL/compare), final CTA, footer (4 columns)
- The hero image renders (not a broken image icon)
- The "Fix it in code" card's three dots are navy tones, not red/amber/green
- Stop the dev server when done.

- [ ] **Step 4: Verify build/lint/typecheck**

Run: `pnpm build`, `pnpm lint`, `pnpm typecheck` — all must exit 0.

- [ ] **Step 5: Verify no raw hex codes**

Run: `grep -n '#[0-9a-fA-F]\{3,6\}' "app/[locale]/page.tsx"`
Expected: no output. (If the CSS code-snippet string inside the `<pre><code>` block trips this — it's illustrative example code, not a real style rule, so a hex value there is fine and expected; if the grep flags it, note that explicitly in your report as an accepted exception, don't try to eliminate it.)

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "feat(landing): rebuild landing page with new hero, stats, process, features, differentiators, and footer sections"
```

---

## Self-Review Notes

- **Spec coverage:** every section in the supplied screenshot/`code.html` maps to a block in Task 3's JSX — header/nav, hero, stats row, process (3 steps), features grid (6 items), differentiators (3 bento cards), final CTA, footer (4 columns). The three user decisions from clarification are folded in: real hero image via `next/image` (Task 2), monochrome navy dots instead of red/amber/blue (Task 3's code card), and no separate design-system brainstorm needed since the mockup was fully concrete.
- **Placeholder scan:** no TBD/TODO, every step has literal, complete code or an exact command.
- **Type/key consistency:** every `t('...')`/`n('...')` call in Task 3's JSX has a matching key defined in Task 1's JSON additions — cross-checked key-by-key while writing both tasks. `PROCESS_STEPS`/`FEATURES` arrays' `titleKey`/`descKey` fields match the JSON keys exactly (`feature1Title`/`feature1Desc` through `feature6Title`/`feature6Desc`, `processStep1Title`/`processStep1Desc` through `processStep3Title`/`processStep3Desc`).
- **Known limitation flagged to the user, not silently handled:** the hero image is low-resolution (512×279) for its display size — Task 2's report is instructed to note this rather than "fix" it unasked.
