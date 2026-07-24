# 06 — Support Pages

**Depends on:** `02-design-system.md`, `03-upload-image-processing.md`, `04-ai-analysis.md`, `05-report-screen.md`
**Goal:** every page besides the flagship report screen, pixel-matching the relevant Stitch exports.

## Pages

### Landing page (`/`)
- Hero: `poisik` wordmark, tagline "Design and Passion, with poise." as large headline, subheadline ("Get an expert-level UX/UI audit in seconds — no consultant required"), primary CTA "Analyze your design" → routes to `/upload`
- Hero visual: stylized preview of the annotated report screen
- Below the fold: 3-column feature grid (Lucide icons) — Visual Hierarchy, WCAG Contrast, Actionable Recommendations
- Subtle low-opacity `accent-glow` ambient background effects only — no other color

### Live demo (`/demo`)
- A hardcoded sample screenshot + a **pre-generated** `AnalysisResult` JSON (no live API call, zero cost, zero latency)
- Renders through the exact same report screen component built in `05-report-screen.md` — do not build a separate component
- Linked prominently from the landing page nav/CTA ("See a live example" or similar) so a visitor (e.g. a recruiter) sees the full experience instantly without uploading anything

### Upload (`/upload`)
- The Dropzone screen from `03-upload-image-processing.md`, wrapped in the app shell (top bar)

### Loading / Processing (shown after submitting an upload, before the report is ready)
- Uploaded screenshot dimmed/blurred in the background
- Animated scanning line or pulsing `accent-glow` sweep across it
- Status text cycles through (exact phrases, expert tone): "Scanning visual hierarchy…", "Calculating contrast ratios…", "Checking spacing consistency…"
- Circular progress indicator

### Comparison — Before/After (`/compare`)
- Two screenshots uploaded (reuse the Dropzone, allow 2 files)
- Side-by-side display (or a draggable vertical divider/slider)
- Each image shows its own mini score badge in a corner
- Below: comparison summary — score deltas per category (e.g. "Contrast: 62 → 91, +29") with up/down trend icons (Lucide `TrendingUp`/`TrendingDown`)

### Public share view (`/report/[id]`)
- Read-only version of the flagship report screen (same component, an `isReadOnly` prop hides Export/Share actions and any edit controls)
- Small "Made with Poisik" badge in the footer, linking back to `/`
- Subtle "Duplicate this analysis" CTA → pre-fills `/upload` with the same source image if feasible, otherwise links to `/upload`

### Empty / Error states
- Empty history: "No analyses yet — upload your first screenshot to get started." + a Lucide illustration-style icon
- Upload error: "This file type isn't supported." / "This file exceeds the 10MB limit."
- Generic API error: "Something went wrong analyzing this image — try again."

### 404 (`/not-found`)
- Large muted "404" typography, short expert-tone message ("This page doesn't exist — but your design probably does. Let's take a look at it instead."), CTA back to `/`

## Definition of Done
- All 7 routes above are reachable and visually match their Stitch exports
- `/demo` loads instantly with zero network calls to the AI providers
- `/report/[id]` correctly hides all edit/upload controls
- Every error/empty state uses the exact copy strings specified, in the expert/posé tone
