# Poisik

**AI-powered UX/UI audit tool** — upload a screen, get an expert-level design critique on visual hierarchy, contrast, spacing, typography, and accessibility.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL (Neon) + Prisma 7 |
| AI | Groq (primary) + Gemini (fallback) |
| Storage | UploadThing |
| Payments | Stripe |
| i18n | next-intl (EN/FR) |
| Tests | Vitest |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

- `GROQ_API_KEY` & `GEMINI_API_KEY` — AI providers
- `UPLOADTHING_SECRET` & `UPLOADTHING_APP_ID` & `UPLOADTHING_TOKEN` — file uploads
- `DATABASE_URL` — PostgreSQL (Neon)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID` — billing
- `NEXT_PUBLIC_SITE_URL` — canonical domain

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint check |
| `pnpm typecheck` | TypeScript check (`tsc --noEmit`) |
| `pnpm test` | Run Vitest suite |

## Architecture

- Locale-prefixed routing (`/en/...`, `/fr/...`)
- Anonymous session via `poisik_session` cookie (no auth required)
- Plan gating via `poisik_customer` cookie (Stripe customer ID)
- Session middleware using `next-intl/middleware` for locale detection

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/upload` | Upload screenshot for analysis |
| `/demo` | Demo report (no AI call) |
| `/report/[id]` | Full analysis report |
| `/compare` | Side-by-side design comparison |
| `/history` | Past analyses |
| `/pricing` | Free/Pro/Team plans |
| `/design-system` | Token & component preview (dev) |

## Design Decisions

- **No authentication** — free tier is fully anonymous; paying users identified via Stripe customer cookie only
- **Dark-only theme** — monochrome navy palette, no light mode
- **AI providers** — Groq (free/cheap) as primary, Gemini as fallback
- **History** — scoped to browser session, does not sync across devices
- **i18n** — AI report content generated in the requested locale via system prompt (no post-hoc translation)
