# 07 — Projects & Dashboard

**Replaces the old anonymous-session History concept.** Poisik now has real accounts (see `21-auth-navigation.md`); analyses are organized into **Projects** owned by a `User`, not loose session history.

**Depends on:** the `User` model in `21-auth-navigation.md`.
**Modifies:** `06-support-pages.md` (Comparison becomes a project-scoped action, not a standalone `/compare` page).

## 1. Data model (Prisma / PostgreSQL)

```prisma
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
  result    Json     // the AnalysisResult shape from 04-ai-analysis.md
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```
This combines with the `User`/`Account`/`Session` models from `21-auth-navigation.md` and the `Plan`/`UsageRecord` models from `10-pricing-stripe.md` into one `schema.prisma`.

## 2. Dashboard (`/dashboard`)

Renders inside the authenticated app shell (top bar + sidebar, both defined in `21-auth-navigation.md`) — the Dashboard itself is just the content area, it does not repeat the "New Analysis" button or nav links since those live in the sidebar.

- **First-ever login, zero projects:** show a guided empty state in the content area — "Create your first project" with a short form (just a project name field). Do not show a plain blank dashboard; this is the first real impression of the product after signup.
- **Once at least one project exists**, the Dashboard is a **widget grid**, not a single list. Widgets:
  1. **Quick stats row** — 4 small stat cards: Total projects, Total analyses, Average score (across all projects), Analyses remaining this month (mirrors the sidebar's usage counter, reinforced here)
  2. **Score trend widget** — a line/sparkline chart plotting `Analysis.result.overall_score` over time across all projects (no new data collection needed, reuses what's already stored)
  3. **Recent activity widget** — the last 5 analyses across all projects, newest first, each linking to its report
  4. **Projects overview widget** — the 3-4 most recently updated projects as small cards (thumbnail, name, latest score), with a "View all" link through to `/projects`
  5. **Plan/usage widget** — current plan badge, usage bar, and an "Upgrade to Pro" CTA if on Free (this is the dashboard's own copy of the billing status, separate from the persistent sidebar widget — reinforcing it here is intentional, not redundant, since a dashboard is meant to be a full status overview at a glance)

All widgets are cards: `surface` background, `border` outline, consistent padding/radius matching the rest of the design system — no widget introduces a new visual style.

## 3. New Analysis flow

Clicking "New Analysis" (from the Dashboard, the navbar, or the command palette):
- If the user has **zero** projects → prompt project creation first (same short form as the onboarding empty state), then proceed to upload
- If the user has **exactly one** project → skip straight to the upload/URL flow for that project, no picker needed
- If the user has **multiple** projects → show a small picker: "Which project is this for?" (list of existing projects) + a "Create new project" option at the bottom

## 4. Projects list (`/projects`)

Card grid, one card per project:
- Project name
- Thumbnail (the image from its most recent analysis)
- Latest overall score (small badge)
- Last-updated date
- Click-through to `/projects/[id]`
- Empty state (zero projects): same guided "Create your first project" prompt as the dashboard

## 5. Project detail (`/projects/[id]`)

- Header: project name, edit/rename action, delete-project action (confirmation dialog, cascades its analyses)
- Score-trend chart: this project's `overall_score` over time across its own analyses (not all projects — this is scoped, unlike the dashboard's cross-project widget)
- List of this project's analyses (newest first), each showing thumbnail, score, date, link to `/report/[id]`
- "New Analysis" button — adds directly to this project, no picker needed (project context is already known)
- "Compare" button — opens a picker to select any two of this project's past analyses, then renders the existing Before/After comparison UI from `06-support-pages.md`, fed by the two selected stored `Analysis` records instead of two fresh uploads

## 6. Comparison — now project-scoped (amends `06-support-pages.md`)

The original spec had `/compare` as a standalone public-feeling page requiring two fresh uploads. That page no longer exists on its own. Comparison is now always entered from within a project (`/projects/[id]`, "Compare" button), and the two images being compared are always two existing `Analysis` records already stored for that project — never two ad-hoc uploads outside of a project context.

## 7. Full implementation code

### `app/api/projects/route.ts` (list + create)
```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const project = await prisma.project.create({ data: { name, userId: session.user.id } });
  return NextResponse.json(project, { status: 201 });
}
```

### `app/api/projects/[id]/route.ts` (detail + rename + delete)
```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { analyses: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const result = await prisma.project.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: { name },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.project.deleteMany({ where: { id: params.id, userId: session.user.id } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
```

### `app/api/projects/[id]/analyses/route.ts` (create a new analysis inside a project — wraps `04-ai-analysis.md`'s pipeline with the usage check from `10-pricing-stripe.md`)
```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkAndIncrementUsage } from "@/lib/usage";
import { runVisionAnalysis } from "@/lib/ai-analysis"; // implemented in 04-ai-analysis.md

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = (session.user as any).plan ?? "FREE";
  const usage = await checkAndIncrementUsage(session.user.id, plan);
  if (!usage.allowed) {
    return NextResponse.json({ error: "MONTHLY_LIMIT_REACHED" }, { status: 402 });
  }

  const { imageUrl } = await req.json();
  const result = await runVisionAnalysis(imageUrl); // returns the AnalysisResult shape from 04-ai-analysis.md

  const analysis = await prisma.analysis.create({
    data: { projectId: project.id, imageUrl, result: result as any },
  });

  return NextResponse.json(analysis, { status: 201 });
}
```

### `app/dashboard/page.tsx`
```tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";
import { CreateProjectForm } from "@/components/dashboard/CreateProjectForm";
import { ScoreTrendWidget } from "@/components/dashboard/ScoreTrendWidget";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { ProjectsOverviewWidget } from "@/components/dashboard/ProjectsOverviewWidget";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (projects.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center">
        <h1 className="text-xl font-semibold text-[#e3e9f2] mb-2">Create your first project</h1>
        <p className="text-sm text-[#87a1c5] mb-6">
          A project groups every analysis you run on the same design, so you can track its progress over time.
        </p>
        <CreateProjectForm />
      </div>
    );
  }

  const recentAnalyses = await prisma.analysis.findMany({
    where: { project: { userId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { project: true },
  });

  const totalAnalyses = await prisma.analysis.count({ where: { project: { userId } } });
  const scores = await prisma.analysis.findMany({
    where: { project: { userId } },
    select: { result: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, a: any) => sum + (a.result?.overall_score ?? 0), 0) / scores.length)
    : 0;

  const plan = ((session!.user as any).plan ?? "FREE") as keyof typeof PLAN_LIMITS;
  const limit = PLAN_LIMITS[plan];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Analyses" value={totalAnalyses} />
        <StatCard label="Average score" value={avgScore} />
        <StatCard label="Left this month" value={limit === null ? "Unlimited" : limit} />
      </div>
      <ScoreTrendWidget scores={scores as any} />
      <div className="grid grid-cols-2 gap-6">
        <RecentActivityWidget analyses={recentAnalyses as any} />
        <ProjectsOverviewWidget projects={projects as any} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#1d2b3f] bg-[#121a27] p-4">
      <p className="text-xs text-[#87a1c5] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#e3e9f2]">{value}</p>
    </div>
  );
}
```

### `components/dashboard/CreateProjectForm.tsx`
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const project = await res.json();
    setLoading(false);
    router.push(`/projects/${project.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My SaaS Landing Page" required
        className="flex-1 rounded-md border border-[#1d2b3f] bg-[#0d131c] px-3 py-2 text-[#e3e9f2] focus:outline-none focus:border-[#6294da]" />
      <button type="submit" disabled={loading}
        className="rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white px-4 py-2 font-medium disabled:opacity-50">
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### `components/dashboard/ScoreTrendWidget.tsx`
```tsx
"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export function ScoreTrendWidget({ scores }: { scores: { result: any; createdAt: string }[] }) {
  const data = scores.map((s) => ({ score: s.result?.overall_score ?? 0, date: s.createdAt }));

  return (
    <div className="rounded-lg border border-[#1d2b3f] bg-[#121a27] p-4">
      <p className="text-xs text-[#87a1c5] mb-3">Average score trend</p>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={[0, 100]} hide />
            <Line type="monotone" dataKey="score" stroke="#6294da" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

### `components/dashboard/RecentActivityWidget.tsx`
```tsx
import Link from "next/link";

export function RecentActivityWidget({ analyses }: { analyses: any[] }) {
  return (
    <div className="rounded-lg border border-[#1d2b3f] bg-[#121a27] p-4">
      <p className="text-xs text-[#87a1c5] mb-3">Recent activity</p>
      <ul className="space-y-2">
        {analyses.map((a) => (
          <li key={a.id}>
            <Link href={`/report/${a.id}`} className="flex items-center justify-between text-sm hover:bg-[#162131] rounded-md px-2 py-1.5 -mx-2">
              <span className="text-[#e3e9f2]">{a.project.name}</span>
              <span className="text-[#6294da]">{a.result?.overall_score}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### `components/dashboard/ProjectsOverviewWidget.tsx`
```tsx
import Link from "next/link";

export function ProjectsOverviewWidget({ projects }: { projects: any[] }) {
  return (
    <div className="rounded-lg border border-[#1d2b3f] bg-[#121a27] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#87a1c5]">Projects</p>
        <Link href="/projects" className="text-xs text-[#6294da] hover:underline">View all</Link>
      </div>
      <ul className="space-y-2">
        {projects.slice(0, 4).map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="flex items-center justify-between text-sm hover:bg-[#162131] rounded-md px-2 py-1.5 -mx-2">
              <span className="text-[#e3e9f2]">{p.name}</span>
              <span className="text-[#6294da]">{p.analyses[0]?.result?.overall_score ?? "—"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### `app/projects/page.tsx`
```tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await prisma.project.findMany({
    where: { userId: session!.user!.id },
    orderBy: { updatedAt: "desc" },
    include: { analyses: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map((p) => (
        <Link key={p.id} href={`/projects/${p.id}`}
          className="rounded-lg border border-[#1d2b3f] bg-[#121a27] hover:bg-[#162131] p-4 transition-colors">
          {p.analyses[0] && (
            <img src={p.analyses[0].imageUrl} alt="" className="w-full h-32 object-cover rounded-md mb-3" />
          )}
          <p className="text-[#e3e9f2] font-medium">{p.name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[#87a1c5]">{p.updatedAt.toLocaleDateString()}</span>
            <span className="text-sm text-[#6294da]">{(p.analyses[0]?.result as any)?.overall_score ?? "—"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

### `app/projects/[id]/page.tsx`
```tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session!.user!.id },
    include: { analyses: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#e3e9f2]">{project.name}</h1>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}/analyze`} className="rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white px-4 py-2 text-sm">
            New Analysis
          </Link>
          <Link href={`/projects/${project.id}/compare`} className="rounded-md border border-[#263954] text-[#e3e9f2] px-4 py-2 text-sm hover:bg-[#162131]">
            Compare
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {project.analyses.map((a) => (
          <li key={a.id}>
            <Link href={`/report/${a.id}`} className="flex items-center gap-3 rounded-lg border border-[#1d2b3f] bg-[#121a27] hover:bg-[#162131] p-3">
              <img src={a.imageUrl} alt="" className="w-12 h-12 object-cover rounded-md" />
              <span className="text-[#e3e9f2] flex-1">{a.createdAt.toLocaleDateString()}</span>
              <span className="text-[#6294da]">{(a.result as any)?.overall_score}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### `components/projects/ComparePicker.tsx`
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ComparePicker({ projectId, analyses }: { projectId: string; analyses: any[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {analyses.map((a) => (
          <button key={a.id} onClick={() => toggle(a.id)}
            className={`relative rounded-md overflow-hidden border-2 ${selected.includes(a.id) ? "border-[#6294da]" : "border-transparent"}`}>
            <img src={a.imageUrl} alt="" className="w-full h-24 object-cover" />
          </button>
        ))}
      </div>
      <button disabled={selected.length !== 2}
        onClick={() => router.push(`/projects/${projectId}/compare?a=${selected[0]}&b=${selected[1]}`)}
        className="rounded-md bg-[#6294da] hover:bg-[#78a4e3] text-white px-4 py-2 disabled:opacity-40">
        Compare
      </button>
    </div>
  );
}
```

## Definition of Done
- A brand-new user is guided into creating their first project rather than landing on an empty dashboard
- "New Analysis" correctly branches to the picker/no-picker/create-first-project logic based on how many projects the user has
- The dashboard's score-trend widget reflects data across all projects; a project's own trend chart reflects only that project's analyses
- Comparison works correctly when selecting any two analyses within the same project
- Deleting a project cascades and removes its analyses (verified in a test environment, not just assumed from the schema)
