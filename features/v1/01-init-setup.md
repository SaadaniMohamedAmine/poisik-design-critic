# 01 — Init & Setup

**Depends on:** nothing (do this first).
**Goal:** a working, lint-clean, typed Next.js repo that every later category builds on top of.

## Tasks

1. **Scaffold the project**
   - Create a new Next.js app using the latest stable release, App Router, TypeScript strict mode enabled (`strict: true` in `tsconfig.json`).
   - Package manager: npm (or pnpm if the agent prefers — stay consistent, commit the lockfile).

2. **Install core dependencies**
   - `tailwindcss` + config, `@shadcn/ui` (init via its CLI), `lucide-react`
   - `sharp`, `uploadthing` + `@uploadthing/react`
   - `zod` (schema validation, used in `04-ai-analysis.md`)
   - `@prisma/client` + `prisma` (or your preferred PostgreSQL ORM — Prisma recommended for this stack)
   - `next-intl`
   - `stripe` (server SDK)
   - `wcag-contrast`, `colorthief` (or `color-thief-node` for server-side use)

3. **Git**
   - `git init`, sensible `.gitignore` (node_modules, .env*, .next, etc.)
   - Initial commit: "chore: project init"
   - Branch strategy: `main` = production, feature branches per category (e.g. `feat/upload-flow`, `feat/pricing`)

4. **Tooling**
   - ESLint (Next.js recommended config) + Prettier, no conflicts between the two
   - Husky + lint-staged: pre-commit runs lint + typecheck on staged files
   - `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test`

5. **Folder structure** (propose this, adjust only if there's a strong reason not to)
   ```
   app/
     (marketing)/          → landing, pricing, demo
     (app)/                → upload, analyze, report, history, compare
     api/                  → route handlers (analyze, upload webhook, stripe webhook, etc.)
     [locale]/              → if next-intl routing requires it
   components/
     ui/                   → shadcn primitives
     poisik/               → branded components (logo, gauge, annotation overlay, etc.)
   lib/                    → ai client, wcag utils, stripe client, db client
   types/
   messages/               → en.json, fr.json (i18n)
   prisma/                 → schema.prisma, migrations
   ```

6. **Environment variables** — create `.env.example` with every key the whole project will need (fill real values later, this file documents them):
   ```
   OPENAI_API_KEY=
   ANTHROPIC_API_KEY=
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
   DATABASE_URL=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   STRIPE_PUBLISHABLE_KEY=
   NEXT_PUBLIC_SITE_URL=
   ```

7. **Vercel**
   - Link the repo to a Vercel project
   - Add all env vars from `.env.example` to Vercel (Preview + Production)
   - Confirm automatic preview deployments on PRs work

## Definition of Done
- Fresh `git clone` → `npm install` → `npm run dev` works with no errors
- `npm run lint` and `npm run typecheck` both pass with zero errors
- A placeholder homepage renders at `/` (will be replaced in `06-support-pages.md`)
- Vercel preview deployment succeeds
