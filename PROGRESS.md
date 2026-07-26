# Poisik — Progress Log

## Phase 8 — Notifications & Onboarding (Complete)
- **Notification system**: `Notification` Prisma model (userId, type, title, message, link, read), full API (`GET /api/notifications`, `PATCH .../[id]/read`, `PATCH .../read-all`), `NotificationBell` wired into both the marketing header and the authenticated topbar (hidden when logged out)
- **Toast layer**: react-toastify installed and themed to the monochrome Dark Luxe palette (no red/green/amber), `notify()` client helper, toasts fired on sign-in ("Bienvenue encore dans Poisik"), sign-out ("Au revoir"), project creation, new analysis, and Stripe webhook events
- **Onboarding system** (from Stitch `design_v3` exports): `WelcomeModal` (3-step: Welcome / How it works / You're all set), `ProductTour` (4-step guided tour with live `getBoundingClientRect()` spotlighting on the real sidebar/topbar, desktop-only), `GettingStartedWidget` + collapsible sidebar pill (progress checklist), all orchestrated by `OnboardingFlow` and tracked via 4 nullable `DateTime` fields on `User` (idempotent PATCH endpoints)
- **Security fix**: `/api/analyses/[id]` had zero ownership check on PATCH (anyone could flip any analysis to public) and blocked owners from viewing their own private analyses on GET — both fixed
- **DB migration**: `20260726090000_add_notifications_and_onboarding` applied successfully to the production Neon database (Notification table + 4 User columns)
- Commits: `c76dff9`, `a8c055e`, `94ed7cc`, `3183561`, `e409974`

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
