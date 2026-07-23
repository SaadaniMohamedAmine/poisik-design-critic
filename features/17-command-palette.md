# 17 — Command Palette

**Modifies:** `02-design-system.md` (adds a new global component)
**Goal:** a Cmd+K command palette — a small craft detail that senior frontend recruiters notice immediately.

## Tasks

1. Use `cmdk` (the library behind Shadcn's Command component) or Shadcn's built-in `<Command />`
2. Global keyboard shortcut: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux), reachable from any page
3. Actions to include:
   - "New analysis" → `/upload`
   - "Go to History"
   - "Go to Compare" → `/compare`
   - "Go to Pricing" → `/pricing`
   - "Go to Demo" → `/demo`
   - "Switch language" → toggles EN/FR (see `09-i18n.md`)
4. Style to match the design system: `surface` background, `border-strong` border, `accent-soft-bg` highlight on the selected/hovered item, Inter typography, Lucide icons per action

## Definition of Done
- `Cmd+K`/`Ctrl+K` opens the palette from every page in the app
- All listed actions navigate/act correctly
- Full keyboard navigation works (arrow keys to move selection, Enter to activate, Esc to close)
