# Poisik — Progress Log

## Phase 9 — Premium UI Polish (Complete — 6/6)
- **Report page**: fixed hardcoded demo image (now shows the real uploaded screenshot), NaN annotation marker numbers, wrong navbar/chrome (moved to a top-level route that picks owner vs. public chrome at runtime), marker/image misalignment (real screenshots no longer cropped into a fixed phone-bezel aspect ratio)
- **Error handling**: sanitized AI provider errors before they reach the client (`toFriendlyAiErrorMessage`), refund the usage credit on a failed analysis instead of burning it
- **Dashboard**: icon+subtitle header, richer stat cards, gradient score-trend chart, zero-quota state (monochrome, no red), responsive app shell with a mobile nav drawer, content container aligned with the top navbar
- **Projects**: rebuilt list page from `design_v2/all_projects` — search, rich cards (thumbnail, score badge, updated time, real analysis count), inline "start new project" tile
- **Settings**: rebuilt from `design_v2`/`design_v3` settings mockups — tabbed layout (Profile / Billing / Danger zone), editable name (new `PATCH /api/account` + NextAuth session refresh), real `PlanUsageWidget` with a working Upgrade-to-Pro CTA for FREE users (previously missing), Stripe Customer Portal link for paying users instead of fake payment/invoice data, fully responsive (scrollable tab pills on mobile, vertical list on desktop). Added an explicit "Settings" item to the sidebar/mobile nav (previously only reachable via the avatar dropdown or by clicking the plan-usage box)
- **Project Detail** (`projects/[id]`): rebuilt from `design_v2/project_alpha_details` — inline rename + delete (wired to the pre-existing but previously unused ownership-checked `PATCH`/`DELETE /api/projects/[id]`), real per-project score trend chart, "Latest findings" panel computed from the latest analysis's real issues (critical/warning/suggestion counts, monochrome), analyses list with real thumbnails/scores/dates ("Audit #N" instead of invented titles), Compare action gated on 2+ analyses, mobile-responsive
- **Project Detail — color pass**: after comparing against the original mockup, redone per explicit direction to match it exactly — colored PASSED/FAIL/WARNING status + score bar (`#f3bf4f`/`#ffb4ab`, scoped one-off exception to the monochrome rule), colored Key Findings dots, real bar-chart score trend with functional 30D/90D filters, fixed bottom action bar. Kept "Audit #N" (no fake titles) and swapped the mockup's fabricated "next scan in 14 hours" card for a real "Priority focus area" callout. `CATEGORY_LABELS` extracted to `lib/categories.ts`, shared with `ReportView`. **Open question**: `ReportView`'s own severity badges (critical/warning/suggestion) are still monochrome — this page is now the only colored surface in the app; flagged to the user, no decision yet on whether to propagate or revert
- Commits: `25bc169`, `b00279c`, `0b96eec`, `76e87e1`, `0a4d01f`, `d9b70b7`, `c928b4f`, `1730f56`, `6ca9d9d`, `b1b2f6f`, `82ea174`, `9ba070a`

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
