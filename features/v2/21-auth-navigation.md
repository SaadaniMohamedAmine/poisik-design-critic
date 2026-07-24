# 21 — Auth & Navigation Architecture

**This file, `07-history.md` (now Projects & Dashboard), and `10-pricing-stripe.md` (now Plans & Payment) together replace the old "no auth" architecture. Each of these three files is self-contained and independently implementable — read this one for auth/navigation, `07` for Projects/Dashboard, `10` for billing/usage limits. Their Prisma models combine into a single `schema.prisma`.**

## 0. Why this exists
The project originally had no auth (anonymous free tier). That decision is reversed: Poisik now has real accounts, because usage limits need to be tied to a paying identity, and a Projects system needs a stable owner.

---

## 1. Auth data model (Prisma / PostgreSQL)

```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  passwordHash           String?   // null if the user only ever used OAuth
  name                   String?
  image                  String?
  emailVerified          DateTime?
  plan                   Plan      @default(FREE)       // Plan enum defined in 10-pricing-stripe.md
  stripeCustomerId       String?   @unique                // defined/used in 10-pricing-stripe.md
  stripeSubscriptionId   String?
  stripeCurrentPeriodEnd DateTime?
  accounts               Account[]
  sessions               Session[]
  projects               Project[]                        // Project model defined in 07-history.md
  usageRecords           UsageRecord[]                     // UsageRecord model defined in 10-pricing-stripe.md
  createdAt              DateTime  @default(now())
}

// Standard Auth.js/NextAuth models — do not deviate from this shape, the adapter expects it
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  // "google" | "facebook" | "credentials"
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
```

---

## 2. Auth setup (NextAuth / Auth.js)

**Providers:** Credentials (email/password) + Google (active) + Facebook (scaffolded, disabled — see below).

```ts
// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (creds) => {
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
];

// Facebook: intentionally NOT added to the active providers array yet.
// Keep FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET documented in .env.example and the
// import/config ready to uncomment, but gate the UI button with:
//   NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED=false
// Do not show a "Continue with Facebook" button anywhere until this flag is flipped to true.

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  pages: { signIn: "/sign-in" },
});
```

**Password requirements:** minimum 8 characters, hashed with `bcryptjs` (or `argon2` if the agent prefers) — never store plaintext.

**Email verification:** recommended but not blocking — send a verification email on signup (any transactional email provider, e.g. Resend), show an "unverified" badge in Settings if ignored, but do not lock the user out of the product over it.

**Route protection middleware:**
```ts
// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/settings/:path*"],
};
```
**Important nuance:** `/report/[id]` is NOT in this matcher. A report can be `isPublic: true` (via Share) and must stay viewable without auth — check `isPublic` inside the page/route itself rather than blanket-blocking the whole path.

---

## 3. Navbar — before login vs. after login

### Before login (public/marketing nav — shown on `/`, `/pricing`)
A single top nav, no sidebar. Left to right: `poisik` wordmark (→ `/`) · **Features** (anchor) · **Beyond Critique** (anchor) · **Pricing** (→ `/pricing`) · **Demo** (→ `/demo`) — then, right-aligned: **language switcher** (see below) · **Sign In** (text link) · **Sign Up** (solid `accent-signal` button).

### After login (app shell — shown on `/dashboard`, `/projects/*`, `/settings`, `/report/*` when owned by the viewer)
**This is a two-part shell, not a single navbar: a thin top bar + a left sidebar.** This is the standard pattern for the authenticated app (Linear/Notion/Vercel-style), distinct from the public marketing nav above.

**Top bar (thin, minimal):**
- Left: `poisik` wordmark (→ `/dashboard`)
- Right: **language switcher** (see below), then a circular **user avatar** that opens a dropdown with exactly two items — **Account** (→ `/settings`) and **Sign out**
- Nothing else lives in the top bar — no nav links, no New Analysis button here, keep it minimal

**Sidebar (left, full height, authenticated pages only):**
- Top: **"New Analysis"** button, prominent, `accent-signal`, full sidebar width
- Nav links below it: **Dashboard**, **Projects**
- Bottom of the sidebar (pinned): the usage-counter widget — plan badge (Free/Pro/Enterprise) + "2 of 3 analyses left" with the same progress-bar convention as elsewhere (`accent-signal` fill, `border-strong` track), clickable through to `/settings`'s billing tab

Public pages never show the sidebar — it only appears once the user is signed in, wrapping `/dashboard`, `/projects/*`, `/settings`.

### Language switcher dropdown (extends `09-i18n.md`)
- Trigger: a small pill button — Lucide `Globe` icon + current locale code (`EN` or `FR`) + a small chevron-down
- On click: a dropdown panel (`surface` background, `border` outline, rounded corners matching the rest of the design system) listing "English" and "Français", each with its 2-letter code; the active locale shows a `Check` icon in `accent-signal` on the right
- Selecting an option switches the `next-intl` locale while preserving the current route (`/fr/dashboard` ↔ `/en/dashboard`)
- Identical component used in both navbars — build it once, reuse everywhere

---

## 4. Complete UX walkthrough

**New visitor (no account):**
`/` → optionally checks `/demo` (zero friction, no signup) → clicks "Analyze your design" or "Sign Up" → `/sign-up` → chooses email/password or "Continue with Google" → on success, redirected into a short onboarding step (project creation, see `07-history.md`) → lands on `/dashboard`.

**Hitting the free-plan wall:**
User on `FREE` plan tries a 4th analysis this month → blocked (logic in `10-pricing-stripe.md`) → frontend shows an upgrade modal with a CTA to `/pricing` → Stripe Checkout → webhook flips `plan` to `PRO` → limit lifted immediately.

**Returning user, normal flow:**
`/sign-in` (email/password or Google) → `/dashboard` → picks an existing project or starts a new one → `/projects/[id]/analyze` (upload or paste a URL, per `14-live-url-analysis.md`) → streaming processing (`16-streaming-report.md`) → `/report/[id]` (flagship screen, with a breadcrumb back to its parent project).

**Account lifecycle (Settings):**
`/settings` — profile fields, linked OAuth accounts, current plan + usage this month, "Manage subscription" (Stripe portal), "Export my data", "Delete my account" (confirmation dialog, cascades through Projects/Analyses).

---

## 5. Demo (`/demo`) — stays exactly as speced in `06-support-pages.md`, with two additions

- Remains fully public and unauthenticated — this is intentional, its entire purpose is to let a visitor (including a recruiter evaluating this portfolio) see the product instantly with zero commitment
- Uses a hardcoded sample image + pre-generated `AnalysisResult` (no live AI call, no cost) — **does not touch usage tracking at all**, it is not a real analysis
- Add a clear, non-pushy CTA near the bottom of the demo report view: "This was a sample — analyze your own design" → `/sign-up`

---

## 6. Design gap — new Stitch generation needed

The existing `/design` exports (LOT 1 flagship report, LOT 2 support screens, LOT 3 brand assets) predate this architecture change and **do not cover**:
- `/sign-in` and `/sign-up` pages (including the Google button, and a Facebook button placeholder hidden behind the feature flag)
- `/dashboard`, `/projects`, `/projects/[id]` (see `07-history.md`)
- `/settings`, the upgrade/limit-reached modal, the usage-counter pill (see `10-pricing-stripe.md`)
- The language-switcher dropdown
- Both updated navbars (before/after login) shown in context

**Three new Stitch LOTs are needed** (see the message accompanying this file for the actual prompts): LOT 4 (auth screens + both navbars), LOT 5 (dashboard + projects), LOT 6 (settings + upgrade modal). Data model, auth config, and usage-limit logic can be built in parallel without waiting on these — only the UI work depends on them.

---

## 7. Full implementation code

### `app/api/auth/[...nextauth]/route.ts`
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### `app/api/register/route.ts` (Credentials sign-up — NextAuth has no built-in registration)
```ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Please provide a valid email and a password of at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name: name ?? null } });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
```

### `app/sign-in/page.tsx`
```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Incorrect email or password."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f16]">
      <div className="w-full max-w-sm rounded-xl border border-[#1d2b3f] bg-[#121a27] p-8">
        <h1 className="text-xl font-semibold text-[#e3e9f2] mb-1">Welcome back</h1>
        <p className="text-sm text-[#87a1c5] mb-6">Sign in to continue to Poisik.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[#87a1c5]">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
          </div>
          <div>
            <label className="text-sm text-[#87a1c5]">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
          </div>
          {error && <p className="text-sm text-[#6294da]">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white py-2 font-medium transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1d2b3f]" /><span className="text-xs text-[#4b6c9b]">or</span><div className="h-px flex-1 bg-[#1d2b3f]" />
        </div>
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-md border border-[#263954] py-2 text-[#e3e9f2] hover:bg-[#162131] transition-colors">
          Continue with Google
        </button>
        <button disabled className="mt-2 w-full rounded-md border border-[#1d2b3f] py-2 text-[#4b6c9b] cursor-not-allowed">
          Continue with Facebook — coming soon
        </button>
        <p className="mt-6 text-center text-sm text-[#87a1c5]">
          Don&apos;t have an account? <Link href="/sign-up" className="text-[#6294da] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
```

### `app/sign-up/page.tsx`
```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f16]">
      <div className="w-full max-w-sm rounded-xl border border-[#1d2b3f] bg-[#121a27] p-8">
        <h1 className="text-xl font-semibold text-[#e3e9f2] mb-1">Create your account</h1>
        <p className="text-sm text-[#87a1c5] mb-6">Start auditing your designs with Poisik.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[#87a1c5]">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
          </div>
          <div>
            <label className="text-sm text-[#87a1c5]">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
          </div>
          <div>
            <label className="text-sm text-[#87a1c5]">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
          </div>
          {error && <p className="text-sm text-[#6294da]">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white py-2 font-medium transition-colors disabled:opacity-50">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1d2b3f]" /><span className="text-xs text-[#4b6c9b]">or</span><div className="h-px flex-1 bg-[#1d2b3f]" />
        </div>
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-md border border-[#263954] py-2 text-[#e3e9f2] hover:bg-[#162131] transition-colors">
          Continue with Google
        </button>
        <button disabled className="mt-2 w-full rounded-md border border-[#1d2b3f] py-2 text-[#4b6c9b] cursor-not-allowed">
          Continue with Facebook — coming soon
        </button>
        <p className="mt-6 text-center text-sm text-[#87a1c5]">
          Already have an account? <Link href="/sign-in" className="text-[#6294da] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

### `components/layout/TopBarPublic.tsx`
```tsx
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function TopBarPublic() {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[#1d2b3f]">
      <Link href="/" className="text-[#e3e9f2] font-semibold tracking-tight lowercase">poisik</Link>
      <nav className="hidden md:flex items-center gap-6 text-sm text-[#87a1c5]">
        <a href="#features" className="hover:text-[#e3e9f2]">Features</a>
        <a href="#beyond-critique" className="hover:text-[#e3e9f2]">Beyond Critique</a>
        <Link href="/pricing" className="hover:text-[#e3e9f2]">Pricing</Link>
        <Link href="/demo" className="hover:text-[#e3e9f2]">Demo</Link>
      </nav>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Link href="/sign-in" className="text-sm text-[#87a1c5] hover:text-[#e3e9f2]">Sign In</Link>
        <Link href="/sign-up" className="rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white text-sm px-4 py-2 transition-colors">
          Sign Up
        </Link>
      </div>
    </header>
  );
}
```

### `components/layout/AppShell.tsx`
```tsx
import { Sidebar } from "./Sidebar";
import { TopBarAuth } from "./TopBarAuth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session!.user!.id;
  const plan = ((session!.user as any).plan ?? "FREE") as keyof typeof PLAN_LIMITS;
  const limit = PLAN_LIMITS[plan];

  let remaining: number | null = limit;
  if (limit !== null) {
    const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const record = await prisma.usageRecord.findUnique({ where: { userId_periodStart: { userId, periodStart } } });
    remaining = limit - (record?.count ?? 0);
  }

  return (
    <div className="min-h-screen bg-[#0a0f16] flex flex-col">
      <TopBarAuth />
      <div className="flex flex-1">
        <Sidebar usage={{ remaining, limit, plan }} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

### `components/layout/TopBarAuth.tsx`
```tsx
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserDropdown } from "./UserDropdown";

export function TopBarAuth() {
  return (
    <header className="h-14 border-b border-[#1d2b3f] flex items-center justify-between px-6">
      <Link href="/dashboard" className="text-[#e3e9f2] font-semibold tracking-tight lowercase">poisik</Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <UserDropdown />
      </div>
    </header>
  );
}
```

### `components/layout/Sidebar.tsx`
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Plus } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar({ usage }: { usage: { remaining: number | null; limit: number | null; plan: string } }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#1d2b3f] flex flex-col justify-between p-4">
      <div>
        <Link href="/projects/new-analysis"
          className="flex items-center justify-center gap-1 w-full rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white py-2 font-medium mb-6 transition-colors">
          <Plus className="w-4 h-4" /> New Analysis
        </Link>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-[#182639] text-[#e3e9f2]" : "text-[#87a1c5] hover:bg-[#162131]"
                }`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link href="/settings" className="rounded-md border border-[#1d2b3f] p-3 block hover:bg-[#162131] transition-colors">
        <p className="text-xs text-[#87a1c5] mb-1">{usage.plan} plan</p>
        <p className="text-sm text-[#e3e9f2] mb-2">
          {usage.limit === null ? "Unlimited analyses" : `${usage.remaining} of ${usage.limit} analyses left`}
        </p>
        {usage.limit !== null && (
          <div className="h-1.5 rounded-full bg-[#263954] overflow-hidden">
            <div className="h-full bg-[#6294da]"
              style={{ width: `${Math.max(0, ((usage.limit - (usage.remaining ?? 0)) / usage.limit) * 100)}%` }} />
          </div>
        )}
      </Link>
    </aside>
  );
}
```

### `components/layout/UserDropdown.tsx`
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function UserDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-8 h-8 rounded-full bg-[#182639] overflow-hidden">
        {session?.user?.image ? (
          <img src={session.user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-xs text-[#e3e9f2]">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-[#1d2b3f] bg-[#121a27] py-1 shadow-lg z-50">
          <Link href="/settings" className="block px-3 py-2 text-sm text-[#e3e9f2] hover:bg-[#182639]">Account</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left px-3 py-2 text-sm text-[#e3e9f2] hover:bg-[#182639]">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

### `components/layout/LanguageSwitcher.tsx`
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";

const LOCALES = [{ code: "en", label: "English" }, { code: "fr", label: "Français" }];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLocale = pathname.split("/")[1] === "fr" ? "fr" : "en";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function switchTo(code: string) {
    const rest = pathname.replace(/^\/(en|fr)/, "");
    router.push(`/${code}${rest}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md border border-[#1d2b3f] px-2 py-1 text-xs text-[#87a1c5] hover:bg-[#162131]">
        <Globe className="w-3.5 h-3.5" />{currentLocale.toUpperCase()}<ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-[#1d2b3f] bg-[#121a27] py-1 shadow-lg z-50">
          {LOCALES.map(({ code, label }) => (
            <button key={code} onClick={() => switchTo(code)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#e3e9f2] hover:bg-[#182639]">
              {label}{currentLocale === code && <Check className="w-3.5 h-3.5 text-[#6294da]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Wrap every route under `/dashboard`, `/projects`, `/settings` in a layout that renders `<AppShell>` — e.g. `app/(app)/layout.tsx` using a route group so the public `/`, `/pricing` routes stay outside it and use `<TopBarPublic>` instead.

## Definition of Done
- A new user can sign up via email/password or Google
- Route protection correctly blocks `/dashboard`, `/projects/*`, `/settings` for signed-out visitors
- `/report/[id]` remains publicly viewable when `isPublic: true`, without requiring login
- The language switcher works identically in both navbar states and preserves the current route
- `/demo` remains fully accessible with zero auth
- Settings supports data export and account deletion, with cascading deletes verified in a test environment
