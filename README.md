<p align="center">
  <img src="public/hero-dashboard.jpg" alt="Poisik audit dashboard" width="820" />
</p>

<h1 align="center">Poisik</h1>

<p align="center">
  <strong>AI-powered UX/UI design auditor.</strong><br />
  Upload a screen, get an expert-level critique on visual hierarchy, contrast, spacing, typography, and accessibility — with fixes, not just findings.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Postgres-Neon-4169E1?logo=postgresql&logoColor=white" />
</p>

---

## Overview

Poisik analyzes a UI screenshot (or a live URL) against six design categories and returns a structured, actionable report: an overall score, per-category breakdowns, and a prioritized issue list — each with a concrete code fix, not just a description of what's wrong.

| Category             | What it checks                                                                |
| -------------------- | ----------------------------------------------------------------------------- |
| **Visual Hierarchy** | Whether the most important content is seen first, through scale and luminance |
| **Contrast**         | Automated WCAG 2.1 AA/AAA checks for every color pair in the UI               |
| **Spacing**          | 8pt-grid alignment, detecting visual noise and inconsistent gaps              |
| **Typography**       | Font weights, line-heights, and reading comfort                               |
| **Accessibility**    | Focus states, tap targets, ARIA labeling — beyond color alone                 |
| **Consistency**      | Component drift across the interface (radii, paddings, styles)                |

## Features

- **AI analysis pipeline** — Groq as the primary vision model, Gemini as an automatic fallback, with Zod-validated output and a deterministic WCAG re-check layered on top of the AI's own contrast calls
- **Fix in code** — every issue ships with a copy-pasteable CSS/Tailwind snippet, not just a recommendation
- **Projects & history** — screens are grouped into projects with a running score trend over time
- **Compare mode** — side-by-side diff between two audits of the same project, with a computed score-lift and category-delta breakdown
- **Authenticated accounts** — email/password and Google OAuth via NextAuth, JWT sessions, plan-gated usage limits (Free / Pro / Team)
- **Billing** — Stripe Checkout + Customer Portal, webhook-driven plan sync
- **Notifications & onboarding** — in-app notification center, welcome modal, and a guided product tour for first-time users
- **i18n** — fully localized in English and French, including AI-generated report content (no post-hoc translation)
- **Public API & CLI** — `POST /api/v1/analyze` behind an API key, plus a minimal `poisik analyze <file|url>` CLI wrapper (see [`cli/`](cli))
- **PDF export & public sharing** — export a report or share a read-only link

## Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Framework      | Next.js 16 (App Router, Turbopack)                     |
| Language       | TypeScript (strict)                                    |
| Styling        | Tailwind CSS 4 + shadcn/ui                             |
| Database       | PostgreSQL (Neon, serverless driver) + Prisma 7        |
| Auth           | NextAuth v5 (Credentials + Google OAuth, JWT sessions) |
| AI             | Groq (primary) → Gemini (fallback)                     |
| File storage   | UploadThing                                            |
| Payments       | Stripe (Checkout, Customer Portal, webhooks)           |
| Error tracking | Sentry                                                 |
| i18n           | next-intl (EN / FR)                                    |
| Testing        | Vitest (unit) + Playwright (e2e)                       |

## Getting Started

**Prerequisites:** Node 20+, pnpm, and a PostgreSQL database (this project targets [Neon](https://neon.tech)).

```bash
pnpm install
cp .env.example .env.local   # then fill in the values, see below
pnpm prisma migrate dev
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to a locale-prefixed route (`/en` or `/fr`).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable                                                                                                                  | Purpose                                                         |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`                                                                                                            | PostgreSQL connection string (Neon)                             |
| `AUTH_SECRET`                                                                                                             | NextAuth session encryption secret                              |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                                                               | Google OAuth sign-in                                            |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` / `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED`                                     | Facebook OAuth (staged behind a flag — not yet live)            |
| `GROQ_API_KEY` / `GEMINI_API_KEY`                                                                                         | AI analysis providers                                           |
| `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` / `UPLOADTHING_TOKEN`                                                         | Screenshot uploads                                              |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_PRO_PRICE_ID` / `STRIPE_TEAM_PRICE_ID` | Billing                                                         |
| `SENTRY_DSN`                                                                                                              | Error tracking                                                  |
| `POISIK_API_KEY`                                                                                                          | Auth for the public `/api/v1/analyze` endpoint                  |
| `NEXT_PUBLIC_SITE_URL`                                                                                                    | Canonical domain (used in Stripe redirect URLs, absolute links) |

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Start the development server         |
| `pnpm build`     | `prisma generate` + production build |
| `pnpm start`     | Run the production build             |
| `pnpm lint`      | ESLint                               |
| `pnpm typecheck` | `tsc --noEmit`                       |
| `pnpm test`      | Vitest unit tests                    |
| `pnpm test:e2e`  | Playwright end-to-end tests          |

## Routes

| Path                                         | Description                                                 |
| -------------------------------------------- | ----------------------------------------------------------- |
| `/`                                          | Landing page                                                |
| `/sign-in`, `/sign-up`                       | Auth flows                                                  |
| `/dashboard`                                 | Authenticated home — stats, score trend, recent activity    |
| `/projects`, `/projects/[id]`                | Project list and detail (analyses, score trend, compare)    |
| `/projects/[id]/analyze`                     | Upload a screenshot for a new audit                         |
| `/projects/[id]/compare`                     | Pick two audits and diff them                               |
| `/report/[id]`                               | Full analysis report (owner view or public read-only share) |
| `/demo`                                      | Static demo report — no AI call, no account required        |
| `/settings`                                  | Profile, billing, danger zone                               |
| `/pricing`                                   | Free / Pro / Team plans                                     |
| `/audit-logs`, `/knowledge-base`, `/support` | Secondary authenticated pages                               |
| `/design-system`                             | Internal token & component preview                          |

## Architecture Notes

- **Locale-prefixed routing** — every page lives under `/[locale]`, resolved by `next-intl/middleware`
- **Edge-safe auth split** — `auth.config.ts` (no Prisma adapter/providers) powers the Edge middleware's session check; the full `auth.ts` (Prisma adapter, providers) only loads in Node runtimes — keeps the Edge Function bundle small
- **Route groups** — `(auth)` for sign-in/up, `(authenticated)` for the gated app shell, `(app)` for public marketing/legal pages
- **Usage gating** — a monthly `UsageRecord` per user backs the Free/Pro/Team limits in `lib/plans.ts`; credits are spent before the AI call and refunded on a failed analysis
- **Data layer** — Prisma 7 over Neon's serverless driver (`@prisma/adapter-neon`), no connection pooling service required

## Public API & CLI

```bash
curl -X POST https://<your-deployment>/api/v1/analyze \
  -H "x-api-key: $POISIK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/screenshot.png"}'
```

A minimal CLI wrapper lives in [`cli/`](cli):

```bash
POISIK_API_KEY=... node cli/bin.js analyze ./screenshot.png [--json] [--open]
```

## Testing

```bash
pnpm test        # Vitest — WCAG contrast math, AI schema validation
pnpm test:e2e    # Playwright — critical user flows
```

---

<p align="center">Made with poise.</p>
