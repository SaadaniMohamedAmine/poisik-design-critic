# 10 — Pricing & Stripe

**Depends on:** `01-init-setup.md`, `07-history.md`
**Goal:** a working billing flow that does not require building a full authentication system.

## Decision (resolved — do not re-litigate without checking with the project owner)
The project has an explicit **no-auth** rule for the free tier. Stripe billing needs *some* way to identify a paying user, so the approach is:
- Identity for paying users = a **Stripe Customer**, created and identified by the **email collected at Stripe Checkout** — nothing more
- After a successful checkout, the Stripe webhook issues a signed httpOnly cookie (`poisik_customer`) containing the Stripe customer ID and current plan tier
- This cookie is checked by the plan-gating middleware — it is not a general login system, there is no password, no session management beyond this single cookie, and free/anonymous users are entirely unaffected (they never see anything related to this)
- If a paying user clears cookies or switches browsers, they can restore access via a "Restore my Pro plan" flow that re-sends the Stripe Customer Portal link to their email (Stripe supports this natively) — this avoids needing a real login system while still letting paying customers recover access

## Plans (exact limits are placeholders — flag as configurable, not hardcoded)
- **Free:** anonymous, no email required. Limited to e.g. 5 analyses/month (tracked via the `poisik_session` cookie from `07-history.md`), PDF export includes a "Made with Poisik" watermark
- **Pro:** unlimited analyses, no watermark, Comparison mode unlocked, priority AI model routing — requires the Stripe customer cookie above

## Tasks

1. **Pricing page** (`/pricing`) — Free vs Pro comparison table, matching the Stitch export/brand, CTA on Pro → Stripe Checkout
2. **Stripe Checkout** — Checkout Session (or Payment Link) for the Pro plan, success URL redirects back into the app
3. **Stripe Webhook handler** (`/api/webhooks/stripe`):
   - `checkout.session.completed` → create/update the customer record, issue the `poisik_customer` cookie
   - `customer.subscription.deleted` / `customer.subscription.updated` (canceled) → downgrade to Free
4. **Stripe Customer Portal** — a "Manage subscription" link/button for Pro users, using Stripe's hosted portal (cancel, update payment method, view invoices)
5. **Plan-gating middleware** — server-side check (cookie presence + a lightweight DB/Stripe lookup to confirm the subscription is still active) before allowing: unlimited analyses, watermark-free PDF export, Comparison mode

## Definition of Done
- Full Stripe **test mode** flow works end to end: visit `/pricing` → Checkout (test card) → webhook fires → `poisik_customer` cookie set → Pro features unlock → Customer Portal → cancel → webhook fires → Pro features lock again
- A Free/anonymous user never encounters any Stripe-related UI unless they click "Upgrade"
- Free plan's monthly analysis limit correctly resets/enforces based on the `poisik_session` cookie
