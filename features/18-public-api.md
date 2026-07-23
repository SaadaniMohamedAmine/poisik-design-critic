# 18 — Public API

**Depends on:** `04-ai-analysis.md`, `10-pricing-stripe.md`
**Goal:** expose the analysis engine as a public, authenticated API — signals platform thinking, not just a website.

## Tasks

1. **Endpoint:** `POST /api/v1/analyze`
   - Accepts either an image (multipart upload or base64) or a URL (reusing `14-live-url-analysis.md`'s capture pipeline)
   - Returns the same `AnalysisResult` JSON shape defined in `04-ai-analysis.md`

2. **Authentication**
   - API keys are issued only to Pro-plan customers (ties into the Stripe customer record from `10-pricing-stripe.md`) — generate a key on upgrade, viewable/regeneratable from an account settings area
   - Free/anonymous tier has no API access

3. **Rate limiting**
   - Implement via Upstash Redis (or Vercel's native rate-limiting primitives) — a sensible default (e.g. 60 requests/hour per key), configurable

4. **Documentation**
   - A `/docs/api` page (or a rendered Markdown page) showing: authentication method, request/response examples for both image and URL input, error codes

## Definition of Done
- A valid API key successfully calls the endpoint and receives a schema-correct `AnalysisResult`
- A missing/invalid key is rejected with a clear 401/403 and error message
- Exceeding the rate limit returns a proper 429 with a clear message
