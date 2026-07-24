# 14 — Live URL Analysis (differentiator)

**Modifies:** `03-upload-image-processing.md`
**Depends on:** `01-init-setup.md`
**Goal:** let a user paste a live URL instead of needing a screenshot ready — removes the biggest friction point in the demo/onboarding flow.

## Tasks

1. **Input mode toggle** on the Upload screen: "Upload screenshot" / "Analyze a URL" (tab or segmented control, matching the existing dropzone's visual weight)

2. **Screenshot capture pipeline**
   - Add `playwright` (or `puppeteer-core` + `@sparticuz/chromium` for serverless/Vercel compatibility) as a dependency
   - API route: given a URL, launch a headless browser, navigate, wait for network idle (with a hard timeout, e.g. 15s), capture a screenshot (viewport or full-page — viewport recommended to match typical "above the fold" UI critique use case)
   - Feed the captured screenshot through the existing resize (`sharp`, from `03-upload-image-processing.md`) and into the same analysis pipeline as `04-ai-analysis.md` — do not build a separate analysis path

3. **Validation & error handling**
   - Validate URL format before attempting capture
   - Handle unreachable sites, timeouts, and sites that block headless browsers (some do) with a clear error: "We couldn't load that page — try uploading a screenshot instead."
   - Enforce the same 15s timeout budget regardless of site complexity

4. **Serverless constraint — build-time decision required**
   - Running a full headless browser inside a Vercel serverless function is resource-heavy and may hit execution time/memory limits depending on the plan. Two viable paths:
     (a) Self-host via `puppeteer-core` + `@sparticuz/chromium` within Vercel's function limits, or
     (b) Use a managed screenshot API (e.g. urlbox.io, screenshotone.com, or similar) as the capture backend instead of self-hosting a browser
   - Choose based on what proves reliable in testing — don't assume (a) works without verifying against real-world sites and Vercel's actual timeout/memory limits on the plan in use

## Definition of Done
- Pasting a real, public, non-restricted URL produces a screenshot and a full analysis report without any manual upload step
- An invalid URL or unreachable site shows the specified error message, with a suggestion to fall back to manual upload
- Capture completes within the timeout budget for a typical marketing/SaaS page
