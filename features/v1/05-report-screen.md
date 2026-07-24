# 05 — Report Screen (Flagship)

**Depends on:** `02-design-system.md`, `04-ai-analysis.md`
**Goal:** build the single most important screen in the product, pixel-matching the Stitch "Analysis Report - Poisik" export.

## Layout
Split view, top bar + two-column body:
- **Top bar:** `poisik` wordmark (left), nav (Analyze / History), a static "Free Plan" tag (right) — no avatar/login, this app has no auth
- **Left column (~60%):** the uploaded screenshot at full clarity, with the annotation overlay on top
- **Right column (~40%):** scrollable report panel

## Annotation overlay
- Numbered circular markers (`<AnnotationMarker />` from `02-design-system.md`) absolutely positioned using each issue's `location.x`/`location.y` percentages from `04-ai-analysis.md`
- Hover → small tooltip card with the issue's `title` + first line of `description`
- Click → smooth-scrolls the right panel to the matching issue card and highlights it (e.g. temporary `accent-soft-bg` background flash)
- Markers must reposition correctly if the image is responsive/resized (percentage-based, not pixel-based)

## Report panel (right column)
1. **Header:** `<CircularGauge value={overall_score} />` with "Overall Design Score" label underneath
2. **Category scores:** 6 `<CategoryScoreBar />` rows (Visual Hierarchy, Contrast, Spacing, Typography, Accessibility, Consistency) — all bars use `accent-signal` fill, differ only by length
3. **Filter chips:** "All" + one chip per category, pill-shaped, active state uses `accent-soft-bg` background
4. **Issue list:** filtered by the active chip. Each issue card shows:
   - Severity badge (solid/40%-opacity/outline per the convention in `00-design-system-reference.md` — **no red/amber/yellow, ever**, this was a real regression caught during design iteration)
   - Category tag
   - Title + description
   - Expandable recommendation text
   - A small "locate on image" icon button (Lucide `MapPin`) that scrolls/highlights the matching annotation marker (inverse of the click-from-marker interaction above)
5. **Sticky footer actions:** "Export PDF" (outline button) and "Share Report" (solid `accent-signal`, primary)

## Export PDF
- Generate a branded PDF (e.g. via `@react-pdf/renderer` or a headless-browser HTML-to-PDF approach) that mirrors the report panel's content and visual identity closely enough to read as a professional consultant-style audit document — this is a real product value signal, not an afterthought
- Include: Poisik wordmark, overall score, category scores, full issue list with severity/recommendation

## Share Report
- Creates a persisted, publicly-accessible record (see `07-history.md` for the persistence layer) and copies a shareable URL to the clipboard
- The shared URL renders the read-only public view built in `06-support-pages.md`

## Definition of Done
- Visually matches the Stitch "Analysis Report - Poisik" export, including the corrected monochrome gauge track color (`border-strong`, not generic gray) and monochrome severity badges
- Clicking a marker scrolls to and highlights the right issue; clicking "locate on image" from an issue does the reverse
- Filter chips correctly show/hide issues by category
- Export PDF produces a readable, branded document
- Share Report produces a working public link
