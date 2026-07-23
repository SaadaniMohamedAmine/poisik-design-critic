# 11 — Quality & Deployment

**Depends on:** everything else (do this last, and continuously alongside the other categories — don't leave all testing until the very end).
**Goal:** ship a production app that holds up — this product's whole pitch is design/accessibility quality, so it must not embarrass itself on its own quality bar.

## Tasks

1. **Unit tests** (Vitest or Jest)
   - WCAG contrast calculation (`wcag-contrast` wrapper) — known input pairs → known ratios
   - AI JSON schema parser/validator from `04-ai-analysis.md` — valid and invalid payloads
   - Plan-gating middleware from `10-pricing-stripe.md` — active/inactive/no-cookie cases

2. **E2E tests** (Playwright)
   - Happy path: upload → processing → report screen renders with annotations + issues
   - Error paths: unsupported file type, oversized file, forced API failure → correct error copy shown
   - Stripe test-mode checkout flow (using Stripe's test card numbers) → Pro features unlock
   - i18n: switching locale updates visible strings

3. **Accessibility audit of the app itself**
   - Run `axe-core` in CI against every route
   - This product's core value prop is accessibility expertise — it cannot ship with its own WCAG violations. Treat any axe failure as a blocker, not a nice-to-have

4. **Performance/Lighthouse**
   - Target 100 on Performance, Accessibility, Best Practices, and SEO (or document precisely why a specific score isn't reachable, e.g. third-party embed weight)
   - Wire into CI (Lighthouse CI) so regressions are caught on every PR

5. **Deployment**
   - Vercel: Preview deployments per PR, Production on `main`
   - Confirm every env var from `01-init-setup.md`'s `.env.example` is set in both Preview and Production Vercel environments
   - Error monitoring: Sentry (or equivalent) wired into both client and server, capturing at minimum: AI call failures, Stripe webhook failures, upload failures

6. **Documentation**
   - `README.md`: setup instructions, architecture overview, env var list, how to run tests
   - `PROGRESS.md`: running log of what's been built per category in this delegation package, updated continuously as work proceeds (not just at the end) — this is a portfolio project convention, keep it current

## Definition of Done
- CI pipeline (lint, typecheck, unit tests, E2E, Lighthouse budget, axe-core) is green on `main`
- Production deployment is live, functional, and matches the Stitch design exports
- `README.md` and `PROGRESS.md` exist and are accurate as of the final commit
