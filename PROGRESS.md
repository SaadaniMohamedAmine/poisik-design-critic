# Poisik — Progress Log

## TODO — Lighthouse Manual Audit
- Ouvrir Chrome DevTools → onglet Lighthouse → "Analyze page load"
- Tester chaque route : `/en/`, `/en/upload`, `/en/demo`, `/en/pricing`, `/en/history`, `/en/compare`
- Viser 100/100 sur Performance, Accessibility, Best Practices, SEO
- Si un score < 100, documenter la raison ici

## Phase 7 — Differentiateurs secondaires
- Benchmark Comparison: hardcoded reference dataset, caption near score gauge
- Command Palette: Cmd+K with cmdk, navigation actions + language switch
- Streaming Report: SSE endpoint for Groq streaming, progressive narration in loading screen
- Public API: POST /api/v1/analyze with API key auth
- CLI Tool: poisik analyze <file|url> with --json and --open flags

## Phase 6 — Differentiateurs prioritaires
- Fix In Code: code_fix schema, AI prompt, UI with Copy button on issue cards
- Live URL Analysis: upload/URL toggle on `/upload`, screenshot capture API with Playwright
- **TODO**: Install `@sparticuz/chromium` for Vercel serverless compatibility, OR switch to a managed screenshot API (urlbox.io, screenshotone.com, etc.)

## Phase 5 — Quality & Deployment
- Unit tests for WCAG contrast, AI schema validation
- PROGRESS.md created
- README.md updated

## Phase 4 — Growth & Monetization (Complete)
- i18n via next-intl (EN/FR locale routing, language switcher, messages)
- Stripe billing (pricing page, checkout, webhook, Customer Portal)
- Team plan added ($39/month)

## Phase 3 — Product Surface (Complete)
- Landing page with hero, features, CTA
- Demo page with mock analysis
- Compare page (side-by-side)
- 404 page
- Analysis loading screen
- Public share view (readOnly report mode)

## Phase 2 — Core Pipeline (Complete)
- Upload pipeline (UploadThing, dropzone, Sharp resize)
- AI Analysis (Groq primary, Gemini fallback, Zod validation, WCAG re-check)
- Report screen (split-view, annotations, filters, PDF/Share actions)

## Phase 1 — Foundation (Complete)
- Design system tokens (colors, typography, spacing)
- shadcn/ui components (Button, Badge, Card, Dialog, Tabs, Tooltip, Skeleton)
- Custom Poisik components (Logo, CircularGauge, AnnotationMarker, CategoryScoreBar)
- Design system preview route
- Font: Inter, full dark theme
