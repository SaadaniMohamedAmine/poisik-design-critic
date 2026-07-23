# 02 — Design System Integration

**Depends on:** `01-init-setup.md`
**Goal:** every color/font/icon/component decision from `00-design-system-reference.md` wired into the codebase as reusable primitives, so no screen ever hardcodes a raw hex value or an off-brand color.

## Tasks

1. **Tailwind config**
   - Extend the theme with all tokens from `00-design-system-reference.md` as named colors (e.g. `bg-base`, `surface`, `accent-signal`, etc.) so they're usable as `bg-bg-base`, `text-text-primary`, `border-border-strong`, etc.
   - Set dark mode as the only mode (`darkMode: 'class'` with the class always applied on `<html>`, or simply build the whole palette as the default — there is no light theme for this product).

2. **Global styles**
   - `globals.css`: body background = `bg-base`, default text color = `text-primary`, font-family = Inter
   - Import Inter via `next/font/google`, apply as the default sans font in Tailwind config

3. **Shadcn/UI components** — install and re-skin to match tokens:
   - Button (variants: primary = `accent-signal` fill, secondary = outline `border-strong`, ghost = transparent/`text-secondary`)
   - Badge (three severity variants per the convention in `00-design-system-reference.md` — solid/40%-opacity/outline, all same hue)
   - Card, Dialog, Tabs, Tooltip, Skeleton (for loading states)

4. **Custom Poisik components** (not in Shadcn, build from scratch)
   - `<PoisikLogo />` — wordmark, SVG or styled text, dark/light export not needed (dark-only product)
   - `<CircularGauge value={84} />` — the overall-score ring. Filled arc = `accent-signal`, **track/background arc = `border-strong`, never a generic gray** (this was a real bug caught during Stitch iteration — do not regress it)
   - `<AnnotationMarker />` — small numbered circular marker, `accent-signal` fill with `accent-glow` pulse, positioned via percentage-based `x`/`y` coordinates so it stays correctly placed at any image size
   - `<CategoryScoreBar />` — horizontal bar, always `accent-signal` fill, length = score %

5. **Icon usage**
   - `lucide-react` only, no other icon set anywhere in the app
   - Stroke width 1.5px consistently; standard sizes: 16px inline text icons, 20px in buttons, 24px standalone

## Reference materials
Open the Stitch exports in `/design` and extract exact spacing scale, border-radius values, and shadow/glow treatments used on the flagship report screen — replicate those values in the Tailwind config (`borderRadius`, `boxShadow` extensions) rather than guessing.

## Definition of Done
- A `/design-system` preview route (dev-only, can be deleted later) renders every token, every component variant, and the logo — and visually matches the Stitch exports
- No component anywhere in the app uses a raw hex value outside this token set
- Running a simple grep for hex codes outside `tailwind.config` returns nothing in `components/` or `app/`
