# 19 — CLI Tool

**Depends on:** `18-public-api.md`
**Goal:** a small companion CLI — `npx poisik analyze <file|url>` — a strong, memorable signal for a technical audience.

## Tasks

1. Separate small Node package (a `cli/` workspace within the same repo, or its own repo — agent's choice), built with a CLI framework (`commander` or `citty`)
2. Command: `poisik analyze ./screenshot.png` or `poisik analyze https://example.com` — calls the public API from `18-public-api.md` using an API key read from an env var (`POISIK_API_KEY`) or a local config file
3. Output:
   - Default: pretty-printed terminal summary (overall score, top 3 issues by severity)
   - `--json` flag: full raw JSON output
   - `--open` flag: opens the full web report in the default browser
4. Publish to npm (name it `poisik` if available, otherwise `@poisik/cli`)

## Definition of Done
- `npx poisik analyze <path-or-url>` against a real target returns a readable terminal summary
- `--json` and `--open` flags both work as specified
- Package is published and installable via `npx` without prior local setup
