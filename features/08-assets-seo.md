# 08 — Assets & SEO

**Depends on:** `02-design-system.md`
**Goal:** the app looks and performs like a real product in search results and social shares, not a side project.

## Tasks

1. **Favicon / app icon**
   - Use the Stitch LOT 3 export (lowercase "p" monogram, Inter Bold, on `#0a0f16` rounded-square, subtle `accent-glow` accent at the terminal)
   - Generate all required sizes: 16x16, 32x32, 180x180 (apple-touch-icon), 512x512 (PWA/manifest), plus a `favicon.ico`

2. **OG / social share image**
   - Use the Stitch LOT 3 export (1200x630, wordmark + tagline + cropped report screen preview)
   - Wire into `metadata.openGraph.images` and `metadata.twitter.images` via Next.js Metadata API
   - Consider a dynamic OG image per shared report (`/report/[id]`) showing that specific analysis's score — nice-to-have, not blocking

3. **Metadata per page**
   - Use Next.js `generateMetadata` for title, description, canonical URL, OG tags, Twitter card (`summary_large_image`) on every route
   - Title pattern: "Poisik — Design and Passion, with poise." on the homepage; "{Page name} — Poisik" elsewhere

4. **Sitemap & robots**
   - `app/sitemap.ts` and `app/robots.ts` (Next.js native support) — include all public marketing routes, exclude `/report/[id]` pages that aren't public, exclude any dev-only `/design-system` route

5. **Structured data**
   - Add JSON-LD `SoftwareApplication` schema on the homepage (name, description, applicationCategory: "DesignApplication", offers referencing the Free/Pro plans from `10-pricing-stripe.md`)

## Definition of Done
- Lighthouse SEO score: 100
- Pasting the homepage URL into a social debugger (e.g. Meta's Sharing Debugger, or opengraph.xyz) shows the correct title, description, and OG image
- Favicon renders correctly in a browser tab and as a bookmark/PWA icon
