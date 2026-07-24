# 20 — Lighthouse Perfection

**Depends on:** everything (run this pass near the end, alongside `11-quality-deployment.md`)
**Goal:** the product's own build quality must be flawless — a tool whose entire pitch is design/accessibility expertise cannot ship with its own blemishes.

## Tasks

1. Run Lighthouse (or Lighthouse CI) against every public route: `/`, `/demo`, `/upload`, `/pricing`, a sample `/report/[id]`, `/compare`
2. Target 100 on **Performance, Accessibility, Best Practices, and SEO** on each route
3. Common areas to check:
   - Images via `next/image` everywhere, correctly sized
   - Font loading via `next/font` (already planned) — verify zero layout shift (CLS)
   - No unused/render-blocking JS or CSS
   - Full keyboard reachability of every interactive element
   - The app's own text contrast ratios independently verified with `wcag-contrast` — don't just assume the monochrome palette passes, check it programmatically (this product's core premise is accessibility rigor, it must hold itself to the same standard)
4. If 100 isn't reachable on a specific route for a documented reason (e.g. an unavoidable third-party script), record the actual score and the reason in `PROGRESS.md`/`README.md` rather than silently shipping a lower score without explanation

## Definition of Done
- A Lighthouse CI report exists (logged/attached) showing per-route scores
- Any score below 100 has a written, specific justification in the project documentation
