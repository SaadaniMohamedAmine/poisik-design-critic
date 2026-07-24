# 13 — Fix It In Code (differentiator)

**Modifies:** `04-ai-analysis.md`, `05-report-screen.md`
**Goal:** every issue in the report includes a ready-to-copy code fix, not just a prose description — the single highest-priority differentiator for this product's dev-focused audience.

## Schema change (extends `04-ai-analysis.md`'s `Issue` type)
```ts
interface CodeFix {
  language: "css" | "tailwind" | "hex";
  snippet: string;       // e.g. "text-[#e3e9f2]" or "color: #e3e9f2;"
  before?: string;       // the offending value, if applicable (e.g. "#87a1c5")
  after?: string;        // the corrected value (e.g. "#e3e9f2")
}

interface Issue {
  // ...existing fields from 04-ai-analysis.md
  code_fix: CodeFix;
}
```

## System prompt addition (append to the prompt in `04-ai-analysis.md`)
```
For every issue, also provide a code_fix:
- language: "tailwind" if the fix maps cleanly to a Tailwind utility class, "css" for a raw CSS property, or "hex" for a pure color-swap suggestion
- snippet: the exact class name or CSS line to use — be specific and copy-pasteable, not descriptive (e.g. "text-slate-200" not "use a lighter text color")
- before/after: when the fix is a color or value change, state the specific before and after values

Add code_fix to the JSON output shape as a required field on every issue object.
```

## UI (extends `05-report-screen.md`'s issue cards)
- Each issue card gets an expandable "View fix" section (collapsed by default, to avoid cluttering the flagship screen)
- Inside: a small before/after swatch pair for color fixes, plus a syntax-highlighted code block with a "Copy" button (Lucide `Copy` icon, brief "Copied" confirmation state)
- Use a lightweight syntax highlighter (`shiki` or `prism-react-renderer`) re-themed to the Poisik monochrome palette — **do not use a highlighter's default red/green/yellow syntax theme**, restyle tokens to use only `text-primary`/`text-secondary`/`accent-signal` per the monochrome rule in `00-design-system-reference.md`

## Definition of Done
- Every issue returned by the AI includes a valid, non-empty `code_fix`
- Clicking "Copy" on a fix correctly copies the snippet to the clipboard with visual confirmation
- Code blocks are legibly styled within the existing dark palette, no off-brand syntax-highlighting colors
