# 15 — Benchmark Comparison

**Modifies:** `05-report-screen.md`
**Depends on:** `04-ai-analysis.md`
**Goal:** make the score memorable by anchoring it against known reference products.

## Tasks

1. **Static reference dataset** — a config file (e.g. `lib/benchmarks.ts`) with a small, hand-picked, pre-computed list of reference scores for well-known products, e.g.:
   ```ts
   export const BENCHMARKS = [
     { name: "Stripe Checkout", score: 96 },
     { name: "Linear Dashboard", score: 92 },
     { name: "Vercel Dashboard", score: 90 },
   ];
   ```
   These are one-time, hardcoded reference points — **do not** re-analyze these live on every request, and do not claim they were generated the same way as the user's live analysis (be honest in the UI copy that these are reference benchmarks, not literally re-run through Poisik in real time, unless the agent actually chooses to run and cache real analyses of these once).

2. **UI placement** (extends the score header in `05-report-screen.md`)
   - A subtle secondary caption near the `<CircularGauge />`: e.g. "84 — close to Linear Dashboard (92)" — pick the closest-scoring benchmark automatically, or rotate between 1-2 relevant ones
   - Keep this secondary in visual weight — it supports the main score, it doesn't compete with it

## Definition of Done
- Every report screen shows one relevant benchmark comparison near the overall score
- Comparison text is grammatically correct whether the user's score is above, at, or below the referenced benchmark
