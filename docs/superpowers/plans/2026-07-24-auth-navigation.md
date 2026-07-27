# Phase A — Auth & Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraint for this project:** no command or file change runs without the user's explicit go-ahead first. Pause before `git push` and show the user what is about to run. Do not open a PR at the end unless asked — the user has been merging branches themselves.

**Goal:** replace Poisik's anonymous-session architecture with real user accounts (email/password + Google OAuth, Facebook feature-flagged/hidden), a route-protected authenticated app shell (top bar + sidebar) distinct from the public marketing nav, and a redesigned language switcher — per `features/21-auth-navigation.md`.

**Architecture:** NextAuth v5 (`next-auth@beta`) with the Prisma adapter, JWT session strategy. One combined `prisma/schema.prisma` migration brings in every model from all three related spec files (`21-auth-navigation.md`, `07-history.md`, `10-pricing-stripe.md`) at once — Prisma requires a single consistent schema, and the spec explicitly says these three combine into one file — but this plan's **application code** only implements what `21-auth-navigation.md` itself calls for (auth + navigation shell). Dashboard widgets, Projects pages, and Stripe billing logic are separate, later phases (B and C) that build on top of the schema and shell this phase lands.

**Tech Stack:** Next.js 16 (App Router), NextAuth v5 (`next-auth@beta`), `@auth/prisma-adapter`, `bcryptjs`, Prisma 7 + `@prisma/adapter-neon` (already in use), next-intl (already in use).

## Global Constraints

- Package manager: **pnpm** throughout.
- **Existing conventions to follow, not the spec's generic example code verbatim:**
  - The Prisma client is imported from `@/lib/prisma` in this codebase (already exists, uses `@prisma/adapter-neon`) — every spec code sample that imports `@/lib/db` must be adapted to `@/lib/prisma`, importing the named export `prisma`.
  - Design tokens are the existing named Tailwind utilities (`bg-bg-base`, `text-text-primary`, `border-border`, `bg-accent-signal`, `rounded-xl`, `gap-md`, etc., all already wired in `app/globals.css`) — never the spec's raw hex literals (`bg-[#0a0f16]` etc.) or the design_v2 mockups' Material-Design role names (`surface-container-low`, `on-surface-variant`, `primary-container`, etc.). Translation table (mockup role → existing token), reuse this everywhere in this plan:
    | design_v2 mockup class | existing token |
    |---|---|
    | `bg-background` | `bg-bg-base` |
    | `bg-surface-container-low` | `bg-surface` |
    | `bg-surface-container` / `-high` / `-highest` | `bg-surface-hover` |
    | `text-on-surface` / `text-on-background` | `text-text-primary` |
    | `text-on-surface-variant` | `text-text-secondary` |
    | `border-outline-variant` | `border-border` |
    | `bg-primary-container` / `text-primary` (interactive/accent use) | `bg-accent-signal` / `text-accent-signal` |
    | `on-primary-container` (button text on accent fill) | `text-white` (matches this codebase's existing CTA buttons) |
  - Icons: `lucide-react` only — the design_v2 mockups use Google "Material Symbols" names; map each to its closest `lucide-react` icon (mapping given per-task below).
  - Locale-aware navigation for any NEW component (this plan is not modifying old pages that already ignore this): use `Link`/`usePathname`/`useRouter` from `@/i18n/navigation` (already exists, wraps `next-intl/navigation`), not plain `next/link`.
  - Routes live under `app/[locale]/...`. New authenticated routes go in a **new** route group `app/[locale]/(authenticated)/` — do NOT reuse the existing `app/[locale]/(app)/` group, which already holds `upload`, `demo`, `compare`, `history`, `pricing`, `report`, `design-system` — pages that must NOT be wrapped in the new auth-gated shell or route-protected in this phase.
  - The existing `sign-in`/`sign-up` pages at `app/[locale]/(auth)/sign-in` and `.../sign-up` are already pixel-built from Stitch designs and use the correct existing tokens — this plan wires real logic INTO them, it does not replace them with the spec's generic example markup.
- **User decision (2026-07-24):** the existing `Analysis` model (currently keyed by an anonymous `sessionId`) has no real user data behind it yet — no accounts have ever existed. It is safe to break/reset this data when migrating `Analysis` to be project-scoped; do not attempt to preserve or migrate old anonymous rows.
- **Facebook auth is feature-flagged off.** Gate any Facebook UI behind `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED` (default `false` / unset) — do not show a working "Continue with Facebook" button. The existing sign-in/sign-up pages currently show a fully-clickable-looking Facebook button that does nothing; this plan must make it visibly disabled/hidden, not leave it as dead-looking-functional UI.
- `/report/[id]` must remain reachable without authentication when `isPublic: true` — do not add it to the protected-route matcher.
- `/demo` must remain fully public and unauthenticated.
- Never invent placeholder secrets — real `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`AUTH_SECRET` values are the user's responsibility to fill in `.env.local`; this plan only documents the required keys in `.env.example`.
- `features/`, `design_v1/`, `design_v2/` are read-only references — must be untouched by any task's diff (this plan reads from `design_v2/app_shell_poisik/`, `design_v2/language_switcher_poisik/`, `design_v2/sign_in_poisik/`, `design_v2/sign_up_poisik/` for supplementary visual reference only).
- Definition of Done (this phase — the fuller DoD in `features/21-auth-navigation.md` also covers Dashboard/Projects widgets that are out of scope here, deferred to Phase B):
  - A new user can sign up via email/password or Google, and sign in the same way
  - Route protection blocks `/dashboard` and `/settings` (locale-prefixed, e.g. `/en/dashboard`) for signed-out visitors, redirecting to sign-in
  - `/report/[id]`, `/demo`, and every existing public page remain reachable without auth
  - The language switcher (new dropdown design) works identically in both the public navbar and the authenticated top bar, and preserves the current route when switching locale
  - Settings page supports profile display, linked-account display, data export, and account deletion (with cascading delete verified against the dev database)
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` all exit 0

---

### Task 1: Combined Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: a new migration under `prisma/migrations/`

**Interfaces:**
- Produces: `User`, `Account`, `Session`, `VerificationToken`, `Project`, `UsageRecord`, `Plan` enum, and an updated `Analysis` model (now `projectId`-keyed) — every later task in this plan and in Phases B/C consume these exact model/field names.

- [ ] **Step 1: Replace `prisma/schema.prisma` with exactly this**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model User {
  id                     String        @id @default(cuid())
  email                  String        @unique
  passwordHash           String?
  name                   String?
  image                  String?
  emailVerified          DateTime?
  plan                   Plan          @default(FREE)
  stripeCustomerId       String?       @unique
  stripeSubscriptionId   String?
  stripeCurrentPeriodEnd DateTime?
  accounts               Account[]
  sessions               Session[]
  projects               Project[]
  usageRecords           UsageRecord[]
  createdAt              DateTime      @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Project {
  id        String     @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  analyses  Analysis[]
}

model Analysis {
  id        String   @id @default(cuid())
  projectId String
  imageUrl  String
  result    Json
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String
  periodStart DateTime
  count       Int      @default(0)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, periodStart])
}
```

Note the `Analysis` model above replaces the old `sessionId`/`@@index([sessionId])` version entirely — this is a breaking schema change, per the user's explicit decision that no real data needs preserving.

- [ ] **Step 2: Generate and apply the migration**

```bash
pnpm dlx prisma migrate dev --name auth_projects_billing_schema
```
Expected: Prisma detects the `Analysis` table's shape changed incompatibly (dropping `sessionId`, adding `projectId` with no default and no existing `Project` rows to reference) and will prompt to reset the dev database — confirm the reset (matches the user's explicit decision in Global Constraints). If running non-interactively and it errors instead of prompting, run `pnpm dlx prisma migrate reset --force` first, then re-run the `migrate dev` command above.

- [ ] **Step 3: Regenerate the Prisma client**

```bash
pnpm dlx prisma generate
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck` — exit 0 (this mainly confirms nothing else in the codebase referenced the old `Analysis.sessionId` field; if something does, report it — don't silently patch call sites outside this task's files without noting it).

- [ ] **Step 5: Commit**

```bash
git add prisma/
git commit -m "feat(auth): add combined User/Account/Session/Project/UsageRecord schema"
```

---

### Task 2: NextAuth core config, register API, environment variables

**Files:**
- Create: `auth.ts` (project root, alongside `middleware.ts`)
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/register/route.ts`
- Modify: `.env.example`
- Modify: `package.json` (new dependencies)

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma` (Task 1's schema).
- Produces: `auth`, `signIn`, `signOut`, `handlers` exported from `@/auth` — consumed by Task 3 (sign-in/up pages), Task 4 (middleware), Task 7 (Sidebar/UserDropdown/Settings), and later Phases B/C.

- [ ] **Step 1: Install dependencies**

```bash
pnpm add next-auth@beta @auth/prisma-adapter bcryptjs
pnpm add -D @types/bcryptjs
```

- [ ] **Step 2: Create `auth.ts` at the project root**

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/sign-in' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email as string } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(creds.password as string, user.passwordHash);
        return valid ? user : null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Facebook: intentionally NOT added here yet. Keep FACEBOOK_CLIENT_ID /
    // FACEBOOK_CLIENT_SECRET documented in .env.example and gate any UI with
    // NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED — do not show a working
    // "Continue with Facebook" button until this flag is flipped to true.
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as { plan?: string }).plan ?? 'FREE';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string; plan: string }).id = token.id as string;
        (session.user as typeof session.user & { id: string; plan: string }).plan =
          (token.plan as string) ?? 'FREE';
      }
      return session;
    },
  },
});
```

Note: the `jwt`/`session` callbacks above are NOT in the original spec's example — they're added here because the spec's own downstream code (middleware, API routes, Settings) reads `session.user.id` and `session.user.plan`, which NextAuth does not populate by default under the `jwt` strategy without these callbacks. Without them, every later task that reads `session.user.id` would silently get `undefined`.

- [ ] **Step 3: Create the route handler**

`app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Create the registration endpoint**

`app/api/register/route.ts`:
```ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Please provide a valid email and a password of at least 8 characters.' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name: name ?? null } });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
```

- [ ] **Step 5: Add new keys to `.env.example`**

Append to the existing file (don't remove any existing key):
```
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED=false
```

- [ ] **Step 6: Verify**

Run: `pnpm typecheck` — exit 0.
Run: `pnpm build` — exit 0. (`auth.ts` reading `process.env.GOOGLE_CLIENT_ID!` at module load with a non-null assertion is fine even with an empty value locally — it won't throw until an actual Google sign-in is attempted.)

- [ ] **Step 7: Commit**

```bash
git add auth.ts app/api/auth app/api/register .env.example package.json pnpm-lock.yaml
git commit -m "feat(auth): add NextAuth config, register endpoint, and required env vars"
```

---

### Task 3: Wire real auth logic into the existing sign-in/sign-up pages

**Files:**
- Modify: `app/[locale]/(auth)/sign-in/page.tsx`
- Modify: `app/[locale]/(auth)/sign-up/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `@/auth` is server-only — client components must call `next-auth/react`'s `signIn` (a separate client-safe export) instead; use `POST /api/register` (Task 2) for account creation.

- [ ] **Step 1: Read both current files in full**

They're already pixel-built (Stitch design, correct existing tokens) with `'use client'`, a form with `onSubmit={(e) => e.preventDefault()}` that does nothing yet, email/password inputs, a Google button, and a Facebook button that looks clickable but isn't gated. Confirm this matches before editing — if either file's structure has materially changed, report NEEDS_CONTEXT with what's different.

- [ ] **Step 2: Sign-in page — replace the no-op submit handler and gate Facebook**

In `app/[locale]/(auth)/sign-in/page.tsx`:
- Add `import { signIn } from 'next-auth/react';`, `import { useState } from 'react';`, `import { useRouter } from 'next/navigation';`
- Add state: `const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const router = useRouter();`
- Wire the email/password `<input>` elements to `value`/`onChange` for this new state (they're currently uncontrolled).
- Replace the form's `onSubmit={(e) => e.preventDefault()}` with:
```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  const res = await signIn('credentials', { email, password, redirect: false });
  setLoading(false);
  if (res?.error) {
    setError('Incorrect email or password.');
    return;
  }
  router.push('/dashboard');
}
```
and use `onSubmit={handleSubmit}` on the `<form>`. Render `{error && <p className="text-label-sm text-accent-signal">{error}</p>}` right before the submit button (matches this page's existing error-color convention — check the file for how it currently signals errors, if at all; if none exists, this is the first, use `text-accent-signal` per the design system's severity convention for inline messages).
- Change the submit `<button>`'s label to show `{loading ? 'Signing in...' : 'Sign In'}` and add `disabled={loading}`.
- Wire the existing "Google" button's `onClick` to `() => signIn('google', { callbackUrl: '/dashboard' })`.
- Gate the Facebook button behind the feature flag: wrap it in `{process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true' ? (<button>...</button>) : (<button disabled className="... cursor-not-allowed opacity-50">Continue with Facebook — coming soon</button>)}` — keep its existing classes/icon, just add the `disabled`/`cursor-not-allowed`/`opacity-50` treatment and swap the label when the flag is off (which it always is until the user sets it in `.env.local`).

- [ ] **Step 3: Sign-up page — same treatment, plus the register call**

In `app/[locale]/(auth)/sign-up/page.tsx`, same pattern as Step 2, but the submit handler first calls the register endpoint, then signs in:
```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();

  if (!res.ok) {
    setError(data.error ?? 'Something went wrong.');
    setLoading(false);
    return;
  }

  await signIn('credentials', { email, password, redirect: false });
  setLoading(false);
  router.push('/dashboard');
}
```
Add a `name` field to state too (the page has a Name input already — confirm this and wire it the same way as email/password). Apply the same Google `onClick` wiring and the same Facebook feature-flag gating as Step 2.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.
Run: `pnpm dev`, visit `/en/sign-up`, create a test account, confirm redirect to `/en/dashboard` (a 404 here is expected and fine — Task 7 creates that page; you're only verifying the auth flow itself redirects correctly, not that the destination page exists yet). Then visit `/en/sign-in` and confirm signing in with that same account works. Stop the dev server.
Confirm the Facebook button visually reads "coming soon" and is not clickable on both pages.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/(auth)/sign-in/page.tsx" "app/[locale]/(auth)/sign-up/page.tsx"
git commit -m "feat(auth): wire real credentials/Google sign-in and sign-up, gate Facebook behind feature flag"
```

---

### Task 4: Middleware — merge route protection with existing locale/session middleware

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `auth` from `@/auth` (Task 2).

- [ ] **Step 1: Read the current `middleware.ts` in full**

It currently runs `next-intl`'s middleware and sets an anonymous `poisik_session` cookie on every request. This task adds auth-based route protection on top — it must not remove the locale handling or the session cookie (the anonymous cookie is still used by `/demo`, `/upload` in this phase; Phase B/C decide whether to retire it, not this task).

- [ ] **Step 2: Replace `middleware.ts` with exactly this**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import createMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';

const SESSION_COOKIE = 'poisik_session';
const SESSION_MAX_AGE = 365 * 24 * 60 * 60;

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

const PROTECTED_PATH_RE = /^\/(en|fr)\/(dashboard|settings)(\/|$)/;

export default async function middleware(request: NextRequest) {
  if (PROTECTED_PATH_RE.test(request.nextUrl.pathname)) {
    const session = await auth();
    if (!session?.user) {
      const locale = request.nextUrl.pathname.startsWith('/fr') ? 'fr' : 'en';
      const signInUrl = new URL(`/${locale}/sign-in`, request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const response = intlMiddleware(request) || NextResponse.next();

  if (!sessionId) {
    response.cookies.set(SESSION_COOKIE, uuidv4(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
```

Note: the export changed from a named `export function middleware` to `export default async function middleware` — required because the function is now `async` (it awaits `auth()`) and reads request state before delegating to `intlMiddleware`. Confirm this doesn't break anything Next.js expects (Next.js accepts either a named or default export named/typed as middleware — the `config` export is what actually wires up the matcher, so this is safe, but verify via the build step below rather than assuming).

- [ ] **Step 3: Verify**

Run: `pnpm build` — exit 0.
Run: `pnpm dev`. Without any session cookie, visit `/en/dashboard` — expect a redirect to `/en/sign-in`. Sign in (using the account created in Task 3), then visit `/en/dashboard` again — expect it to NOT redirect (a 404 here is still expected/fine, Task 7 creates the page — you're verifying the redirect logic specifically, not the destination page). Visit `/en/demo` while signed out — expect it to load normally (not redirected). Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): add route protection for /dashboard and /settings"
```

---

### Task 5: Redesigned language switcher (dropdown)

**Files:**
- Modify: `components/poisik/LanguageSwitcher.tsx`

**Interfaces:**
- Produces: the same `<LanguageSwitcher className? />` public API (no prop changes) — consumed by the existing landing page header (already imports it) and by Task 6/7's navbars, so its call sites don't need to change, only its internals/visual output.

- [ ] **Step 1: Reference the mockup**

Open `design_v2/language_switcher_poisik/code.html` for supplementary visual reference (dropdown panel styling, spacing) — translate any of its class names using the mapping table in Global Constraints; do not copy its raw classes verbatim.

- [ ] **Step 2: Replace `components/poisik/LanguageSwitcher.tsx` with exactly this**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
] as const;

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function switchTo(code: string) {
    router.replace(pathname, { locale: code });
    setOpen(false);
  }

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full border border-border px-sm py-xs text-label-sm text-text-secondary transition-colors hover:bg-surface-hover"
      >
        <Globe className="size-3.5" strokeWidth={1.5} />
        {locale.toUpperCase()}
        <ChevronDown className="size-3" strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border border-border bg-surface py-xs shadow-2xl">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => switchTo(code)}
              className="flex w-full items-center justify-between px-md py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              {label}
              {locale === code && <Check className="size-3.5 text-accent-signal" strokeWidth={1.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.
Run: `pnpm dev`, visit `/en`, confirm the switcher in the landing page header now shows a pill with a globe icon + "EN" + chevron, opens a dropdown with "English"/"Français", the active one has a checkmark, and clicking "Français" navigates to `/fr` preserving the rest of the path. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add components/poisik/LanguageSwitcher.tsx
git commit -m "feat(nav): redesign language switcher as a dropdown"
```

---

### Task 6: Public navbar — add Sign In / Sign Up / Pricing / Beyond Critique

**Files:**
- Modify: `app/[locale]/page.tsx` (header only)

**Interfaces:**
- Consumes: `Link` from `@/i18n/navigation` is available but this file's existing convention uses plain `next/link` for internal routes — stay consistent with the file's own established pattern (already mixed `<a>`/`<Link>` per the prior redesign task) rather than introducing a third navigation mechanism into the same file.

**Why this task exists:** `features/21-auth-navigation.md` section 3 specifies the public nav as: wordmark → `/` · Features (anchor) · Beyond Critique (anchor) · Pricing (→ `/pricing`) · Demo (→ `/demo`) — then right-aligned: language switcher · Sign In (text link) · Sign Up (solid button). The landing page's current header (built before accounts existed) has Features/Demo + a "Free plan" badge + "Analyze your design" button instead — this task brings it in line with the new spec now that accounts exist.

- [ ] **Step 1: Add two new translation keys**

`messages/en.json`, in the `Navigation` object, add:
```json
"pricing": "Pricing",
"beyondCritique": "Beyond Critique",
"signIn": "Sign In",
"signUp": "Sign Up"
```
`messages/fr.json`, same object:
```json
"pricing": "Tarifs",
"beyondCritique": "Au-delà de la critique",
"signIn": "Se connecter",
"signUp": "S'inscrire"
```

- [ ] **Step 2: Add an `id="beyond-critique"` anchor to the differentiators section**

In `app/[locale]/page.tsx`, find the differentiators `<section>` (the one starting with `<section className="bg-bg-elevated py-xxl">` containing `{t('differentiatorsEyebrow')}`) and add `id="beyond-critique"` to it, matching how the features section already has `id="features"`.

- [ ] **Step 3: Replace the header's nav and right-side content**

Replace the `<nav>` block inside the header with:
```tsx
<nav className="hidden items-center gap-lg md:flex">
  <a
    href="#features"
    className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
  >
    {n('features')}
  </a>
  <a
    href="#beyond-critique"
    className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
  >
    {n('beyondCritique')}
  </a>
  <Link
    href="/pricing"
    className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
  >
    {n('pricing')}
  </Link>
  <Link
    href="/demo"
    className="text-label-md font-medium text-text-secondary transition-colors hover:text-accent-signal"
  >
    {n('demo')}
  </Link>
</nav>
```
And replace the right-side `<div className="flex items-center gap-md">` (currently: free-plan badge, language switcher, CTA button) with:
```tsx
<div className="flex items-center gap-md">
  <LanguageSwitcher />
  <Link
    href="/sign-in"
    className="hidden text-label-md font-medium text-text-secondary transition-colors hover:text-text-primary md:inline"
  >
    {n('signIn')}
  </Link>
  <Link
    href="/sign-up"
    className="rounded-full bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
  >
    {n('signUp')}
  </Link>
</div>
```
This removes the "Free plan" badge and the "Analyze your design" nav button — both were pre-accounts placeholders; signed-out visitors are now routed to Sign In/Sign Up instead. Leave every other section of the page (hero, stats, process, features, differentiators, final CTA, footer) untouched.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Run: `pnpm dev`, visit `/en`, confirm the header now reads Features · Beyond Critique · Pricing · Demo, then language switcher · Sign In · Sign Up, and that "Beyond Critique" scrolls to the differentiators section. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/page.tsx" messages/en.json messages/fr.json
git commit -m "feat(nav): update public navbar with Sign In/Sign Up/Pricing/Beyond Critique per auth spec"
```

---

### Task 7: Authenticated app shell (TopBarAuth, Sidebar, UserDropdown) + minimal Dashboard/Settings pages

**Files:**
- Create: `app/[locale]/(authenticated)/layout.tsx`
- Create: `app/[locale]/(authenticated)/dashboard/page.tsx`
- Create: `app/[locale]/(authenticated)/settings/page.tsx`
- Create: `components/poisik/AppShell.tsx`
- Create: `components/poisik/TopBarAuth.tsx`
- Create: `components/poisik/Sidebar.tsx`
- Create: `components/poisik/UserDropdown.tsx`
- Create: `app/api/account/route.ts` (export + delete)
- Modify: `components/poisik/index.ts` (export the four new components)

**Interfaces:**
- Consumes: `auth`/`signOut` from `@/auth`, `prisma` from `@/lib/prisma`, `Link`/`usePathname` from `@/i18n/navigation`, `LanguageSwitcher` from `@/components/poisik` (Task 5).
- Produces: the `<AppShell>` wrapper other Phase B/C authenticated pages (Projects, later) will reuse by living under the same `app/[locale]/(authenticated)/` route group.

**Icon mapping (design_v2 mockup → lucide-react):** `dashboard`/home icon → `LayoutDashboard`; folder/projects icon → `FolderKanban`; add/plus icon → `Plus`; settings gear (if shown) → `Settings`; chevron → `ChevronDown`.

- [ ] **Step 1: `components/poisik/Sidebar.tsx`**

Fixed left sidebar, `w-64`, below the 80px top bar (matches `design_v2/app_shell_poisik/code.html`'s `top-20 bottom-0 w-64` structure, translated to existing tokens). Only Dashboard is a real link this phase — Projects is listed per the spec's nav but its route doesn't exist until Phase B, so link it anyway (a 404 until Phase B lands is expected and matches how Task 3/4 already tolerate not-yet-built destinations elsewhere in this same plan).

```tsx
'use client';

import { LayoutDashboard, FolderKanban, Plus } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
] as const;

interface SidebarProps {
  usage: { remaining: number | null; limit: number | null; plan: string };
}

export function Sidebar({ usage }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-20 bottom-0 left-0 hidden w-64 flex-col justify-between border-r border-border bg-surface px-md py-lg lg:flex">
      <div>
        <Link
          href="/projects"
          className="mb-lg flex w-full items-center justify-center gap-sm rounded-xl bg-accent-signal px-md py-md font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          New Analysis
        </Link>
        <nav className="space-y-xs">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-md rounded-xl px-md py-md text-label-md transition-colors ${
                  active
                    ? 'bg-accent-soft-bg text-text-primary'
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/settings"
        className="block rounded-xl border border-border p-md transition-colors hover:bg-surface-hover"
      >
        <p className="mb-xs text-label-sm text-text-secondary">{usage.plan} plan</p>
        <p className="mb-sm text-label-md text-text-primary">
          {usage.limit === null
            ? 'Unlimited analyses'
            : `${usage.remaining} of ${usage.limit} analyses left`}
        </p>
        {usage.limit !== null && (
          <div className="h-1.5 overflow-hidden rounded-full bg-border-strong">
            <div
              className="h-full bg-accent-signal"
              style={{
                width: `${Math.max(0, ((usage.limit - (usage.remaining ?? 0)) / usage.limit) * 100)}%`,
              }}
            />
          </div>
        )}
      </Link>
    </aside>
  );
}
```

Note: `usage` is hardcoded to Free-plan defaults by the caller in this phase (Task 7 Step 4's `AppShell`) since `checkAndIncrementUsage`/`PLAN_LIMITS` don't exist until Phase C (`10-pricing-stripe.md`) — this component itself is written against the final shape so Phase C only needs to wire real numbers in, not touch this file.

- [ ] **Step 2: `components/poisik/UserDropdown.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface UserDropdownProps {
  name?: string | null;
  image?: string | null;
}

export function UserDropdown({ name, image }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="size-9 overflow-hidden rounded-full border border-border bg-accent-soft-bg"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar source is an arbitrary external OAuth-provider URL, not a static local asset
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-label-sm text-text-primary">
            {name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-border bg-surface py-xs shadow-2xl">
          <Link href="/settings" className="block px-md py-sm text-label-md text-text-primary hover:bg-surface-hover">
            Account
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full px-md py-sm text-left text-label-md text-text-primary hover:bg-surface-hover"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `components/poisik/TopBarAuth.tsx`**

```tsx
import { PoisikLogo, LanguageSwitcher, UserDropdown } from '@/components/poisik';
import { Link } from '@/i18n/navigation';

interface TopBarAuthProps {
  userName?: string | null;
  userImage?: string | null;
}

export function TopBarAuth({ userName, userImage }: TopBarAuthProps) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between border-b border-border bg-bg-base px-margin">
      <Link href="/dashboard">
        <PoisikLogo size="md" />
      </Link>
      <div className="flex items-center gap-md">
        <LanguageSwitcher />
        <UserDropdown name={userName} image={userImage} />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: `components/poisik/AppShell.tsx`**

Server component — fetches the session and (best-effort) usage placeholders, then composes `TopBarAuth` + `Sidebar` + content.

```tsx
import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { TopBarAuth } from './TopBarAuth';
import { Sidebar } from './Sidebar';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const plan = ((session.user as { plan?: string }).plan ?? 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE';
  // Real usage counting lands in Phase C (10-pricing-stripe.md's checkAndIncrementUsage /
  // PLAN_LIMITS). Until then, Free-plan defaults keep the sidebar widget's shape correct
  // without fabricating a fake "remaining" number that would look like real data.
  const usage = { remaining: null as number | null, limit: null as number | null, plan };

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBarAuth userName={session.user.name} userImage={session.user.image} />
      <div className="flex pt-20">
        <Sidebar usage={usage} />
        <main className="flex-1 p-xl lg:ml-64">{children}</main>
      </div>
    </div>
  );
}
```

Note: this relies on `middleware.ts` (Task 4) having already redirected signed-out requests before this component ever renders — the `if (!session?.user)` check here is a defense-in-depth fallback, not the primary gate.

- [ ] **Step 5: Update `components/poisik/index.ts`**

Add these four lines (don't remove any existing export):
```ts
export { AppShell } from './AppShell';
export { TopBarAuth } from './TopBarAuth';
export { Sidebar } from './Sidebar';
export { UserDropdown } from './UserDropdown';
```

- [ ] **Step 6: `app/[locale]/(authenticated)/layout.tsx`**

```tsx
import { AppShell } from '@/components/poisik';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 7: `app/[locale]/(authenticated)/dashboard/page.tsx`** (minimal placeholder — full widgets are Phase B / `07-history.md`)

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-headline-lg font-semibold text-text-primary">Dashboard</h1>
      <p className="mt-sm text-body-md text-text-secondary">
        Your projects and activity will appear here.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: `app/api/account/route.ts`** (data export + account deletion, backing the Settings page)

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    include: { projects: { include: { analyses: true } } },
  });

  return NextResponse.json(user, {
    headers: { 'Content-Disposition': 'attachment; filename="poisik-account-export.json"' },
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.user.delete({ where: { id: (session.user as { id: string }).id } });
  return NextResponse.json({ ok: true });
}
```
Deleting the `User` row cascades to `Account`, `Session`, `Project` (and each `Project`'s `Analysis` rows), and `UsageRecord` via the `onDelete: Cascade` relations already declared in Task 1's schema.

- [ ] **Step 9: `app/[locale]/(authenticated)/settings/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleExport() {
    const res = await fetch('/api/account');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poisik-account-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch('/api/account', { method: 'DELETE' });
    await signOut({ callbackUrl: '/' });
  }

  return (
    <div className="max-w-2xl space-y-xl">
      <h1 className="text-headline-lg font-semibold text-text-primary">Settings</h1>

      <section className="space-y-sm rounded-xl border border-border bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Profile</h2>
        <p className="text-body-md text-text-secondary">{session?.user?.name ?? '—'}</p>
        <p className="text-body-md text-text-secondary">{session?.user?.email}</p>
        <p className="text-label-sm text-text-muted">
          Plan: {(session?.user as { plan?: string })?.plan ?? 'FREE'}
        </p>
      </section>

      <section className="space-y-md rounded-xl border border-border bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Your data</h2>
        <button
          onClick={handleExport}
          className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
        >
          Export my data
        </button>
      </section>

      <section className="space-y-md rounded-xl border border-border-strong bg-surface p-lg">
        <h2 className="text-headline-md font-medium text-text-primary">Delete account</h2>
        <p className="text-body-md text-text-secondary">
          This permanently deletes your account, projects, and analyses. This cannot be undone.
        </p>
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex items-center gap-md">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, permanently delete'}
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              className="text-label-md text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
```

Note: "Manage subscription" (Stripe portal) from the full spec is intentionally omitted here — it depends on `app/api/stripe/portal/route.ts` from Phase C (`10-pricing-stripe.md`), which doesn't exist yet. Adding a button that calls a non-existent endpoint would be worse than omitting it; Phase C adds it to this same file.

- [ ] **Step 10: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Run: `pnpm dev`, sign in with the test account from Task 3, visit `/en/dashboard` — confirm the top bar + sidebar render, "New Analysis" and "Projects" links are present (404 on click is expected, Phase B builds those routes). Visit `/en/settings` — confirm profile/email/plan render, "Export my data" downloads a JSON file, and the delete-account confirmation flow works (test it against the dev database — after deleting, confirm the account no longer exists via `pnpm dlx prisma studio` or a quick query, and that `/en/dashboard` redirects to sign-in afterward since the session is gone). Stop the dev server.

- [ ] **Step 11: Commit**

```bash
git add "app/[locale]/(authenticated)" app/api/account components/poisik/AppShell.tsx components/poisik/TopBarAuth.tsx components/poisik/Sidebar.tsx components/poisik/UserDropdown.tsx components/poisik/index.ts
git commit -m "feat(auth): add authenticated app shell (top bar, sidebar, user menu) and minimal Dashboard/Settings pages"
```

---

### Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run in order: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. All must exit 0.

- [ ] **Step 2: End-to-end manual walkthrough**

`pnpm dev`:
1. Sign up a new account (email/password) → redirected to `/en/dashboard`, shell renders
2. Sign out (via the user dropdown) → redirected to `/`
3. Visit `/en/dashboard` directly while signed out → redirected to `/en/sign-in`
4. Sign back in with the same account → lands on `/en/dashboard`
5. Visit `/en/settings`, export data, confirm the downloaded JSON contains the user record
6. Visit `/en/demo` and `/en` while signed out — both fully accessible
7. Switch language via the dropdown in both the public header and the authenticated top bar — confirm both work identically and preserve the route
Stop the dev server when done.

- [ ] **Step 3: Report**

Summarize the walkthrough results — this task has no code changes to commit, it's a gate before considering Phase A done.

## Self-Review Notes

- **Spec coverage:** every section of `features/21-auth-navigation.md` maps to a task — data model (Task 1), auth setup (Task 2), sign-in/up wiring (Task 3), middleware (Task 4), language switcher (Task 5), public navbar (Task 6), authenticated shell + Settings (Task 7). Dashboard/Projects widgets (`07-history.md`) and Stripe billing (`10-pricing-stripe.md`) are explicitly out of scope — Phases B and C.
- **Known gap filled in, not left as a placeholder:** the spec's `auth.ts` example doesn't populate `session.user.id`/`.plan`, but its own later code (and this plan's Task 7/Settings) reads them — Task 2 adds the `jwt`/`session` callbacks needed to make that actually work.
- **Cross-task consistency:** `Sidebar`'s `usage` prop shape (`{ remaining, limit, plan }`) matches what `AppShell` constructs in Task 7 Step 4, which matches the shape `10-pricing-stripe.md`'s future `checkAndIncrementUsage`/`PLAN_LIMITS` will populate — Phase C only needs to replace the placeholder values, not the shape.
- **No placeholders:** every step has literal, complete code or an exact command.
