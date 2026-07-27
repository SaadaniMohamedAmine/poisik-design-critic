# Poisik — Progress Log

## Phase 9 — Premium UI Polish (Complete — 7/7)
- **Report page**: fixed hardcoded demo image (now shows the real uploaded screenshot), NaN annotation marker numbers, wrong navbar/chrome (moved to a top-level route that picks owner vs. public chrome at runtime), marker/image misalignment (real screenshots no longer cropped into a fixed phone-bezel aspect ratio)
- **Error handling**: sanitized AI provider errors before they reach the client (`toFriendlyAiErrorMessage`), refund the usage credit on a failed analysis instead of burning it
- **Dashboard**: icon+subtitle header, richer stat cards, gradient score-trend chart, zero-quota state (monochrome, no red), responsive app shell with a mobile nav drawer, content container aligned with the top navbar
- **Projects**: rebuilt list page from `design_v2/all_projects` — search, rich cards (thumbnail, score badge, updated time, real analysis count), inline "start new project" tile
- **Settings**: rebuilt from `design_v2`/`design_v3` settings mockups — tabbed layout (Profile / Billing / Danger zone), editable name (new `PATCH /api/account` + NextAuth session refresh), real `PlanUsageWidget` with a working Upgrade-to-Pro CTA for FREE users (previously missing), Stripe Customer Portal link for paying users instead of fake payment/invoice data, fully responsive (scrollable tab pills on mobile, vertical list on desktop). Added an explicit "Settings" item to the sidebar/mobile nav (previously only reachable via the avatar dropdown or by clicking the plan-usage box)
- **Project Detail** (`projects/[id]`): rebuilt from `design_v2/project_alpha_details` — inline rename + delete (wired to the pre-existing but previously unused ownership-checked `PATCH`/`DELETE /api/projects/[id]`), real per-project score trend chart, "Latest findings" panel computed from the latest analysis's real issues (critical/warning/suggestion counts, monochrome), analyses list with real thumbnails/scores/dates ("Audit #N" instead of invented titles), Compare action gated on 2+ analyses, mobile-responsive
- **Project Detail — color pass**: after comparing against the original mockup, redone per explicit direction to match it exactly — colored PASSED/FAIL/WARNING status + score bar (`#f3bf4f`/`#ffb4ab`, scoped one-off exception to the monochrome rule), colored Key Findings dots, real bar-chart score trend with functional 30D/90D filters, fixed bottom action bar. Kept "Audit #N" (no fake titles) and swapped the mockup's fabricated "next scan in 14 hours" card for a real "Priority focus area" callout. `CATEGORY_LABELS` extracted to `lib/categories.ts`, shared with `ReportView`. **Open question**: `ReportView`'s own severity badges (critical/warning/suggestion) are still monochrome — this page is now the only colored surface in the app; flagged to the user, no decision yet on whether to propagate or revert
- **Project Detail — action bar**: dropped the mockup's fixed-to-viewport bottom bar per feedback (felt like a mobile tab bar, broke the app's padded-card layout convention). Replaced with `ProjectActionBar`, a `sticky top-20` bar docking below `TopBarAuth` — active project name + Compare/New Analysis stay reachable while scrolling without leaving the page's normal content flow
- **Compare** (`projects/[id]/compare`): picker rebuilt from `design_v2/select_analyses_to_compare` — thumbnail cards with checkbox overlay, date pill, "X of 2 selected" footer, shake nudge past the 2-item cap. Kept "Audit #N" + real issue counts instead of the mockup's invented version names/captions. Result view restyled with the same icon-badge header pattern
- **Analyze/Upload** (`projects/[id]/analyze`): matched `design_v1/upload_design_poisik` — display-lg headline, ambient blobs, inset glow card, pro-tip callout. Wired `UploadDropzone` to the `Upload.*` i18n keys that already existed in `messages/en.json`/`fr.json` but weren't consumed (component had hardcoded English instead) — French users now see translated copy on this screen
- **Analyze/Upload — bugfix**: fixed "Security scan passed" label wrapping onto two lines in the selected-file footer (flex row let the button pair squeeze the label below its natural width); switched to `flex-wrap` + `shrink-0`/`whitespace-nowrap` on the label, dropped the responsive breakpoint from `md` to `sm`, trimmed oversized button padding
- **New Analysis picker** (`projects/new-analysis`): no matching Stitch mockup for this screen, so rebuilt using the app's own established header pattern instead — icon badge + h1 + subtitle, project rows upgraded from plain text links to bordered cards with a folder icon, real per-project analysis count, and hover arrow affordance; empty state (0 projects) and create-project form both restyled to match (bordered card, icon badge)
- Commits: `25bc169`, `b00279c`, `0b96eec`, `76e87e1`, `0a4d01f`, `d9b70b7`, `c928b4f`, `1730f56`, `6ca9d9d`, `b1b2f6f`, `82ea174`, `9ba070a`, `186f1fd`, `00e7b39`, `53ec5fe`, `6ef3f2b`, `b37bf2b`

## Phase 10 — Design Backlog Sweep (Complete — 3/3)
- **Compare result view — enriched from `design_v1/comparison_poisik`**: this mockup (a richer "Audit Comparison" screen) had never been implemented; the Compare page had only used `design_v2/select_analyses_to_compare`. Brought over its bento before/after cards, "Score lift" badge, and Category Delta table with per-category icons. Deliberately dropped the mockup's fake sidebar/topnav ("Audit Logs", "Knowledge Base", "Project Alpha V2.4.0", "Export Report") since none of that exists in the real app — kept the real AppShell chrome. Replaced fabricated content with real computed equivalents: "Total Lift +24%" → real `(scoreB-scoreA)/scoreA` percentage; "INSIGHTS APPLIED" static badge → real issues-resolved/added count; the hardcoded "AI Recommendation Context" paragraph (fake WCAG AAA claim) → a real "Key improvements" line computed from the two biggest positive `category_scores` deltas, with a fallback message when no category improved; "View Technical Details" fake button → real link to `/report/[id]` for the newer audit. Judgment call: colored the "after" card with an accent glow/badge but kept "before" neutral (not literal mockup red) since red-for-before would misleadingly imply a bad score even when the earlier audit already scored well — open to revisiting if a literal match is preferred
- **`design_v1/system_status_poisik`**: mislabeled — it's not a public uptime/status page, its own title is "Audit Status States" and its content is 3 UI states (empty history hero, upload-error card, API-error/retry card) plus a feature-trio footer. The empty-history hero already existed on Project Detail (matching closely); added the one genuinely missing piece: analysis failures on the Analyze page only ever showed a toast that auto-closes after 5s. Added a persistent inline error card matching the mockup's card style, split into the two real failure modes the API actually returns — `MONTHLY_LIMIT_REACHED` (card, now opens `UpgradeModal` — see below) vs a generic sanitized API failure (card + a real "Retry analysis" button that resubmits the same image without re-uploading). Also added a "View sample report" secondary link (→ the real `/demo` page) next to "Run first analysis" on the Project Detail empty state, matching the mockup's dual-CTA pattern. Skipped the footer feature trio ("AI-Powered Audits" / "Fast Turnaround" / "W3C Compliance") — that marketing copy already lives on the landing page; duplicating it inside the authenticated app would be redundant, not missing
- **`dashboard_create_project`**: turned out to already be implemented — it's the Dashboard's existing 0-projects empty state, which independently matches the mockup almost exactly (same icon badge, same "Create your first project" headline and body copy word-for-word, same two "AI Powered" / "Standardized" quick-tip cards at ~70% opacity). No changes needed; removed from the backlog after verifying against the live code rather than just the earlier grep-based guess that called it "not done"
- **`design_v2`/`design_v3` `upgrade_modal_limit_reached`** (byte-identical in both folders): built as a real `UpgradeModal` component (Dialog-based), wired into the two real "hit the wall" moments — the Analyze page's limit-reached error card, and `PlanUsageWidget`'s at-limit CTA (previously both just linked straight to `/pricing`). The mockup's own comparison table claimed "Analyses/month: Free 3 / Pro Unlimited", "Code fixes: Limited/Included", "Custom audit rules: No/Yes" — the last two aren't real, enforced product features anywhere in the code (no plan check exists for code fixes or "custom audit rules"), and **Pro is actually capped at 100/month in `PLAN_LIMITS`, not unlimited** (only ENTERPRISE/"Team" truly has no cap) — a pre-existing inconsistency with the live `/pricing` copy, surfaced to the user and resolved by explicit decision: show the real numbers. Added `PLAN_LABELS`/`NEXT_PLAN` to `lib/plans.ts` as the single source of truth for the Free→Pro→Team ladder, and fixed `/pricing`'s Pro tier copy from "Unlimited analyses" to `${PLAN_LIMITS.PRO} analyses/month` so the two surfaces can't contradict each other again. "Upgrade to Pro" triggers the real Stripe checkout flow (same `/api/checkout` call as the pricing page); "Maybe later" just dismisses. Kept the mockup's trust-badge footer ("Secure Payment", "Cancel Anytime") since both are genuinely true (real Stripe checkout + real Customer Portal cancellation)
- Backlog cleared — all 4 originally-flagged design files have been triaged (3 built, 1 found already-done)

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
