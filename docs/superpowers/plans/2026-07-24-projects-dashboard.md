# Phase B — Projects & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Standing constraint for this project:** no command or file change runs without the user's explicit go-ahead first. Do not open a PR — the user merges branches themselves.
>
> **Do NOT use Playwright or any browser automation for verification anywhere in this plan.** Use `pnpm build`/`lint`/`typecheck` and `curl` (with a cookie jar for authenticated checks) instead — this project's owner has explicitly banned browser automation for being too slow.

**Goal:** replace the anonymous, unowned analysis flow with Projects owned by a `User` — a real Dashboard (widget grid), a Projects list/detail, a project-scoped "New Analysis" flow, and project-scoped Comparison — per `features/07-history.md`. Retires the standalone public `/upload`, `/history`, and `/compare` pages.

**Architecture:** The `Project`/`Analysis` (project-scoped) Prisma models already exist (migrated in Phase A) — this phase is pure application code on top of an already-correct schema. The existing AI vision pipeline (`app/api/analyze/route.ts`: fetch → sharp resize → `analyzeImage` → WCAG contrast enrichment → ColorThief palette) gets extracted into a shared `lib/ai/run-analysis.ts` function so both the legacy route and the new project-scoped analysis-creation route use the same logic — the original spec assumed a `runVisionAnalysis` helper that doesn't exist in this codebase; this plan wires the real one instead.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 (already migrated), `recharts` (new dependency, for the score-trend chart).

## Global Constraints

- Package manager: **pnpm** throughout.
- Existing conventions (same as Phase A): design tokens only (`bg-bg-base`, `text-text-primary`, `bg-accent-signal`, etc. — no raw hex, no design_v2 mockup role names copied verbatim), `lucide-react` icons only, locale-aware navigation via `Link`/`useRouter`/`redirect` from `@/i18n/navigation` for new components, routes under `app/[locale]/...`.
- New pages in this phase live under the existing `app/[locale]/(authenticated)/` route group (Phase A) — `dashboard/`, `settings/` already there; this phase adds `projects/`, `projects/[id]/`, `projects/[id]/analyze/`, `projects/[id]/compare/`, `projects/new-analysis/`. All of these must be genuinely auth-gated — extend `middleware.ts`'s `PROTECTED_PATH_RE` to include `projects`.
- **User decision (2026-07-24):** the landing page's hero "Analyze your design" CTA now points to `/sign-up` (not `/upload`) — real analysis requires a project, which requires an account. The standalone public `/upload` page is retired (redirects to `/sign-up`).
- `/history` and `/compare` are retired (superseded by Dashboard/Projects and project-scoped Compare respectively) — both redirect to `/dashboard` rather than 404ing, since nothing currently links to either (verified via grep) but old bookmarks/external links shouldn't dead-end.
- `Sidebar`'s "New Analysis" link target changes from the Phase A placeholder (`/projects`) to `/projects/new-analysis`, which does the branching described in `features/07-history.md` §3.
- Phase C (`10-pricing-stripe.md`) hasn't landed yet — `checkAndIncrementUsage`/`PLAN_LIMITS` don't exist. This phase adds a minimal `lib/usage.ts` stub that always returns `{ allowed: true, remaining: null }`, matching the exact function signature/shape Phase C's real implementation will replace (same approach Phase A used for `Sidebar`'s `usage` prop) — do not skip calling it, just don't invent real limit logic.
- `features/`, `design_v1/`, `design_v2/`, `docs/` are read-only — must be untouched.
- Definition of Done:
  - A brand-new user (0 projects) is guided into creating a first project rather than seeing an empty dashboard
  - "New Analysis" correctly branches: 0 projects → create-first-project prompt, 1 project → straight to that project's analyze page, 2+ → a picker
  - Dashboard widgets render real data once at least one project/analysis exists (stats, score trend, recent activity, projects overview, plan/usage)
  - Comparison works from within a project, selecting two of that project's own analyses
  - Deleting a project cascades and removes its analyses (already guaranteed by Phase A's schema — verify empirically here too, don't just trust the declaration a second time)
  - `pnpm build`, `pnpm lint`, `pnpm typecheck` exit 0 for every file this phase touches (repo-wide `lint`/`test` have pre-existing, out-of-scope failures already documented in Phase A — don't try to fix those here)

---

### Task 1: Extract the shared AI analysis pipeline

**Files:**
- Create: `lib/ai/run-analysis.ts`
- Modify: `app/api/analyze/route.ts` (use the extracted function instead of inlining the pipeline)

**Interfaces:**
- Produces: `runAnalysisPipeline({ imageUrl, locale, model }): Promise<AnalysisResult & { palette?: string[] }>` — consumed by Task 3's new project-scoped analysis-creation route.

- [ ] **Step 1: Read `app/api/analyze/route.ts` in full to confirm its current pipeline (fetch → sharp resize → `analyzeImage` → contrast enrichment → ColorThief palette) still matches what this task assumes.**

- [ ] **Step 2: Create `lib/ai/run-analysis.ts`**

```ts
import sharp from 'sharp';
import * as ColorThief from 'colorthief';
import { analyzeImage } from '@/lib/ai/client';
import { checkContrast } from '@/lib/ai/wcag';

interface RunAnalysisParams {
  imageUrl: string;
  locale?: string;
  model?: string;
}

export async function runAnalysisPipeline({ imageUrl, locale, model }: RunAnalysisParams) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch image from URL');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'image/png';

  const resized = await sharp(buffer)
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const base64 = resized.toString('base64');

  const analysis = await analyzeImage({ imageBase64: base64, mimeType, locale, model });

  for (const issue of analysis.issues) {
    if (issue.category === 'contrast' && issue.description) {
      const hexMatch = issue.description.match(/#([0-9a-fA-F]{3,6})/g);
      if (hexMatch && hexMatch.length >= 2) {
        const fg = hexMatch[0];
        const bg = hexMatch[1];
        const { ratio, passesAA } = checkContrast(fg, bg);
        issue.recommendation = `${issue.recommendation} (WCAG AA: ${passesAA ? 'passes' : 'fails'} — measured ratio ${ratio}:1)`;
      }
    }
  }

  let palette: string[] | undefined;
  try {
    const colors = (await ColorThief.getPalette(resized, { colorCount: 6 })) as
      | { _r: number; _g: number; _b: number }[]
      | null;
    palette = colors?.map(
      (c) => `#${c._r.toString(16).padStart(2, '0')}${c._g.toString(16).padStart(2, '0')}${c._b.toString(16).padStart(2, '0')}`
    );
  } catch {
    console.warn('ColorThief extraction failed');
  }

  return { ...analysis, palette };
}
```

- [ ] **Step 3: Replace `app/api/analyze/route.ts`'s body to use it**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, locale, model } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    const result = await runAnalysisPipeline({ imageUrl, locale, model });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The analysis didn't come back as expected — try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`, `pnpm lint` on both files — both exit 0.
Run: `pnpm build` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add lib/ai/run-analysis.ts app/api/analyze/route.ts
git commit -m "refactor(ai): extract shared analysis pipeline for reuse by project-scoped analyses"
```

---

### Task 2: `/api/projects` and `/api/projects/[id]` routes

**Files:**
- Create: `app/api/projects/route.ts` (list + create)
- Create: `app/api/projects/[id]/route.ts` (detail + rename + delete)

**Interfaces:**
- Consumes: `auth` from `@/auth`, `prisma` from `@/lib/prisma`.
- Produces: the CRUD surface Tasks 4-8 build their pages on top of.

- [ ] **Step 1: `app/api/projects/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { name: name.trim(), userId: (session.user as { id: string }).id },
  });
  return NextResponse.json(project, { status: 201 });
}
```

- [ ] **Step 2: `app/api/projects/[id]/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: (session.user as { id: string }).id },
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const result = await prisma.project.updateMany({
    where: { id, userId: (session.user as { id: string }).id },
    data: { name: name.trim() },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;

  const result = await prisma.project.deleteMany({
    where: { id, userId: (session.user as { id: string }).id },
  });
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
```

Note: both routes scope every query by `userId: session.user.id` in the same `where` clause as the `id` lookup — never fetch-then-check, always filter-in-the-query, so one user can never touch another's project (this is the same pattern Phase A's `/api/account` used after its own security fix).

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.
Run: `pnpm build` — exit 0.
Manual curl check (with an authenticated cookie jar from a test account): create a project via POST, list via GET, fetch by id, rename via PATCH, confirm a second test account's session cannot GET/PATCH/DELETE the first account's project (expect 404, not 200/403 — 404 is intentional, it doesn't reveal existence to a non-owner).

- [ ] **Step 4: Commit**

```bash
git add app/api/projects/route.ts "app/api/projects/[id]/route.ts"
git commit -m "feat(projects): add /api/projects CRUD routes scoped to the authenticated user"
```

---

### Task 3: Usage stub + project-scoped analysis creation

**Files:**
- Create: `lib/usage.ts`
- Create: `app/api/projects/[id]/analyses/route.ts`

**Interfaces:**
- Consumes: `runAnalysisPipeline` from `@/lib/ai/run-analysis` (Task 1), `auth`/`prisma`.
- Produces: `checkAndIncrementUsage(userId, plan)` — the exact function signature Phase C (`10-pricing-stripe.md`) will replace with real limit logic; every caller of this stub keeps working unchanged once Phase C lands.

- [ ] **Step 1: `lib/usage.ts` (Phase A/B stub — Phase C replaces the body, not the signature)**

```ts
export async function checkAndIncrementUsage(
  _userId: string,
  _plan: string
): Promise<{ allowed: boolean; remaining: number | null }> {
  // Phase C (features/10-pricing-stripe.md) replaces this with real per-plan
  // monthly limits backed by the UsageRecord model. Until then, every signed-in
  // user is treated as unlimited so the analysis-creation flow isn't blocked
  // on a feature that doesn't exist yet.
  return { allowed: true, remaining: null };
}
```

- [ ] **Step 2: `app/api/projects/[id]/analyses/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkAndIncrementUsage } from '@/lib/usage';
import { runAnalysisPipeline } from '@/lib/ai/run-analysis';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  const project = await prisma.project.findFirst({ where: { id, userId } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const plan = (session.user as { plan?: string }).plan ?? 'FREE';
  const usage = await checkAndIncrementUsage(userId, plan);
  if (!usage.allowed) {
    return NextResponse.json({ error: 'MONTHLY_LIMIT_REACHED' }, { status: 402 });
  }

  const { imageUrl, locale } = await req.json();
  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
  }

  const result = await runAnalysisPipeline({ imageUrl, locale });

  const analysis = await prisma.analysis.create({
    data: { projectId: project.id, imageUrl, result: result as object },
  });

  await prisma.project.update({ where: { id: project.id }, data: { updatedAt: new Date() } });

  return NextResponse.json(analysis, { status: 201 });
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.
Manual curl check: create a project, POST an analysis to it with a real image URL, confirm the response includes the created `Analysis` row and `prisma.project.findFirst` for that project now includes it.

- [ ] **Step 4: Commit**

```bash
git add lib/usage.ts "app/api/projects/[id]/analyses/route.ts"
git commit -m "feat(projects): add project-scoped analysis creation with a usage-limit stub for Phase C"
```

---

### Task 4: `/projects/new-analysis` branching flow

**Files:**
- Create: `app/[locale]/(authenticated)/projects/new-analysis/page.tsx`
- Create: `components/poisik/CreateProjectForm.tsx`
- Modify: `components/poisik/Sidebar.tsx` (change "New Analysis" href)
- Modify: `components/poisik/index.ts` (export `CreateProjectForm`)
- Modify: `middleware.ts` (add `projects` to the protected-path regex)

**Interfaces:**
- Consumes: `GET /api/projects` (Task 2).
- Produces: the entry point every "New Analysis" trigger in the app should link to.

- [ ] **Step 1: `components/poisik/CreateProjectForm.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
      setLoading(false);
      return;
    }
    const project = await res.json();
    router.push(`/projects/${project.id}/analyze`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
      <div className="flex gap-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My SaaS Landing Page"
          required
          className="flex-1 rounded-lg border border-border bg-surface px-md py-sm text-body-md text-text-primary placeholder:text-text-muted focus:border-accent-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
      {error && <p className="text-label-sm text-accent-signal">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 2: `app/[locale]/(authenticated)/projects/new-analysis/page.tsx`**

Server Component: fetches the user's projects directly (no need to go through the API route from a Server Component — call Prisma directly, same as `AppShell` does), then branches per `features/07-history.md` §3.

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CreateProjectForm } from '@/components/poisik';

export default async function NewAnalysisPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect({ href: '/sign-in', locale });
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
  });

  if (projects.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <h1 className="mb-sm text-headline-md font-semibold text-text-primary">
          Create your first project
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">
          A project groups every analysis you run on the same design, so you can track its
          progress over time.
        </p>
        <CreateProjectForm />
      </div>
    );
  }

  if (projects.length === 1) {
    redirect({ href: `/projects/${projects[0].id}/analyze`, locale });
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-lg text-headline-md font-semibold text-text-primary">
        Which project is this for?
      </h1>
      <div className="space-y-sm">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/analyze`}
            className="block rounded-lg border border-border bg-surface px-lg py-md text-body-md text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover"
          >
            {project.name}
          </Link>
        ))}
      </div>
      <div className="mt-lg border-t border-border pt-lg">
        <p className="mb-sm text-label-md text-text-secondary">Or start a new one:</p>
        <CreateProjectForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update `components/poisik/Sidebar.tsx`'s "New Analysis" link**

Find the `<Link href="/projects" ...>` wrapping the "New Analysis" button (from Phase A) and change its `href` to `/projects/new-analysis`.

- [ ] **Step 4: Update `components/poisik/index.ts`**

Add: `export { CreateProjectForm } from './CreateProjectForm';`

- [ ] **Step 5: Update `middleware.ts`'s protected-path regex**

Change:
```ts
const PROTECTED_PATH_RE = /^\/(en|fr)\/(dashboard|settings)(\/|$)/;
```
to:
```ts
const PROTECTED_PATH_RE = /^\/(en|fr)\/(dashboard|settings|projects)(\/|$)/;
```

- [ ] **Step 6: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Manual curl checks: signed-out request to `/en/projects/new-analysis` redirects to sign-in (same as dashboard/settings). Signed-in with 0 projects → page renders the create-first-project form. Create one project via the form's underlying API, then reload `/en/projects/new-analysis` → redirects straight to that project's `/analyze` page (which doesn't exist until Task 5 — a 404 there is expected and fine, you're verifying the branching redirect itself).

- [ ] **Step 7: Commit**

```bash
git add components/poisik/CreateProjectForm.tsx "app/[locale]/(authenticated)/projects/new-analysis" components/poisik/Sidebar.tsx components/poisik/index.ts middleware.ts
git commit -m "feat(projects): add New Analysis branching flow (create-first / skip-picker / multi-project picker)"
```

---

### Task 5: `/projects/[id]/analyze` page

**Files:**
- Create: `app/[locale]/(authenticated)/projects/[id]/analyze/page.tsx`

**Interfaces:**
- Consumes: `UploadDropzone` from `@/components/poisik` (existing, from before Phase A — reused as-is, its `onAnalyze(imageUrl)` callback now POSTs to the project-scoped analyses endpoint instead of just logging), `POST /api/projects/[id]/analyses` (Task 3).

**Why this task exists:** this is the direct replacement for the old public, unauthenticated `/upload` page (retired in Task 9) — same UI (drag-and-drop + URL capture), now project-scoped and requiring auth.

- [ ] **Step 1: `app/[locale]/(authenticated)/projects/[id]/analyze/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { UploadDropzone } from '@/components/poisik';
import { Link2 } from 'lucide-react';

export default function ProjectAnalyzePage() {
  const t = useTranslations('Upload');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createAnalysis(imageUrl: string) {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/projects/${params.id}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "The analysis didn't come back as expected — try again.");
      return;
    }
    const analysis = await res.json();
    router.push(`/report/${analysis.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-xl text-center">
        <h1 className="mb-xs text-headline-lg font-semibold text-text-primary">{t('title')}</h1>
        <p className="text-body-md text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="mb-lg flex rounded-lg border border-border bg-surface p-1">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 rounded-md px-4 py-2 text-label-md font-medium transition-colors ${mode === 'upload' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Upload screenshot
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-label-md font-medium transition-colors ${mode === 'url' ? 'bg-accent-signal text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Link2 className="size-4" />
          Analyze a URL
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-lg">
        {mode === 'upload' ? (
          <UploadDropzone onAnalyze={createAnalysis} />
        ) : (
          <div className="space-y-lg">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-border bg-bg-elevated p-3 text-body-md text-text-primary placeholder:text-text-muted focus:border-accent-signal focus:outline-none"
            />
            <button
              onClick={() => createAnalysis(url)}
              disabled={loading || !url}
              className="w-full rounded-lg bg-accent-signal px-xl py-md text-label-md font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze URL'}
            </button>
          </div>
        )}
        {loading && mode === 'upload' && (
          <p className="mt-md text-label-md text-text-secondary">Analyzing...</p>
        )}
        {error && <p className="mt-md text-label-md text-accent-signal">{error}</p>}
      </div>
    </div>
  );
}
```

Note: `createAnalysis` for URL mode passes the raw URL string directly as `imageUrl` — this assumes the analysis pipeline can fetch it directly. If the existing `/api/capture` route (screenshotting a live URL into an actual image) is meant to run first, that's a `14-live-url-analysis.md` concern, not part of this plan — flag this as a ⚠️ in your report rather than silently wiring `/api/capture` in, since that file wasn't provided.

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`, `pnpm lint` — both exit 0.
Manual curl/dev-server check: with an authenticated session and an existing project, POST-equivalent flow (you can simulate the dropzone's `onAnalyze` call by directly `curl`-ing `POST /api/projects/[id]/analyses` with a real image URL, since a real file drag-and-drop can't be scripted) confirms a redirect-worthy `Analysis` row is created.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/(authenticated)/projects/[id]/analyze"
git commit -m "feat(projects): add project-scoped analyze page (upload/URL), replaces public /upload"
```

---

### Task 6: `/projects` list + `/projects/[id]` detail pages

**Files:**
- Create: `app/[locale]/(authenticated)/projects/page.tsx`
- Create: `app/[locale]/(authenticated)/projects/[id]/page.tsx`

**Interfaces:**
- Consumes: Prisma directly (Server Components, same pattern as `AppShell`/`new-analysis/page.tsx`).

- [ ] **Step 1: `app/[locale]/(authenticated)/projects/page.tsx`**

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { CreateProjectForm } from '@/components/poisik';

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await prisma.project.findMany({
    where: { userId: (session!.user as { id: string }).id },
    orderBy: { updatedAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (projects.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <h1 className="mb-sm text-headline-md font-semibold text-text-primary">
          Create your first project
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">
          A project groups every analysis you run on the same design, so you can track its
          progress over time.
        </p>
        <CreateProjectForm />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-lg text-headline-lg font-semibold text-text-primary">Projects</h1>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {projects.map((project) => {
          const latest = project.analyses[0];
          const score = (latest?.result as { overall_score?: number } | undefined)?.overall_score;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-xl border border-border bg-surface p-md transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              {latest && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL, not a static local asset
                <img
                  src={latest.imageUrl}
                  alt=""
                  className="mb-md h-32 w-full rounded-md object-cover"
                />
              )}
              <p className="font-medium text-text-primary">{project.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-label-sm text-text-secondary">
                  {project.updatedAt.toLocaleDateString()}
                </span>
                <span className="text-label-md text-accent-signal">{score ?? '—'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `app/[locale]/(authenticated)/projects/[id]/page.tsx`**

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const project = await prisma.project.findFirst({
    where: { id, userId: (session!.user as { id: string }).id },
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) notFound();

  return (
    <div>
      <div className="mb-lg flex items-center justify-between">
        <h1 className="text-headline-lg font-semibold text-text-primary">{project.name}</h1>
        <div className="flex gap-md">
          <Link
            href={`/projects/${project.id}/analyze`}
            className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90"
          >
            New Analysis
          </Link>
          {project.analyses.length >= 2 && (
            <Link
              href={`/projects/${project.id}/compare`}
              className="rounded-lg border border-border-strong px-lg py-sm text-label-md text-text-primary transition-colors hover:bg-surface-hover"
            >
              Compare
            </Link>
          )}
        </div>
      </div>

      {project.analyses.length === 0 ? (
        <p className="text-body-md text-text-secondary">
          No analyses yet — run your first one for this project.
        </p>
      ) : (
        <ul className="space-y-sm">
          {project.analyses.map((analysis) => {
            const score = (analysis.result as { overall_score?: number } | null)?.overall_score;
            return (
              <li key={analysis.id}>
                <Link
                  href={`/report/${analysis.id}`}
                  className="flex items-center gap-md rounded-lg border border-border bg-surface p-md transition-colors hover:border-border-strong hover:bg-surface-hover"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
                  <img src={analysis.imageUrl} alt="" className="size-12 rounded-md object-cover" />
                  <span className="flex-1 text-text-primary">
                    {analysis.createdAt.toLocaleDateString()}
                  </span>
                  <span className="text-accent-signal">{score}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Manual curl check: `/en/projects` and `/en/projects/[id]` (for a project owned by the signed-in test account) both return 200; requesting another account's project id returns the Next.js not-found page (404), not the project's data.

- [ ] **Step 4: Commit**

```bash
git add "app/[locale]/(authenticated)/projects/page.tsx" "app/[locale]/(authenticated)/projects/[id]/page.tsx"
git commit -m "feat(projects): add projects list and project detail pages"
```

---

### Task 7: Project-scoped Comparison

**Files:**
- Create: `components/poisik/ComparePicker.tsx`
- Create: `app/[locale]/(authenticated)/projects/[id]/compare/page.tsx`
- Modify: `components/poisik/index.ts` (export `ComparePicker`)
- Delete: `app/[locale]/(app)/compare/page.tsx`
- Modify: `middleware.ts` or a redirect mechanism so `/compare` doesn't 404 (see Step 4)

**Interfaces:**
- Consumes: `ComparisonSummary`-style rendering — reuse whatever comparison UI primitives `components/poisik/ReportView.tsx` or the old `/compare` page already had for showing two analyses side by side (read the old file before deleting it, salvage its comparison-rendering JSX rather than re-inventing it from scratch).

- [ ] **Step 1: Read the current `app/[locale]/(app)/compare/page.tsx` in full before deleting it — identify any reusable comparison-rendering markup (side-by-side score bars, category breakdown) worth carrying into the new project-scoped version, per the `Compare` i18n namespace already in `messages/en.json`/`messages/fr.json` (`comparisonSummary`, `visualHierarchy`, `contrast`, `spacing`, `typography`, `accessibility`, `consistency`).**

- [ ] **Step 2: `components/poisik/ComparePicker.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

interface AnalysisThumb {
  id: string;
  imageUrl: string;
}

interface ComparePickerProps {
  projectId: string;
  analyses: AnalysisThumb[];
}

export function ComparePicker({ projectId, analyses }: ComparePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  return (
    <div>
      <div className="mb-lg grid grid-cols-2 gap-md md:grid-cols-4">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            className={`overflow-hidden rounded-lg border-2 transition-colors ${selected.includes(a.id) ? 'border-accent-signal' : 'border-transparent'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
            <img src={a.imageUrl} alt="" className="h-24 w-full object-cover" />
          </button>
        ))}
      </div>
      <button
        disabled={selected.length !== 2}
        onClick={() =>
          router.push(`/projects/${projectId}/compare?a=${selected[0]}&b=${selected[1]}`)
        }
        className="rounded-lg bg-accent-signal px-lg py-sm text-label-md font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Compare
      </button>
    </div>
  );
}
```

- [ ] **Step 3: `app/[locale]/(authenticated)/projects/[id]/compare/page.tsx`**

Server Component: if `a`/`b` search params are both present, fetch those two analyses (scoped to this project + this user) and render them side by side (reuse the comparison markup identified in Step 1 — the exact JSX depends on what that page contained, so build it faithfully from what you find rather than a prescribed snippet here). If `a`/`b` aren't both present, render `<ComparePicker>` with the project's analyses instead, so this one route serves both the picker and the result.

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ComparePicker } from '@/components/poisik';

export default async function ProjectComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id } = await params;
  const { a, b } = await searchParams;
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { analyses: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) notFound();

  if (!a || !b) {
    return (
      <div>
        <h1 className="mb-lg text-headline-lg font-semibold text-text-primary">
          Select two analyses to compare
        </h1>
        <ComparePicker projectId={project.id} analyses={project.analyses} />
      </div>
    );
  }

  const [analysisA, analysisB] = await Promise.all([
    prisma.analysis.findFirst({ where: { id: a, projectId: project.id } }),
    prisma.analysis.findFirst({ where: { id: b, projectId: project.id } }),
  ]);
  if (!analysisA || !analysisB) notFound();

  // Render analysisA / analysisB side by side using whatever comparison markup
  // was salvaged from the old app/[locale]/(app)/compare/page.tsx in Step 1 —
  // build this against the real shape of that file's JSX, not a placeholder.
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
      {[analysisA, analysisB].map((analysis) => (
        <div key={analysis.id} className="rounded-xl border border-border bg-surface p-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary UploadThing-hosted URL */}
          <img src={analysis.imageUrl} alt="" className="mb-md w-full rounded-lg object-cover" />
          <p className="text-headline-md font-semibold text-accent-signal">
            {(analysis.result as { overall_score?: number } | null)?.overall_score}
          </p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Retire the standalone `/compare` page**

```bash
git rm "app/[locale]/(app)/compare/page.tsx"
```
Confirmed via grep in the plan's research phase that nothing in the current codebase links to `/compare` — no redirect shim is needed, deleting it is sufficient (a stray external bookmark will get Next.js's normal 404 page, which is acceptable here since this product hasn't launched publicly yet).

- [ ] **Step 5: Update `components/poisik/index.ts`**

Add: `export { ComparePicker } from './ComparePicker';`

- [ ] **Step 6: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Manual curl check: a project with 0-1 analyses shows the picker with too few/no items to select (acceptable — don't add special-case UI for this edge case unless Step 1's research reveals the old page handled it specially); a project with 2+ analyses lets you pick two and navigate to the compare result view.

- [ ] **Step 7: Commit**

```bash
git add components/poisik/ComparePicker.tsx "app/[locale]/(authenticated)/projects/[id]/compare" components/poisik/index.ts
git rm "app/[locale]/(app)/compare/page.tsx"
git commit -m "feat(projects): make comparison project-scoped, retire standalone /compare page"
```

---

### Task 8: Dashboard widgets

**Files:**
- Modify: `app/[locale]/(authenticated)/dashboard/page.tsx` (replace the Phase A placeholder)
- Create: `components/poisik/ScoreTrendWidget.tsx`
- Create: `components/poisik/RecentActivityWidget.tsx`
- Create: `components/poisik/ProjectsOverviewWidget.tsx`
- Modify: `components/poisik/index.ts`
- Modify: `package.json` (add `recharts`)

**Interfaces:**
- Consumes: Prisma directly (Server Component page), `CreateProjectForm` (Task 4).

- [ ] **Step 1: Install `recharts`**

```bash
pnpm add recharts
```

- [ ] **Step 2: `components/poisik/ScoreTrendWidget.tsx`**

```tsx
'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface ScoreTrendWidgetProps {
  scores: { score: number; date: string }[];
}

export function ScoreTrendWidget({ scores }: ScoreTrendWidgetProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <p className="mb-md text-label-sm text-text-secondary">Average score trend</p>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scores}>
            <YAxis domain={[0, 100]} hide />
            <Line type="monotone" dataKey="score" stroke="#6294da" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```
(The `stroke="#6294da"` is a literal SVG attribute, not a Tailwind class — SVG `stroke` doesn't resolve CSS custom property utility classes reliably, same reasoning as `CircularGauge`'s track color in the Feature 02 plan. This is an accepted exception to the "tokens only" rule for this one SVG attribute, matching existing precedent.)

- [ ] **Step 3: `components/poisik/RecentActivityWidget.tsx`**

```tsx
import { Link } from '@/i18n/navigation';

interface RecentActivityItem {
  id: string;
  projectName: string;
  score: number | undefined;
}

export function RecentActivityWidget({ analyses }: { analyses: RecentActivityItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <p className="mb-md text-label-sm text-text-secondary">Recent activity</p>
      <ul className="space-y-1">
        {analyses.map((a) => (
          <li key={a.id}>
            <Link
              href={`/report/${a.id}`}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-body-md transition-colors hover:bg-surface-hover"
            >
              <span className="text-text-primary">{a.projectName}</span>
              <span className="text-accent-signal">{a.score ?? '—'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: `components/poisik/ProjectsOverviewWidget.tsx`**

```tsx
import { Link } from '@/i18n/navigation';

interface ProjectOverviewItem {
  id: string;
  name: string;
  score: number | undefined;
}

export function ProjectsOverviewWidget({ projects }: { projects: ProjectOverviewItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-lg">
      <div className="mb-md flex items-center justify-between">
        <p className="text-label-sm text-text-secondary">Projects</p>
        <Link href="/projects" className="text-label-sm text-accent-signal hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-1">
        {projects.slice(0, 4).map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 text-body-md transition-colors hover:bg-surface-hover"
            >
              <span className="text-text-primary">{p.name}</span>
              <span className="text-accent-signal">{p.score ?? '—'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Replace `app/[locale]/(authenticated)/dashboard/page.tsx`**

```tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  CreateProjectForm,
  ScoreTrendWidget,
  RecentActivityWidget,
  ProjectsOverviewWidget,
} from '@/components/poisik';

function scoreOf(result: unknown): number | undefined {
  return (result as { overall_score?: number } | null)?.overall_score;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (projects.length === 0) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <h1 className="mb-sm text-headline-md font-semibold text-text-primary">
          Create your first project
        </h1>
        <p className="mb-lg text-body-md text-text-secondary">
          A project groups every analysis you run on the same design, so you can track its
          progress over time.
        </p>
        <CreateProjectForm />
      </div>
    );
  }

  const recentAnalyses = await prisma.analysis.findMany({
    where: { project: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { project: true },
  });

  const totalAnalyses = await prisma.analysis.count({ where: { project: { userId } } });

  const allScored = await prisma.analysis.findMany({
    where: { project: { userId } },
    select: { result: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const scoreSeries = allScored.map((a) => ({
    score: scoreOf(a.result) ?? 0,
    date: a.createdAt.toISOString(),
  }));
  const avgScore =
    scoreSeries.length > 0
      ? Math.round(scoreSeries.reduce((sum, s) => sum + s.score, 0) / scoreSeries.length)
      : 0;

  const plan = (session!.user as { plan?: string }).plan ?? 'FREE';

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Analyses', value: totalAnalyses },
          { label: 'Average score', value: avgScore },
          { label: 'Plan', value: plan },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-lg">
            <p className="mb-xs text-label-sm text-text-secondary">{stat.label}</p>
            <p className="text-headline-md font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <ScoreTrendWidget scores={scoreSeries} />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
        <RecentActivityWidget
          analyses={recentAnalyses.map((a) => ({
            id: a.id,
            projectName: a.project.name,
            score: scoreOf(a.result),
          }))}
        />
        <ProjectsOverviewWidget
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            score: scoreOf(p.analyses[0]?.result),
          }))}
        />
      </div>
    </div>
  );
}
```

Note: the plan's earlier "4th stat = analyses remaining this month" is replaced with "Plan" here, since `checkAndIncrementUsage`'s stub (Task 3) always returns `remaining: null` — showing a fabricated "remaining" number would misrepresent unimplemented functionality. Swap this back to a real "left this month" figure when Phase C lands.

- [ ] **Step 6: Update `components/poisik/index.ts`**

Add:
```ts
export { ScoreTrendWidget } from './ScoreTrendWidget';
export { RecentActivityWidget } from './RecentActivityWidget';
export { ProjectsOverviewWidget } from './ProjectsOverviewWidget';
```

- [ ] **Step 7: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Manual curl/dev-server check: dashboard with 0 projects shows the create-first-project form; with 1+ projects and analyses, shows all 5 widgets with real numbers (not placeholders).

- [ ] **Step 8: Commit**

```bash
git add "app/[locale]/(authenticated)/dashboard/page.tsx" components/poisik/ScoreTrendWidget.tsx components/poisik/RecentActivityWidget.tsx components/poisik/ProjectsOverviewWidget.tsx components/poisik/index.ts package.json pnpm-lock.yaml
git commit -m "feat(dashboard): add real widget grid (stats, score trend, recent activity, projects overview)"
```

---

### Task 9: Retire the old public `/upload`, `/history`; update the landing hero CTA

**Files:**
- Delete: `app/[locale]/(app)/upload/page.tsx`
- Delete: `app/[locale]/(app)/history/page.tsx`
- Modify: `app/[locale]/page.tsx` (hero CTA target)

**Interfaces:** none new — this task only removes/redirects.

- [ ] **Step 1: Confirm no remaining internal links to `/upload` or `/history` before deleting**

```bash
grep -rn '"/upload"\|"/history"' app/ components/ --include=*.tsx
```
Expect: only the landing page's hero/nav (already being changed in this same task) and the two files being deleted themselves. If anything else references them, stop and report NEEDS_CONTEXT — don't silently break another page.

- [ ] **Step 2: Delete the two retired pages, add a middleware-level redirect**

```bash
git rm "app/[locale]/(app)/upload/page.tsx" "app/[locale]/(app)/history/page.tsx"
```
Don't leave empty replacement page files behind — instead, redirect both paths from `middleware.ts` (one place to look, rather than a per-page redirect file each). In `middleware.ts`, after the protected-path check and before returning `intlMiddleware(request)`'s result, add:
```ts
const RETIRED_PATH_RE = /^\/(en|fr)\/(upload|history)(\/|$)/;
if (RETIRED_PATH_RE.test(request.nextUrl.pathname)) {
  const locale = request.nextUrl.pathname.startsWith('/fr') ? 'fr' : 'en';
  return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
}
```
Place this check alongside (not replacing) the existing `PROTECTED_PATH_RE` check from Phase A/Task 4 — both are early-return redirects before the rest of the middleware runs.

- [ ] **Step 3: Update the landing page's hero CTA**

In `app/[locale]/page.tsx`, find the hero section's primary CTA (`<Link href="/upload" ...>{t('cta')}</Link>`, inside the `<div className="mb-xxl flex ...">` block) and change its `href` to `/sign-up`. Leave the header's Sign Up button (already `/sign-up` since Phase A Task 6) and everything else in the file untouched.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`, `pnpm lint`, `pnpm build` — all exit 0.
Manual curl check: `/en/upload` and `/en/history` (and their `/fr` equivalents) redirect to `/en/dashboard`/`/fr/dashboard` (which itself redirects further to sign-in if signed out — a double-redirect, acceptable for retired routes). Landing page hero CTA now points to `/sign-up`.

- [ ] **Step 5: Commit**

```bash
git rm "app/[locale]/(app)/upload/page.tsx" "app/[locale]/(app)/history/page.tsx"
git add middleware.ts "app/[locale]/page.tsx"
git commit -m "chore(projects): retire standalone /upload and /history, redirect to /dashboard; hero CTA now points to /sign-up"
```

---

### Task 10: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run: `pnpm build`, `pnpm lint`, `pnpm typecheck`. Confirm no NEW failures beyond the pre-existing, out-of-scope ones already documented in Phase A (`compare/page.tsx` no longer exists so its pre-existing lint error should simply disappear from the list — a decrease, not a new failure).

- [ ] **Step 2: End-to-end manual walkthrough (curl-based, no browser)**

1. Sign up a fresh test account → `/dashboard` shows the create-first-project form
2. Submit the form → redirected to `/projects/[id]/analyze`
3. POST a real image URL to that project's analyses endpoint (simulating the dropzone) → redirected conceptually to `/report/[id]` (confirm the `Analysis` row exists via the project detail page)
4. Visit `/dashboard` again → widgets now show real numbers (1 project, 1 analysis, a real average score)
5. Visit `/projects` → the project card appears with its latest score
6. Create a second analysis in the same project, then visit `/projects/[id]/compare` → picker appears, select both, confirm the compare result renders
7. Visit `/en/upload`, `/en/history`, `/fr/upload` → all redirect to the appropriate dashboard
8. Visit the landing page signed out → hero CTA links to `/sign-up`
9. Delete the test project via `DELETE /api/projects/[id]` → confirm its analyses are gone too (query the dev DB directly)

- [ ] **Step 3: Report**

Summarize the walkthrough results. No code changes to commit here — this is the gate before considering Phase B done.

## Self-Review Notes

- **Spec coverage:** every section of `features/07-history.md` maps to a task — data model (already in Phase A's schema, confirmed unchanged), Dashboard (Task 8), New Analysis flow (Task 4), Projects list (Task 6), Project detail (Task 6), Comparison-now-project-scoped (Task 7), full implementation code (Tasks 2-3, adapted to this codebase's real `@/lib/prisma` and `runAnalysisPipeline` instead of the spec's hypothetical `@/lib/db`/`runVisionAnalysis`).
- **Known deviations from the spec's literal code, called out for the human:** (1) the spec's example code imports from `@/lib/db` and calls a `runVisionAnalysis` helper that don't exist in this codebase — this plan uses the real `@/lib/prisma` and a newly-extracted `runAnalysisPipeline` (Task 1) instead; (2) `checkAndIncrementUsage` is a stub until Phase C — every call site is written against its final signature so Phase C is a body-only swap; (3) the Dashboard's 4th stat card shows "Plan" instead of a fabricated "analyses remaining" number, since that number doesn't exist without Phase C; (4) `/upload`'s live-URL analysis path assumes the pipeline can fetch a URL directly — if `14-live-url-analysis.md`'s actual capture-then-analyze flow differs, that's a separate future amendment, flagged inline in Task 5.
- **No placeholders:** every step has literal, complete code or an exact command, except the one explicitly-flagged spot in Task 7 (the compare-result JSX) which depends on reading an existing file first — the task's Step 1 instructs the implementer to do that reading before writing the real markup, not to leave a TODO.
