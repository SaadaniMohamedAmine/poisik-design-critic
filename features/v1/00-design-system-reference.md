# Poisik — Design System Reference

Read this file first. Every other doc in this folder assumes these tokens/decisions and will not repeat them in full.

## Product
- **Name:** Poisik (stylized lowercase: `poisik`)
- **Tagline:** "Design and Passion, with poise."
- **What it is:** AI-powered UX/UI audit tool. User uploads a UI screenshot, gets an instant expert-level design critique (visual hierarchy, contrast/WCAG, spacing, typography, accessibility, consistency) with prioritized, actionable recommendations.
- **Positioning:** premium, top-tech, replaces a $150-300/h UX consultant. Every screen must read as a mature, expensive SaaS product — never a hobby project.
- **No full user auth system.** Free tier is fully anonymous. The only identity concept in the whole app is a Stripe customer record for paying users (see `10-pricing-stripe.md`). Do not add Clerk, NextAuth, or any login/signup flow.

## Visual references
The actual UI screens were generated in Google Stitch and exported to the `/design` folder (Stitch project: flagship report screen, support screens, brand assets). **Match those exports pixel-for-pixel** for layout, spacing, radii, and shadows — this doc gives you the tokens, the Stitch exports give you the exact composition.

## Color tokens (monochrome navy family — do not introduce any other hue anywhere in the product)
```css
--bg-base: #0a0f16;
--bg-elevated: #0d131c;
--surface: #121a27;
--surface-hover: #162131;
--border: #1d2b3f;
--border-strong: #263954;
--text-muted: #4b6c9b;
--text-secondary: #87a1c5;
--text-primary: #e3e9f2;
--accent-signal: #6294da;       /* CTAs, links, active states, "Critical" severity fill */
--accent-signal-hover: #78a4e3;
--accent-glow: #5f9cf2;         /* AI-highlight moments only — annotation markers, scan animations */
--accent-soft-bg: #182639;      /* badges/pills background */
```
Severity color convention (learned the hard way — Stitch will try to add red/amber by default, reject it):
- **Critical:** solid `accent-signal` background, bold text
- **Warning:** `accent-signal` at ~40% opacity background, regular text
- **Suggestion:** outline only, `border-strong` border, `text-muted` text, no fill
- Score/progress bars: always `accent-signal` fill regardless of value. Never encode score via hue — only via bar length/percentage.

## Typography
- **Inter** (via `next/font/google`), all weights used (400/500/600/700)
- Tight letter-spacing on headings, generous line-height on body copy

## Icons
- **Lucide** (`lucide-react`), 1.5px stroke weight, consistent sizing per context (16px inline, 20px buttons, 24px standalone)

## Logo
- Wordmark-only: `poisik` lowercase, Inter, tight tracking, no separate icon/symbol next to it in the main logo
- Favicon/app-icon exception: a compact monogram — lowercase "p" in Inter Bold, centered on a `#0a0f16` rounded-square, with a subtle `accent-glow` dot/ring accent at the letter's terminal (see Stitch LOT 3 export)

## Tone of voice — "Expert / posé"
Professional but human, senior-consultant register. Never cold/clinical, never cheerleading/overly encouraging.
- ✅ "This contrast ratio falls short of WCAG AA — consider a darker shade."
- ❌ "Contrast ratio: 2.1:1 — FAILS." (too clinical)
- ❌ "Almost there! Just a tiny tweak and you're golden! 🎉" (too cheerleading — also no emoji, ever)
This tone applies to: all static UI copy, all AI-generated report text (bake it into the system prompt, see `04-ai-analysis.md`), all error/empty states.

## Tech stack (locked decisions)
- Next.js — latest stable version (App Router), TypeScript strict
- Tailwind CSS + Shadcn/UI
- UploadThing (image storage)
- Sharp (server-side resize)
- GPT-4o Vision (primary) + Claude Vision (fallback)
- PostgreSQL (analysis persistence)
- Stripe (billing)
- next-intl (i18n, FR/EN)
- Vercel (hosting)

## File index in this delegation package
1. `01-init-setup.md` — repo, tooling, env
2. `02-design-system.md` — tokens → Tailwind/components
3. `03-upload-image-processing.md`
4. `04-ai-analysis.md` — Vision prompt, JSON schema, parsing
5. `05-report-screen.md` — flagship screen
6. `06-support-pages.md` — landing, demo, loading, comparison, share, errors, 404
7. `07-history.md` — anonymous session history
8. `08-assets-seo.md` — favicon, OG image, metadata
9. `09-i18n.md`
10. `10-pricing-stripe.md`
11. `11-quality-deployment.md` — tests, CI, deploy
12. `12-design-implementation.md` — how to turn the Stitch exports in `/design` into pixel-accurate code (read alongside `02`, before building `05`/`06`/`08`)

Work through them roughly in this order — each notes its dependencies on prior ones. Do not skip `01` and `02`.
