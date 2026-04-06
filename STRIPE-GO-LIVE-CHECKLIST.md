# Stripe Go-Live Checklist

Status: Stripe edge-function skeleton is implemented in code. This checklist covers final configuration and rollout validation.

## A) Pre-live setup (can be done now)

## A1) Environment variables mapping

Set in Supabase Edge Function secrets (project-level):

- `STRIPE_SECRET_KEY` -> Stripe live secret key (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` -> Stripe webhook signing secret (`whsec_...`)
- `STRIPE_STANDARD_MONTHLY_PRICE_ID` -> Standard monthly live Price ID
- `STRIPE_STANDARD_YEARLY_PRICE_ID` -> Standard yearly live Price ID
- `STRIPE_PRO_MONTHLY_PRICE_ID` -> Pro monthly live Price ID
- `STRIPE_PRO_YEARLY_PRICE_ID` -> Pro yearly live Price ID
- `APP_BASE_URL` -> `https://spendnote.app`

Required Supabase secrets (already used by functions):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## A2) Stripe product/price inventory freeze

1. Create/verify live Products in Stripe: `standard`, `pro`.
2. Create/verify four recurring Prices (monthly/yearly per plan).
3. Lock a canonical mapping table (keep it in this file or secure ops doc):
   - `standard/monthly` -> `price_...`
   - `standard/yearly` -> `price_...`
   - `pro/monthly` -> `price_...`
   - `pro/yearly` -> `price_...`
4. Confirm no stale test Price IDs remain in Supabase secrets.

## A3) Runtime URL sanity

Code defaults currently expect:
- Checkout success: `/spendnote-user-settings.html?billing=success`
- Checkout cancel: `/spendnote-pricing.html?billing=cancel`
- Portal return: `/spendnote-user-settings.html?billing=portal`

Confirm these pages exist and render correct user-facing state.

## B) Webhook registration (when Stripe live access is ready)

## B1) Endpoint

Create Stripe webhook endpoint to Supabase function URL:
- `https://<PROJECT-REF>.functions.supabase.co/stripe-webhook`

## B2) Events to subscribe

Enable these events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

## B3) Signing secret

Copy webhook signing secret from Stripe endpoint to:
- `STRIPE_WEBHOOK_SECRET`

## C) End-to-end test script (must pass)

## C1) New paid subscription

1. Start from pricing page and initiate upgrade.
2. Verify checkout session is created and redirect works.
3. Complete Stripe payment.
4. Confirm profile fields update in `profiles`:
   - `stripe_customer_id`
   - `stripe_subscription_id`
   - `stripe_price_id`
   - `subscription_tier` (`standard` or `pro`)
   - `billing_cycle` (`monthly` or `yearly`)
   - `billing_status` (`active`)

## C2) Manage subscription in portal

1. Open billing portal.
2. Confirm portal session creation works.
3. Cancel at period end; verify webhook updates:
   - `stripe_cancel_at_period_end = true`
4. Reactivate if needed; verify status returns correctly.

## C3) Payment failure simulation

1. Trigger invoice payment failure (Stripe test path in staging/sandbox where possible).
2. Confirm `billing_status` becomes `past_due`.
3. Simulate payment recovery; confirm `billing_status` returns to `active`.

## C4) Cancellation/deletion

1. Fully cancel subscription.
2. Confirm `customer.subscription.deleted` handling updates profile:
   - `subscription_tier = free`
   - `billing_status = canceled`
   - `stripe_subscription_id = null`
   - `stripe_price_id = null`
   - `billing_cycle = null`

## D) Stripe Dashboard — business profile, invoices, receipts, portal

Do this in **Live mode** so checkout/portal customers see the right branding and documents.

### D1) Account & public appearance

1. **Settings → Account details** — legal business name, support email/phone, address (where Stripe expects it).
2. **Settings → Branding** — logo, icon, brand color (used on Checkout and Customer Portal).
3. **Settings → Public details** — **Statement descriptor** / short name on card statements (keep within card-network limits).

### D2) Invoices & payment emails (Stripe-generated)

Subscriptions create **Stripe Invoices**. Configure:

1. **Settings → Billing → Customer emails** (or **Emails** in Settings) — turn on **Successful payments** / **Customer receipt** if you want Stripe to email payment confirmations (in addition to your SpendNote product emails).
2. **Settings → Billing → Invoice template** (or **Customization → invoices**) — footer text, memo, business VAT/tax ID on PDF if applicable.
3. If you sell in the EU/UK and need VAT: **Settings → Tax** — Stripe Tax or tax registrations as appropriate (product/legal decision).

### D3) Customer Portal (required for `create-portal-session`)

1. **Settings → Billing → Customer portal**.
2. Enable at least: **Update payment method**, **Cancel subscription** (and optionally **View invoice history**).
3. **Business information** and **Terms / Privacy policy links** — point to `spendnote.app` pages if required.
4. **Products / prices** — portal can only offer changes to prices you allow; align with your live Standard/Pro prices (SpendNote also uses `update-subscription` for some plan changes — verify portal vs app flow in testing).

### D4) Payouts & compliance

1. **Balances → Payouts** — bank account verified.
2. Complete **verification / compliance** prompts in Dashboard so charges are not blocked.

## E) Rollout guardrails

1. Deploy functions only after all live secrets are set.
2. Keep Stripe logs + Supabase Edge logs open during first live transactions.
3. Keep rollback path documented: set `STRIPE_LIVE = false` in `supabase-config.js` + redeploy/cache-bust HTML so pricing shows **Coming Soon**.
4. Verify CORS behavior from production origin after deploy.

## F) Code references

- Checkout session: `supabase/functions/create-checkout-session/index.ts`
- Portal session: `supabase/functions/create-portal-session/index.ts`
- Webhook processor: `supabase/functions/stripe-webhook/index.ts`

## G) Completion criteria

Mark Stripe go-live ready when:
- All live secrets are configured
- Webhook endpoint is registered and signature validated
- Full E2E lifecycle (checkout -> active -> portal/cancel -> webhook updates) passes
- Production monitoring confirms stable webhook delivery and profile updates
