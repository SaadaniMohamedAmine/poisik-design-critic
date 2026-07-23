# 07 — History (Anonymous Session)

**Depends on:** `01-init-setup.md`, `04-ai-analysis.md`
**Goal:** let users see their past analyses without any login system.

## Decision (resolved — do not re-litigate without checking with the project owner)
No login/signup exists in this product. History is scoped to an **anonymous session**, not an account:
- On first visit, issue a signed, httpOnly cookie containing a random UUID (`poisik_session`)
- Every analysis performed is persisted in PostgreSQL, tagged with that session UUID
- The History page/drawer queries analyses by that cookie's UUID only

**Accepted limitation (document this in the README, do not try to "fix" it):** history does not sync across browsers/devices — that would require real authentication, which is explicitly out of scope for this product.

## Tasks

1. **Session cookie**
   - Middleware or a server action that checks for `poisik_session`; if absent, generates a UUID v4 and sets it as a signed httpOnly cookie (long expiry, e.g. 1 year)

2. **Database schema** (Prisma, PostgreSQL)
   ```prisma
   model Analysis {
     id            String   @id @default(cuid())
     sessionId     String
     imageUrl      String
     result        Json     // the AnalysisResult from 04-ai-analysis.md
     isPublic      Boolean  @default(false) // true once "Share Report" is used
     createdAt     DateTime @default(now())

     @@index([sessionId])
   }
   ```

3. **History UI**
   - A list/grid of past analyses for the current session (thumbnail, overall score, date, link to the report)
   - Empty state per `06-support-pages.md`

4. **Retention (recommended, make it configurable rather than hardcoded)**
   - Suggest auto-purging analyses older than 30 days via a scheduled job/cron (Vercel Cron or similar) to control storage cost — expose the retention window as an env var (`ANALYSIS_RETENTION_DAYS`) rather than hardcoding it

## Definition of Done
- Revisiting the site in the same browser shows previously run analyses
- Opening the site in a private/incognito window (or a different browser) shows an empty history — this is expected and correct, not a bug
- The `Analysis.isPublic` flag correctly gates whether `/report/[id]` (from `06-support-pages.md`) is reachable
