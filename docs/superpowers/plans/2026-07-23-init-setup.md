# Feature 01 — Init & Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraint for this project:** no command or file change runs without the user's explicit go-ahead first — this overrides any "proceed automatically" default. Pause before every `git push`, `gh pr create`, `vercel link`, and before installing dependencies, and show the user what is about to run.

**Goal:** a working, lint-clean, typed Next.js repo (pushed to GitHub, feature-branched) that every later Poisik feature builds on top of.

**Architecture:** Single Next.js 15 (App Router) app in TypeScript strict mode, styled with Tailwind + shadcn/ui, backed by Prisma/PostgreSQL, deployed to Vercel. This plan only covers scaffolding and tooling — no business logic, no screens beyond a placeholder homepage.

**Tech Stack:** Next.js (latest stable), TypeScript strict, Tailwind CSS, shadcn/ui, lucide-react, sharp, uploadthing + @uploadthing/react, zod, @prisma/client + prisma, next-intl, stripe, wcag-contrast, colorthief, ESLint, Prettier, Husky, lint-staged, Vitest, pnpm.

## Global Constraints

- Package manager: **pnpm** (user-confirmed, fastest install/dev-server startup).
- TypeScript `strict: true` in `tsconfig.json`.
- Next.js App Router, latest stable release.
- `package.json` scripts required: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test`.
- ESLint (Next.js recommended config) + Prettier — no rule conflicts between the two.
- Husky + lint-staged: pre-commit runs lint + typecheck on staged files.
- Git remote: `https://github.com/SaadaniMohamedAmine/poisik-design-critic.git`, default branch `main`.
- Workflow: **every feature — including this one — is built on a branch cut from `main`, then merged via PR.** Never commit feature work straight to `main`.
- `main`'s first commit carries the existing spec (`features/`) and design assets (`stitch_poisik_ai_analysis_report/`, renamed to `design/`) — not an empty/placeholder commit.
- Folder structure (propose, adjust only with strong reason):
  ```
  app/
    (marketing)/          → landing, pricing, demo
    (app)/                → upload, analyze, report, history, compare
    api/                  → route handlers (analyze, upload webhook, stripe webhook, etc.)
  components/
    ui/                   → shadcn primitives
    poisik/               → branded components (logo, gauge, annotation overlay, etc.)
  lib/                    → ai client, wcag utils, stripe client, db client
  types/
  messages/               → en.json, fr.json (i18n)
  prisma/                 → schema.prisma, migrations
  ```
- `.env.example` must document every key the whole project will need:
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
- Definition of Done (whole feature): fresh `git clone` → `pnpm install` → `pnpm dev` works with no errors; `pnpm lint` and `pnpm typecheck` pass with zero errors; placeholder homepage renders at `/`; Vercel preview deployment succeeds.

---

### Task 0: Initialize git repo and commit the existing spec/design assets to `main`

**Files:**
- Create: `.gitignore` (minimal, pre-scaffold version — OS/editor junk only)
- Rename: `stitch_poisik_ai_analysis_report/` → `design/`
- Track (no content changes): `features/**`, `design/**`

**Interfaces:**
- Produces: a `main` branch on GitHub containing `features/` (spec) and `design/` (Stitch exports) as the baseline every later branch forks from.

- [ ] **Step 1: Confirm current directory has no existing `.git`**

Run: `git status`
Expected: `fatal: not a git repository (or any of the parent directories): .git`

- [ ] **Step 2: Initialize git**

```bash
git init
git branch -M main
```

- [ ] **Step 3: Rename the Stitch export folder to match spec references**

```bash
git mv stitch_poisik_ai_analysis_report design 2>/dev/null || mv stitch_poisik_ai_analysis_report design
```
(`git mv` will no-op/fail before the first commit since nothing is tracked yet — plain `mv` is the real operation here; the `||` is a safety fallback, not error handling for a real failure case.)

- [ ] **Step 4: Add a minimal pre-scaffold `.gitignore`**

```gitignore
# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
```

- [ ] **Step 5: Stage and commit the spec + design baseline**

```bash
git add features/ design/ .gitignore
git commit -m "chore: add project spec and design references"
```

- [ ] **Step 6: Add the GitHub remote and push `main`**

```bash
git remote add origin https://github.com/SaadaniMohamedAmine/poisik-design-critic.git
git push -u origin main
```

Expected: push succeeds, `main` on GitHub shows `features/` and `design/`.

- [ ] **Step 7: Cut the feature branch for this feature's own work**

```bash
git checkout -b feat/init-setup
```

All remaining tasks in this plan happen on `feat/init-setup`.

---

### Task 1: Scaffold the Next.js app

**Files:**
- Create: entire `create-next-app` output (`app/`, `public/`, `next.config.ts`, `tsconfig.json`, `package.json`, etc.) at repo root
- Modify: `tsconfig.json` (`"strict": true`)

**Interfaces:**
- Produces: a running `pnpm dev` dev server and `pnpm build` — every later task assumes this exists.

- [ ] **Step 1: Run create-next-app into the current directory**

```bash
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm
```
Answer prompts: TypeScript strict mode = Yes (or edit `tsconfig.json` right after, per Step 2). It will detect the non-empty directory (`features/`, `design/`, `.git/`) — confirm proceeding when prompted.

- [ ] **Step 2: Verify/force TypeScript strict mode**

Open `tsconfig.json`, confirm `"compilerOptions": { "strict": true, ... }`. If not already `true`, set it.

- [ ] **Step 3: Verify the dev server runs**

Run: `pnpm dev` (start it, confirm it boots, then stop with Ctrl+C)
Expected: `Ready in <N>ms`, no errors, `http://localhost:3000` serves the default Next.js starter page.

- [ ] **Step 4: Verify the production build works**

Run: `pnpm build`
Expected: build completes with exit code 0, no type errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with TypeScript strict mode"
```

---

### Task 2: Install core project dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: the scaffolded app from Task 1.
- Produces: all packages later features (`03`–`20`) import — `sharp`, `uploadthing`, `zod`, `@prisma/client`, `next-intl`, `stripe`, `wcag-contrast`, `colorthief`, `lucide-react`.

- [ ] **Step 1: Install runtime dependencies**

```bash
pnpm add sharp uploadthing @uploadthing/react zod @prisma/client next-intl stripe wcag-contrast colorthief lucide-react
```

- [ ] **Step 2: Install Prisma CLI as a dev dependency**

```bash
pnpm add -D prisma
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```
Use defaults consistent with the App Router + Tailwind setup from Task 1 (base color/style will be re-themed in Feature 02 — don't hand-tune tokens here).

- [ ] **Step 4: Verify install integrity**

Run: `pnpm install`
Expected: exits 0, `pnpm-lock.yaml` is up to date, no peer-dependency errors printed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: install core dependencies (uploadthing, prisma, stripe, next-intl, shadcn/ui, etc.)"
```

---

### Task 3: ESLint + Prettier, no conflicts

**Files:**
- Modify: `eslint.config.mjs` (or `.eslintrc.json`, whichever `create-next-app` generated)
- Create: `.prettierrc`, `.prettierignore`

**Interfaces:**
- Produces: `pnpm lint` (used by Task 5's script wiring and by Husky in Task 4).

- [ ] **Step 1: Install Prettier + the ESLint/Prettier bridge**

```bash
pnpm add -D prettier eslint-config-prettier
```

- [ ] **Step 2: Add `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 3: Add `.prettierignore`**

```
.next/
node_modules/
pnpm-lock.yaml
```

- [ ] **Step 4: Disable stylistic ESLint rules that fight Prettier**

In the ESLint config's `extends` array, append `"prettier"` **last** (so it overrides conflicting stylistic rules from `next/core-web-vitals`).

- [ ] **Step 5: Verify no conflicts**

Run: `pnpm lint`
Expected: exits 0, no formatting-related rule errors (only genuine lint issues, if any, would remain).

Run: `pnpm dlx prettier --check .`
Expected: exits 0 (or lists files to format — run `pnpm dlx prettier --write .` once if so, then re-check).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Prettier and reconcile with ESLint"
```

---

### Task 4: Husky + lint-staged pre-commit hook

**Files:**
- Create: `.husky/pre-commit`
- Modify: `package.json` (add `lint-staged` config)

**Interfaces:**
- Consumes: `pnpm lint` (added in Task 3). The lint-staged config below calls `tsc --noEmit` directly rather than a `pnpm typecheck` script, so this task does not depend on Task 5 having run yet.

- [ ] **Step 1: Install Husky and lint-staged**

```bash
pnpm add -D husky lint-staged
```

- [ ] **Step 2: Initialize Husky**

```bash
pnpm exec husky init
```

- [ ] **Step 3: Replace `.husky/pre-commit` contents**

```sh
pnpm exec lint-staged
```

- [ ] **Step 4: Add `lint-staged` config to `package.json`**

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "bash -c 'tsc --noEmit'"
  ],
  "*.{ts,tsx,js,jsx,json,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 5: Verify the hook fires**

```bash
echo "" >> README.md
git add README.md
git commit -m "test: verify pre-commit hook"
```
Expected: commit output shows `lint-staged` running before the commit completes successfully.

- [ ] **Step 6: Commit (if Step 5's test commit wasn't the real one, this is already committed — otherwise commit the hook files)**

```bash
git add -A
git commit -m "chore: add Husky pre-commit hook running lint-staged"
```

---

### Task 5: `package.json` scripts and a minimal test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: `pnpm typecheck`, `pnpm test` — referenced by Task 4's lint-staged config and by CI later (`11-quality-deployment.md`).

- [ ] **Step 1: Install Vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Add `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Write a smoke test**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('project setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 5: Run each script and verify**

Run: `pnpm typecheck` → Expected: exits 0, no type errors.
Run: `pnpm test` → Expected: `1 passed`.
Run: `pnpm lint` → Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add typecheck/test scripts and Vitest smoke test"
```

---

### Task 6: Folder structure

**Files:**
- Create: `app/(marketing)/.gitkeep`, `app/(app)/.gitkeep`, `app/api/.gitkeep`, `components/ui/.gitkeep`, `components/poisik/.gitkeep`, `lib/.gitkeep`, `types/.gitkeep`, `messages/en.json`, `messages/fr.json`, `prisma/.gitkeep`

**Interfaces:**
- Produces: the directory layout every later feature (`02`–`20`) places files into. `messages/en.json` / `messages/fr.json` are placeholders — real i18n wiring happens in `09-i18n.md`.

- [ ] **Step 1: Create the route groups and empty folders**

```bash
mkdir -p "app/(marketing)" "app/(app)" "app/api" "components/ui" "components/poisik" "lib" "types" "prisma"
touch "app/(marketing)/.gitkeep" "app/(app)/.gitkeep" "app/api/.gitkeep" "components/poisik/.gitkeep" "lib/.gitkeep" "types/.gitkeep" "prisma/.gitkeep"
```
(`components/ui` will already have content from shadcn's init in Task 2 — no `.gitkeep` needed there.)

- [ ] **Step 2: Create placeholder message files**

```json
// messages/en.json
{}
```
```json
// messages/fr.json
{}
```

- [ ] **Step 3: Verify build still passes with new empty route groups**

Run: `pnpm build`
Expected: exits 0 (empty route groups with no `page.tsx` don't break the build as long as `app/page.tsx` from the scaffold still exists at root).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add project folder structure"
```

---

### Task 7: Environment variables

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (add `.env*`, `node_modules`, `.next`, if `create-next-app` didn't already)

**Interfaces:**
- Produces: `.env.example` — the documented contract every later feature's server code reads from (`OPENAI_API_KEY`, `DATABASE_URL`, etc.).

- [ ] **Step 1: Verify `.gitignore` covers Next.js + secrets**

Confirm these lines exist (add any missing):
```
node_modules/
.next/
.env
.env.local
.env*.local
```

- [ ] **Step 2: Create `.env.example`**

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

- [ ] **Step 3: Verify it's tracked and `.env` variants are not**

Run: `git check-ignore -v .env.local`
Expected: prints a match against the `.gitignore` rule (confirms local secrets can never be committed).

Run: `git status`
Expected: `.env.example` shows as untracked/staged; no `.env` or `.env.local` appears.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: document required environment variables"
```

---

### Task 8: Push branch and open the PR

**Files:** none (git/GitHub operations only)

**Interfaces:**
- Consumes: all commits from Tasks 0–7 on `feat/init-setup`.
- Produces: an open PR against `main` — the review checkpoint before this feature is considered done.

- [ ] **Step 1: Push the feature branch**

```bash
git push -u origin feat/init-setup
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "chore: init & setup (Feature 01)" --body "$(cat <<'EOF'
## Summary
- Scaffold Next.js (App Router, TypeScript strict) with pnpm
- Core dependencies: Tailwind, shadcn/ui, sharp, uploadthing, zod, Prisma, next-intl, Stripe, wcag-contrast, colorthief
- ESLint + Prettier (no conflicts), Husky + lint-staged pre-commit
- package.json scripts: dev, build, start, lint, typecheck, test (Vitest smoke test)
- Project folder structure per features/01-init-setup.md
- .env.example documenting all required keys

## Test plan
- [ ] `pnpm install` from a clean clone
- [ ] `pnpm dev` boots with no errors
- [ ] `pnpm lint` and `pnpm typecheck` pass
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes
EOF
)"
```

- [ ] **Step 3: Confirm CI/preview (if configured) or hand off to Task 9 for Vercel linking**

---

### Task 9: Vercel project link and preview deployment (requires separate, explicit go-ahead — touches the user's Vercel account)

**Files:** none (Vercel dashboard/CLI operations)

**Interfaces:**
- Consumes: the pushed `feat/init-setup` branch / opened PR from Task 8.
- Produces: a linked Vercel project with env vars configured and automatic preview deployments — satisfies the feature's final Definition of Done item.

- [ ] **Step 1: Ask the user to confirm before touching their Vercel account**

Do not run `vercel link` or add env vars until the user explicitly says to proceed with this task — it creates/modifies a resource on a shared, external platform.

- [ ] **Step 2: Link the repo to a Vercel project**

```bash
pnpm dlx vercel link
```

- [ ] **Step 3: Add every key from `.env.example` to Vercel (Preview + Production)**

```bash
pnpm dlx vercel env add OPENAI_API_KEY preview
pnpm dlx vercel env add OPENAI_API_KEY production
# repeat per key in .env.example
```
(Real secret values must come from the user — never invent placeholder secrets.)

- [ ] **Step 4: Confirm the PR triggers a preview deployment**

Check the PR opened in Task 8 for a Vercel bot comment/status with a preview URL.
Expected: preview build succeeds, URL loads the placeholder homepage.

---

## Self-Review Notes

- **Spec coverage:** all 7 numbered tasks in `features/01-init-setup.md` map to Tasks 0–9 above (git → Task 0/8, deps → Task 2, tooling → Tasks 3/4/5, folder structure → Task 6, env vars → Task 7, Vercel → Task 9).
- **User-specific additions folded in:** pnpm throughout, GitHub remote + branch-per-feature workflow (Task 0, 8), `design/` rename (Task 0), permission checkpoints before any push/PR/Vercel action.
- **No placeholders:** every step has a runnable command or literal file content.
