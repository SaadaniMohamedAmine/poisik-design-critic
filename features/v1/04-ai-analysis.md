# 04 — AI Analysis (GPT-4o Vision / Claude Vision)

**Depends on:** `03-upload-image-processing.md`
**Goal:** turn a resized screenshot into a validated, structured, on-brand-toned audit report.

## Output JSON schema (validate with `zod`)
```ts
type Severity = "critical" | "warning" | "suggestion";
type Category =
  | "visual_hierarchy"
  | "contrast"
  | "spacing"
  | "typography"
  | "accessibility"
  | "consistency";

interface Issue {
  id: string;
  category: Category;
  severity: Severity;
  title: string;              // short, e.g. "Low Contrast Ratio"
  description: string;        // 1-2 sentences, expert/posé tone
  recommendation: string;     // actionable fix
  location: { x: number; y: number }; // percentage-based (0-100), for annotation marker placement
}

interface AnalysisResult {
  overall_score: number;      // 0-100
  category_scores: Record<Category, number>; // each 0-100
  issues: Issue[];
  palette?: string[];         // optional, from ColorThief extraction
}
```

## System prompt (starting point — refine with real test images, but keep the tone instruction intact)
```
You are Poisik, an expert UX/UI design critic with the sensibility of a senior design consultant who charges $150-300/hour. You are analyzing a single UI screenshot.

Evaluate the screenshot across exactly these six categories: Visual Hierarchy, Contrast, Spacing, Typography, Accessibility, Consistency.

For each category, give a score from 0-100.
Give an overall_score from 0-100 (can be a weighted or simple average — be consistent).

Identify specific issues. For each issue provide:
- category (one of the six above, lowercase with underscores)
- severity: "critical" (breaks usability or accessibility), "warning" (meaningfully hurts quality), or "suggestion" (polish-level, optional to fix)
- title: a short label (3-6 words)
- description: 1-2 sentences explaining the problem in concrete terms (cite actual colors, spacing values, or elements visible in the image where possible)
- recommendation: a specific, actionable fix — not generic advice
- location: approximate x/y position of the issue on the image, as percentages (0-100) from the top-left corner, for placing a visual marker

Tone: write like a senior design consultant giving a colleague direct, useful feedback — professional, precise, and human. Never robotic/clinical, never overly encouraging or cheerleading, never use emoji.
Example of the right tone: "This contrast ratio falls short of WCAG AA — consider a darker shade."
Example of the wrong tone: "Contrast ratio: 2.1:1 — FAILS." (too clinical) or "Almost there, just a tiny tweak needed! 🎉" (too cheerleading).

Respond with valid JSON only, matching this exact shape:
{ "overall_score": number, "category_scores": { "visual_hierarchy": number, "contrast": number, "spacing": number, "typography": number, "accessibility": number, "consistency": number }, "issues": [ { "id": string, "category": string, "severity": string, "title": string, "description": string, "recommendation": string, "location": { "x": number, "y": number } } ] }
```

## Tasks

1. Implement the GPT-4o Vision call (primary path) with the system prompt above + the resized image (base64 or URL)
2. Implement a Claude Vision fallback — same schema, same system prompt (adapt syntax for Anthropic's API), triggered on GPT-4o failure/timeout or via an explicit `?model=claude` debug flag
3. Validate every AI response against the `zod` schema before returning it to the client — if validation fails, retry once, then surface a friendly error ("The analysis didn't come back as expected — try again.")
4. Server-side WCAG re-verification: for any `contrast` category issue, independently compute the actual contrast ratio (using `wcag-contrast`) from the colors mentioned/extracted, rather than trusting the AI's number blindly — this is a real accuracy safeguard, not optional
5. Optional: run `colorthief`/`color-thief-node` on the image server-side to extract a dominant palette, attach to the response as `palette`
6. i18n hook: the system prompt should accept a `locale` parameter and instruct the model to write `description`/`recommendation`/`title` in that language (see `09-i18n.md`) — build this parameter in now even if you wire it up later

## Definition of Done
- A test screenshot produces a schema-valid response with all 6 categories populated and at least one issue with a `location` that visually lands on the correct part of the image
- Killing the OpenAI key (or forcing an error) correctly falls back to Claude Vision and still returns a valid schema
- A manually-checked low-contrast test image produces a `contrast` issue whose AI-reported ratio matches (or is corrected by) the independently computed `wcag-contrast` value
