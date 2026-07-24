# 16 — Streaming Report

**Modifies:** `04-ai-analysis.md`, `06-support-pages.md` (Loading/Processing screen)
**Goal:** show the AI's analysis appearing progressively instead of a static loading screen followed by a sudden full reveal.

## Approach
Streaming raw JSON token-by-token is fragile to parse mid-stream. Recommended approach — a two-step generation:
1. **Narration step (streamed):** ask the model for a short, natural-language running commentary of what it's finding, streamed token-by-token (e.g. "Scanning the layout... the primary CTA sits close to the fold, good hierarchy so far... contrast on the secondary button looks tight...")
2. **Structured step (final):** once narration completes, request (or reuse the same call with a follow-up) the final structured JSON matching the schema in `04-ai-analysis.md`, rendered as the actual report

Alternative if the agent prefers a single call: use a streaming-JSON-parser (e.g. a partial-JSON parsing library) to progressively render fields as they arrive from one streamed structured response — only take this path if reliably parseable, otherwise use the two-step approach above.

## Tasks

1. Implement streaming for the GPT-4o Vision call (OpenAI's streaming API)
2. Replace the static cycling-phrases copy in the Loading/Processing screen (`06-support-pages.md`) with the actual streamed narration text, appearing progressively, styled consistently with the rest of the app (Inter, `text-secondary`)
3. Once streaming completes, transition smoothly into the full report screen (`05-report-screen.md`) — avoid a jarring layout jump

## Definition of Done
- During analysis, the user sees real, progressively-appearing text reflecting the actual analysis in progress — not a generic fixed phrase list
- The final structured report renders correctly and completely once streaming finishes
- Fallback: if streaming fails for any reason, gracefully degrade to the static loading screen from `06-support-pages.md` rather than breaking the flow
