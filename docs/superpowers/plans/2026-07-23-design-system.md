# Feature 02 — Design System Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraint for this project:** no command or file change runs without the user's explicit go-ahead first. Pause before `git push` / `gh pr create` and show the user what is about to run.

**Goal:** every color/font/radius/component decision from `features/00-design-system-reference.md` wired into the codebase as reusable primitives, so no screen ever hardcodes a raw hex value or an off-brand color.

**Architecture:** Tailwind CSS v4 (CSS-first config — there is no `tailwind.config.ts` in this repo; theming lives entirely in `app/globals.css` via `@theme`). Poisik's tokens are added as named CSS custom properties there, and shadcn/ui's existing semantic variables (`--primary`, `--background`, etc., already present from Feature 01's `shadcn init`) are repointed to Poisik's palette — this makes every shadcn component installed in this feature render correctly with zero per-component color edits, since they consume the semantic variables rather than fixed hex values.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui (already initialized, style `base-nova`), lucide-react, `next/font/google` (Inter).

## Global Constraints

- Package manager: **pnpm** throughout (never npm/yarn).
- Single dark theme only — no light mode, no theme toggle. Do not add a `.dark` class variant; bake the dark palette directly into `:root`.
- Color tokens (exact hex, from `features/00-design-system-reference.md` — do not deviate):
  ```
  --color-bg-base: #0a0f16
  --color-bg-elevated: #0d131c
  --color-surface: #121a27
  --color-surface-hover: #162131
  --color-border-strong: #263954
  --color-text-muted: #4b6c9b
  --color-text-secondary: #87a1c5
  --color-text-primary: #e3e9f2
  --color-accent-signal: #6294da
  --color-accent-signal-hover: #78a4e3
  --color-accent-glow: #5f9cf2
  --color-accent-soft-bg: #182639
  ```
  (`border` — the generic shadcn semantic token, hex `#1d2b3f` — is handled separately below; do not also declare a `--color-border-strong`-style duplicate for it.)
- **No other hue anywhere in the product.** Monochrome navy family only. Where shadcn needs a "destructive" color (delete actions, error states), reuse a tone from this same navy family — never introduce red/amber/green.
- Severity convention (do not regress — this was a real bug caught during Stitch iteration):
  - **Critical:** solid `accent-signal` background, bold text
  - **Warning:** `accent-signal` at ~40% opacity background, regular text
  - **Suggestion:** outline only, `border-strong` border, `text-muted` text, no fill
  - Score/progress bars: always `accent-signal` fill regardless of value — never encode score via hue, only via bar length/percentage
- Radius scale (from `design/luxe_intelligence_audit/DESIGN.md`'s authored "Shapes" section — this is the structural reference the Stitch exports agree on; do not use the per-screen `code.html` files' local Tailwind CDN config, which redefines `rounded-full` in a way that contradicts a true pill/circle and is a one-off Stitch artifact, not the intended system):
  ```
  DEFAULT (rounded): 0.25rem
  sm: 0.125rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px (Tailwind's built-in value — do not override)
  ```
- Spacing scale: **do not add custom spacing tokens.** Tailwind v4's default spacing scale (4px increments: `p-1`=4px, `p-2`=8px, `p-4`=16px, `p-6`=24px, `p-12`=48px, `p-20`=80px) already matches `DESIGN.md`'s spacing scale (base/xs 4px, sm 8px, md 16px, lg 24px, xl 48px, xxl 80px) exactly — adding a parallel named scale would be pure duplication.
- Typography: **Inter** via `next/font/google`, weights 400/500/600/700, replacing the Geist/Geist Mono fonts `create-next-app` installed in Feature 01. No mono font is required by the spec — drop `--font-mono`/Geist Mono entirely rather than leaving it unused.
- Elevation: **no drop shadows.** Per `DESIGN.md`'s "Elevation & Depth" section, depth is conveyed via 1px solid borders (`border` / `border-strong`) and background layering (`surface` → `surface-hover`), never `box-shadow`. Don't add shadow utilities to any new component.
- Icons: `lucide-react` only (already installed), stroke width 1.5px, sizes 16px (inline text), 20px (buttons), 24px (standalone).
- `features/`, `design/` are read-only references — must be untouched by any task's diff.
- Definition of Done (whole feature):
  - A `/design-system` preview route (dev-only) renders every token, every component variant, and the logo, and visually matches the intent of the Stitch exports
  - No component anywhere in the app uses a raw hex value outside `app/globals.css`'s `@theme` block
  - `grep -rn '#[0-9a-fA-F]\{3,6\}' components/ app/ --include='*.tsx'` (excluding `app/globals.css`, which isn't `.tsx`) returns nothing
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` all pass with zero errors

---

### Task 1: Design tokens — colors and radius in `app/globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: the `--color-bg-base`, `--color-surface`, `--color-accent-signal`, etc. utilities (usable as `bg-bg-base`, `text-text-primary`, `border-border-strong`, `bg-accent-signal`, ...) and repointed shadcn semantic variables (`--primary`, `--background`, `--card`, etc.) that every later task in this plan builds on.

- [ ] **Step 1: Read the current file**

Run: `cat app/globals.css` (or open it) to confirm it still matches Feature 01's output before editing — the `@theme inline` block, `:root`, `.dark`, and `@layer base` sections.

- [ ] **Step 2: Replace the full file content**

Replace `app/globals.css` with exactly this:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* Poisik design tokens — features/00-design-system-reference.md, do not edit values here without updating the spec */
  --color-bg-base: #0a0f16;
  --color-bg-elevated: #0d131c;
  --color-surface: #121a27;
  --color-surface-hover: #162131;
  --color-border-strong: #263954;
  --color-text-muted: #4b6c9b;
  --color-text-secondary: #87a1c5;
  --color-text-primary: #e3e9f2;
  --color-accent-signal: #6294da;
  --color-accent-signal-hover: #78a4e3;
  --color-accent-glow: #5f9cf2;
  --color-accent-soft-bg: #182639;
}

:root {
  --background: #0a0f16;
  --foreground: #e3e9f2;
  --card: #121a27;
  --card-foreground: #e3e9f2;
  --popover: #121a27;
  --popover-foreground: #e3e9f2;
  --primary: #6294da;
  --primary-foreground: #0a0f16;
  --secondary: #121a27;
  --secondary-foreground: #e3e9f2;
  --muted: #121a27;
  --muted-foreground: #87a1c5;
  --accent: #182639;
  --accent-foreground: #e3e9f2;
  --destructive: #263954;
  --border: #1d2b3f;
  --input: #1d2b3f;
  --ring: #6294da;
  --chart-1: #6294da;
  --chart-2: #78a4e3;
  --chart-3: #5f9cf2;
  --chart-4: #87a1c5;
  --chart-5: #4b6c9b;
  --radius: 0.25rem;
  --sidebar: #0d131c;
  --sidebar-foreground: #e3e9f2;
  --sidebar-primary: #6294da;
  --sidebar-primary-foreground: #0a0f16;
  --sidebar-accent: #182639;
  --sidebar-accent-foreground: #e3e9f2;
  --sidebar-border: #1d2b3f;
  --sidebar-ring: #6294da;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

Note what changed vs. Feature 01's version: the `.dark { ... }` block is gone entirely (single theme, baked into `:root`), `@custom-variant dark (&:is(.dark *));` is removed (nothing uses `dark:` variants), `--font-sans` now points at `--font-inter` (wired in Task 2) instead of `--font-geist-sans`, `--font-mono` is dropped, `--destructive` is repointed to `#263954` (a navy tone, not red — no other hue in the product), and the four radius entries (`sm`/`md`/`lg`/`xl`) are literal values matching `DESIGN.md`'s scale instead of the original `calc(var(--radius) * N)` chain. The Poisik-specific tokens are appended at the end of the same `@theme inline` block.

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: exits 0. (It will still reference `--font-inter`, which doesn't exist as a font yet — Task 2 wires it. If the build fails specifically because Tailwind can't resolve `var(--font-inter)` at build time, that's expected and fine: CSS custom properties are resolved at runtime, not by Tailwind/PostCSS, so this should NOT fail the build. If it does fail for an unrelated reason, stop and report BLOCKED with the exact error.)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "chore(design-system): wire Poisik color and radius tokens into globals.css"
```

---

### Task 2: Inter font (replace Geist)

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `--font-sans: var(--font-inter);` already wired in Task 1's `globals.css`.
- Produces: the `--font-inter` CSS variable that Task 1's theme references.

- [ ] **Step 1: Replace `app/layout.tsx`**

Replace its content with exactly this:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'poisik',
  description: 'Design and Passion, with poise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: exits 0, no errors about the missing `--font-inter` variable (it's now defined by the `Inter(...)` call above).

Run: `pnpm dev`, open `http://localhost:3000`, confirm the page renders in Inter (not Geist) via browser devtools computed font-family, then stop the server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "chore(design-system): replace Geist with Inter per design system spec"
```

---

### Task 3: Install shadcn components and add severity Badge variants

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`, `components/ui/dialog.tsx`, `components/ui/tabs.tsx`, `components/ui/tooltip.tsx`, `components/ui/skeleton.tsx` (all via the shadcn CLI — do not hand-write these)
- Modify: `components/ui/badge.tsx` (add three custom variants after install)

**Interfaces:**
- Consumes: the repointed `--primary`/`--background`/`--card`/etc. semantic variables from Task 1 — because these components consume semantic variable names rather than fixed hex, they should already render in Poisik's palette with no color edits needed for Button/Card/Dialog/Tabs/Tooltip/Skeleton.
- Produces: `<Badge variant="critical">`, `<Badge variant="warning">`, `<Badge variant="suggestion">` — used by later features (e.g. the report screen) for audit-issue severity.

- [ ] **Step 1: Install the components**

```bash
pnpm dlx shadcn@latest add button badge card dialog tabs tooltip skeleton
```

- [ ] **Step 2: Verify no color edits are needed for Button/Card/Dialog/Tabs/Tooltip/Skeleton**

Read the generated `components/ui/button.tsx` and `components/ui/card.tsx`. Confirm they use semantic Tailwind classes (`bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, etc.) rather than fixed color names like `bg-blue-500`. This should be the case since shadcn's default templates always use semantic tokens — if you find any component using a fixed Tailwind color utility instead of a semantic one, replace it with the matching semantic class (e.g. `bg-blue-600` → `bg-primary`) and note it in your report.

- [ ] **Step 3: Add severity variants to the generated Badge**

Open `components/ui/badge.tsx`. It will contain a `cva(...)` (class-variance-authority) call defining Badge's `variant` prop with entries like `default`, `secondary`, `destructive`, `outline`. Add three more entries to that same `variants.variant` object:

```ts
critical: 'border-transparent bg-accent-signal text-text-primary font-bold [a&]:hover:bg-accent-signal-hover',
warning: 'border-transparent bg-accent-signal/40 text-text-primary font-normal',
suggestion: 'border-border-strong text-text-muted bg-transparent font-normal',
```

(Match the existing entries' exact quoting/formatting style and any shared base classes already present — e.g. if other variants include `[a&]:hover:...` for link-rendered badges, follow that same pattern for `critical`. If the generated file's structure differs meaningfully from this description — e.g. a different variant API — stop and report NEEDS_CONTEXT with what you found.)

- [ ] **Step 4: Verify**

Run: `pnpm build` and `pnpm typecheck` — both exit 0.

Write a temporary throwaway test snippet (not committed) rendering `<Badge variant="critical">Critical</Badge>`, `<Badge variant="warning">Warning</Badge>`, `<Badge variant="suggestion">Suggestion</Badge>` in `app/page.tsx` temporarily, run `pnpm dev`, visually confirm: critical = solid accent-signal fill with bold light text, warning = ~40%-opacity accent-signal fill with regular-weight text, suggestion = outline only (border-strong), muted text, no fill. Then revert `app/page.tsx` back to its original content (this task must not touch the homepage — that's Feature 06's scope).

- [ ] **Step 5: Commit**

```bash
git add components/ui/
git commit -m "chore(design-system): install shadcn components and add severity Badge variants"
```

---

### Task 4: Custom components — PoisikLogo, AnnotationMarker, CategoryScoreBar

**Files:**
- Create: `components/poisik/PoisikLogo.tsx`
- Create: `components/poisik/AnnotationMarker.tsx`
- Create: `components/poisik/CategoryScoreBar.tsx`

**Interfaces:**
- Produces: `<PoisikLogo />`, `<AnnotationMarker number={1} x={50} y={8} />`, `<CategoryScoreBar label="Visual Hierarchy" value={90} />` — consumed by Task 6's preview route and by later features (the report screen, `05-report-screen.md`).

- [ ] **Step 1: `components/poisik/PoisikLogo.tsx`**

```tsx
export function PoisikLogo({ className }: { className?: string }) {
  return (
    <span className={`lowercase font-semibold tracking-tight text-text-primary ${className ?? ''}`}>
      poisik
    </span>
  );
}
```

- [ ] **Step 2: `components/poisik/AnnotationMarker.tsx`**

Percentage-based `x`/`y` position it over a parent with `position: relative`, so it stays correctly placed at any image size (per the spec's explicit requirement).

```tsx
interface AnnotationMarkerProps {
  number: number;
  x: number;
  y: number;
  onClick?: () => void;
}

export function AnnotationMarker({ number, x, y, onClick }: AnnotationMarkerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent-glow bg-accent-signal text-sm font-bold text-text-primary shadow-none transition-transform hover:scale-110"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={`Annotation ${number}`}
    >
      {number}
    </button>
  );
}
```

- [ ] **Step 3: `components/poisik/CategoryScoreBar.tsx`**

Always `accent-signal` fill regardless of score value — never encode the score via hue, only via bar length (per the Global Constraints).

```tsx
interface CategoryScoreBarProps {
  label: string;
  value: number;
}

export function CategoryScoreBar({ label, value }: CategoryScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-text-secondary">
        <span>{label}</span>
        <span>{clamped}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div className="h-full rounded-full bg-accent-signal" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck` and `pnpm lint` — both exit 0. `pnpm build` — exits 0 (these components aren't rendered anywhere yet, so the build just needs to compile them without error; Task 6 renders them).

- [ ] **Step 5: Commit**

```bash
git add components/poisik/PoisikLogo.tsx components/poisik/AnnotationMarker.tsx components/poisik/CategoryScoreBar.tsx
git commit -m "chore(design-system): add PoisikLogo, AnnotationMarker, CategoryScoreBar components"
```

---

### Task 5: CircularGauge component (regression-risk component — read this task carefully)

**Files:**
- Create: `components/poisik/CircularGauge.tsx`

**Interfaces:**
- Produces: `<CircularGauge value={84} />` — the overall-score ring, consumed by Task 6's preview route and later by the report screen (`05-report-screen.md`).

**Why this task is isolated:** the spec explicitly calls out a real bug caught during Stitch iteration: *"track/background arc = `border-strong`, never a generic gray."* This task exists specifically so that constraint gets its own focused review rather than being buried inside a larger component-building task.

- [ ] **Step 1: `components/poisik/CircularGauge.tsx`**

SVG geometry taken directly from the Stitch export (`design/analysis_report_poisik/code.html`): a 160×160 viewBox, circle center at (80, 80), radius 70, stroke width 12, rotated -90deg so the arc starts at 12 o'clock. Circumference = 2 × π × 70 = 439.8.

```tsx
interface CircularGaugeProps {
  value: number;
}

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularGauge({ value }: CircularGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="transparent"
          stroke="var(--color-border-strong)"
          strokeWidth="12"
        />
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="transparent"
          stroke="var(--color-accent-signal)"
          strokeWidth="12"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[42px] font-bold leading-none text-text-primary">{clamped}</span>
      </div>
    </div>
  );
}
```

Note: the track circle's `stroke` is explicitly `var(--color-border-strong)`, NOT a Tailwind gray utility like `stroke-gray-700` or `stroke-zinc-800` and not `currentColor` inherited from some ambient text-gray class — this is the exact bug the spec warns against. If you find yourself tempted to use a Tailwind `stroke-*` utility class instead of the CSS variable directly, don't — SVG `stroke`/`fill` don't reliably pick up Tailwind's `--color-*` theme utilities the same way `bg-*`/`text-*` do without an explicit utility class existing for it, so setting the CSS variable directly in the `stroke` attribute (as above) is the reliable approach here.

- [ ] **Step 2: Verify the track color specifically**

After building, inspect the rendered SVG (e.g. via a temporary render in `pnpm dev`, or by reading the compiled output) and confirm the first `<circle>`'s `stroke` resolves to `#263954` (the `--color-border-strong` value), not any shade of gray. State this check explicitly in your report — this is the one thing this task must not get wrong.

- [ ] **Step 3: Verify build/types**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/poisik/CircularGauge.tsx
git commit -m "chore(design-system): add CircularGauge component with border-strong track (not gray)"
```

---

### Task 6: `/design-system` preview route

**Files:**
- Create: `app/design-system/page.tsx`

**Interfaces:**
- Consumes: every component/token from Tasks 1-5 (`PoisikLogo`, `AnnotationMarker`, `CategoryScoreBar`, `CircularGauge`, shadcn `Button`/`Badge`/`Card`/`Dialog`/`Tabs`/`Tooltip`/`Skeleton`).
- Produces: the feature's Definition-of-Done deliverable — a single page rendering every token/variant so they can be checked against the Stitch exports at a glance.

- [ ] **Step 1: `app/design-system/page.tsx`**

Dev-only guard via `notFound()` in production, since this route is a temporary internal reference (per the spec: "dev-only, can be deleted later").

```tsx
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PoisikLogo } from '@/components/poisik/PoisikLogo';
import { CircularGauge } from '@/components/poisik/CircularGauge';
import { CategoryScoreBar } from '@/components/poisik/CategoryScoreBar';
import { AnnotationMarker } from '@/components/poisik/AnnotationMarker';

const COLOR_TOKENS = [
  { name: 'bg-base', className: 'bg-bg-base' },
  { name: 'bg-elevated', className: 'bg-bg-elevated' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-hover', className: 'bg-surface-hover' },
  { name: 'border', className: 'bg-border' },
  { name: 'border-strong', className: 'bg-border-strong' },
  { name: 'accent-signal', className: 'bg-accent-signal' },
  { name: 'accent-signal-hover', className: 'bg-accent-signal-hover' },
  { name: 'accent-glow', className: 'bg-accent-glow' },
  { name: 'accent-soft-bg', className: 'bg-accent-soft-bg' },
] as const;

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="min-h-full space-y-12 bg-bg-base p-12 text-text-primary">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Logo</h1>
        <PoisikLogo className="text-3xl" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          {COLOR_TOKENS.map((token) => (
            <div key={token.name} className="space-y-2">
              <div className={`h-16 w-full rounded-md border border-border ${token.className}`} />
              <p className="text-xs text-text-secondary">{token.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex gap-4">
          <Button>Primary</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Severity Badges</h2>
        <div className="flex gap-4">
          <Badge variant="critical">Critical</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="suggestion">Suggestion</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Sample Card</CardTitle>
          </CardHeader>
          <CardContent>Card content on the surface token.</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton</h2>
        <Skeleton className="h-6 w-64" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Circular Gauge</h2>
        <CircularGauge value={84} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Category Score Bars</h2>
        <div className="max-w-sm space-y-3">
          <CategoryScoreBar label="Visual Hierarchy" value={90} />
          <CategoryScoreBar label="Contrast" value={65} />
          <CategoryScoreBar label="Accessibility" value={70} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Annotation Marker</h2>
        <div className="relative h-40 w-64 rounded-md border border-border bg-surface">
          <AnnotationMarker number={1} x={50} y={50} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`, open `http://localhost:3000/design-system`, confirm every section renders without errors and visually matches the intent described in `features/00-design-system-reference.md` (dark navy backgrounds, accent-signal blue accents, no other hues, no drop shadows). Then stop the dev server.

Run: `pnpm build` with `NODE_ENV=production` (the default for `next build`) and confirm the route either doesn't statically render content (due to the `notFound()` guard) or is excluded — check the build output's route list doesn't show `/design-system` as a normal static page in a production-intent build. If `next build` doesn't actually set `NODE_ENV=production` internally in a way `process.env.NODE_ENV` reflects during this Next.js version's build, note that in your report as a ⚠️ and describe what you observed instead — don't guess.

Run: `pnpm lint` and `pnpm typecheck` — both exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/design-system/
git commit -m "feat(design-system): add /design-system dev-only token/component preview route"
```

---

### Task 7: Final verification and PR

**Files:** none (verification + git/GitHub operations only)

**Interfaces:**
- Consumes: all commits from Tasks 1-6.
- Produces: an open PR against `main` — the review checkpoint before this feature is considered done.

- [ ] **Step 1: Grep for stray hex codes outside the token definition file**

```bash
grep -rn '#[0-9a-fA-F]\{3,6\}' components/ app/ --include='*.tsx'
```
Expected: no output. `app/globals.css` is intentionally excluded from this check (it's the one file allowed to declare raw hex, since it's the token source of truth) — the check targets `.tsx` files, which should only ever reference tokens via Tailwind utility classes (`bg-accent-signal`) or `var(--color-*)`, never a literal hex.

- [ ] **Step 2: Confirm no other hue was introduced**

Read `app/globals.css` once more in full and confirm every hex value in `:root` is one of the twelve Poisik tokens (or a direct reuse of one, like `--destructive: #263954`) — no unrelated red/green/amber/etc. hex should appear anywhere.

- [ ] **Step 3: Full verification suite**

Run in order: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. All must exit 0.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat-design-system
```

```bash
gh pr create --title "feat: design system integration (Feature 02)" --body "$(cat <<'EOF'
## Summary
- Poisik color + radius tokens wired into app/globals.css (Tailwind v4 CSS-first theme)
- Inter font replaces Geist/Geist Mono
- shadcn Button/Card/Dialog/Tabs/Tooltip/Skeleton installed, rendering correctly via repointed semantic tokens; Badge gets 3 custom severity variants (critical/warning/suggestion)
- Custom Poisik components: PoisikLogo, AnnotationMarker, CategoryScoreBar, CircularGauge (track arc uses border-strong, not gray — matches the spec's explicit regression warning)
- /design-system dev-only preview route rendering every token/component

## Test plan
- [ ] pnpm install from a clean clone
- [ ] pnpm dev, visit /design-system, visually compare against features/00-design-system-reference.md and design/ Stitch exports
- [ ] pnpm build / pnpm lint / pnpm typecheck / pnpm test all pass
- [ ] grep for stray hex codes in components/ and app/ (excluding globals.css) returns nothing
EOF
)"
```

## Self-Review Notes

- **Spec coverage:** all 5 numbered items in `features/02-design-system.md` map to tasks above (Tailwind config → Task 1, global styles → Task 2, shadcn re-skin → Task 3, custom components → Tasks 4-5, icon usage → covered by existing `lucide-react` install from Feature 01, enforced by convention/no new icon set introduced in this plan).
- **Known deviation from the spec's literal wording, called out for the human:** the original spec assumes a `tailwind.config.ts`-based setup ("Extend the theme... Set dark mode as the only mode (`darkMode: 'class'`...)"), but Feature 01 scaffolded with Tailwind v4, which is CSS-first (no config file, `@theme` in `globals.css` instead) and has no `darkMode` setting to flip — this plan achieves the same *outcome* (single dark theme, named token utilities) via the mechanism Tailwind v4 actually provides.
- **No placeholders:** every step has complete, literal code or an exact command.
