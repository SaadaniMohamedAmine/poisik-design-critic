# 12 — Design Implementation (Stitch Exports → Code)

**Depends on:** `00-design-system-reference.md`, `02-design-system.md`
**Read before building:** `05-report-screen.md`, `06-support-pages.md`, `08-assets-seo.md`
**Goal:** turn the Stitch-generated visuals in the `/design` folder into pixel-accurate, production code — without needing to come back to the project owner for design clarifications.

## What's in `/design`
Three Stitch generations, in this order:
- **LOT 1 — Flagship:** the "Analysis Report - Poisik" screen (the core split-view: image + annotation overlay + report panel)
- **LOT 2 — Support screens:** Landing, Upload/Dropzone, Loading/Processing, Comparison (Before/After), Public Share View, Empty/Error states, 404
- **LOT 3 — Assets:** Favicon/app icon monogram, OG/social share image, loader/spinner spec

## Process — for every screen/frame
1. **Open the export** and identify every distinct spacing value (padding, gaps, margins) — build a consistent spacing scale from what you observe (round to the nearest sensible Tailwind step: 4/8/12/16/24/32/48/64px) rather than copying arbitrary pixel values 1:1. Consistency across screens matters more than exact-to-the-pixel matching of any single one.
2. **Extract corner radii** — there should be very few distinct radius values across the whole app (e.g. small/medium/large). Add them to the Tailwind `borderRadius` theme extension from `02-design-system.md`, don't hardcode per component.
3. **Extract shadow/glow treatments** — the "Dark Luxe Minimal" aesthetic uses very subtle shadows and occasional `accent-glow` ambient effects, never harsh drop shadows. Add these as Tailwind `boxShadow` theme extensions (e.g. `shadow-glow-sm`, `shadow-glow-md`).
4. **Match copy exactly** — every string visible in the export (button labels, headings, captions, empty/error states) should be used verbatim in the component and added to the i18n message files from `09-i18n.md`, not paraphrased.
5. **Map to routes/components** using this table:

| Stitch frame | Route | Built in |
|---|---|---|
| Analysis Report - Poisik | `/report/[id]` (+ authenticated view state) | `05-report-screen.md` |
| Landing | `/` | `06-support-pages.md` |
| Upload/Dropzone | `/upload` | `03` + `06` |
| Loading/Processing | shown mid-flow after upload | `06-support-pages.md` |
| Comparison Before/After | `/compare` | `06-support-pages.md` |
| Public Share View | `/report/[id]` (read-only mode) | `06-support-pages.md` |
| Empty/Error states | inline states across `/upload`, `/`, history | `06-support-pages.md` |
| 404 | `/not-found` | `06-support-pages.md` |
| Favicon monogram | `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` | `08-assets-seo.md` |
| OG image | `app/opengraph-image.png` (Next.js convention) | `08-assets-seo.md` |

## Known corrections already applied — verify, don't regress
During Stitch iteration, two color deviations were caught and corrected. **Confirm the final exports reflect these** before treating any exported image as ground truth; if an export still shows the old version, follow the written rule below instead of the image:
- The circular score gauge's background/track arc must be `border-strong` (`#263954`), **not a generic gray**
- Severity indicators (Critical/Warning/Suggestion badges, score bars) must stay strictly within the navy palette — **no amber/gold/red/yellow anywhere**, even though AI design tools default to adding semantic red/yellow/green. See the exact severity styling convention in `00-design-system-reference.md`.

## Responsive behavior
The Stitch exports are desktop-resolution mockups only — there is no mobile/tablet export. You must design the responsive behavior yourself, using the same spacing scale and component library, following these rules:
- Report screen: the split-view (image left / report panel right) stacks vertically on screens below `md` (image on top, report panel below, both full-width)
- Landing/marketing pages: standard responsive stacking of the feature grid (3-col → 1-col below `md`)
- Never introduce new colors, fonts, or spacing values for mobile — reuse the same tokens, just adjust layout/stacking

## Asset export checklist
- Export the favicon monogram from LOT 3 as actual raster/vector files (16x16, 32x32, 180x180, 512x512 PNG + a multi-size `.ico`)
- Export the OG image from LOT 3 as a static 1200x630 PNG, placed per Next.js's `opengraph-image` file convention
- Export the `poisik` wordmark as an SVG (for crisp rendering at any size) if Stitch provides a vector export; otherwise rebuild it directly in code as styled text (it's simple enough: Inter, tight tracking, lowercase) rather than shipping a raster logo

## Visual QA
- After implementing each screen, take a screenshot at the same viewport size as the Stitch export and compare side-by-side (manual is fine for a solo project; a visual-regression tool like Percy/Chromatic is a nice-to-have, not required)
- Any visible deviation in color, spacing, or radius from the tokens in `00-design-system-reference.md` should be treated as a bug, not a stylistic choice

## Definition of Done
- Every screen listed in the mapping table above is implemented and visually matches its Stitch export (allowing for the responsive adaptation rules above)
- No hex color exists anywhere in the codebase outside the token set in `00-design-system-reference.md`
- All copy strings match the exports verbatim and are routed through i18n
- Favicon, OG image, and wordmark render correctly in-browser and in social share previews
