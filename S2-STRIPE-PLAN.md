# S2 — Stripe Integration Plan

> Preparation spec for Stripe billing integration.
> Implementation (S3) starts when Stripe account is ready (~2-3 weeks).

---

## 1. Data Model (already in DB)

`profiles` table already has:
- `subscription_tier` TEXT — 'free' | 'standard' | 'pro' (default: 'free')
- `stripe_customer_id` TEXT — Stripe Customer ID (set on first checkout)
- `stripe_subscription_id` TEXT — Stripe Subscription ID (set on active sub)

No DB migration needed for S3 start.

---

## 2. Feature Flag System (DONE — S2)

`window.SpendNoteFeatures` in `assets/js/supabase-config.js`:
- `getTier()` — reads `profiles.subscription_tier`, cached per session
- `can(flag)` — returns boolean for a given feature key
- `getAll()` — returns full flag map + tier
- `isAtLeast(minTier)` — tier comparison helper
- `invalidate()` — clears cache (call after subscription change)

Feature keys (from S1-SPEC.md):
- `can_create_transaction`, `can_export_csv`, `can_export_pdf`
- `can_send_email_receipt`, `can_upload_logo`, `can_customize_labels`
- `can_invite_members`, `can_add_cash_box`
- `max_cash_boxes`, `max_users`

---

## 3. Lock / Upgrade UI (DONE — S2)

`window.SpendNoteUpgrade` in `assets/js/main.js`:
- `showLockOverlay({ feature, requiredPlan })` — modal overlay with "View Plans" CTA
- `showLockBadge(el, requiredPlan)` — inline lock badge on a UI element
- `guardFeature(flag, featureLabel, requiredPlan)` — one-liner guard: checks flag, shows overlay if blocked, returns bool

Usage pattern:
```js
const ok = await window.SpendNoteUpgrade.guardFeature('can_export_csv', 'CSV Export', 'standard');
if (!ok) return;
// ... proceed with export
```

---

## 4. Stripe Products & Prices (to create in Stripe Dashboard)

| Product | Price ID (placeholder) | Amount | Interval |
|---|---|---|---|
| Standard | `price_standard_monthly` | $19 | month |
| Standard | `price_standard_yearly` | $190 | year (~$15.83/mo) |
| Pro | `price_pro_monthly` | $29 | month |
| Pro | `price_pro_yearly` | $290 | year (~$24.17/mo) |
| Pro extra user | `price_pro_user_monthly` | $5 | month (metered/quantity) |

---

## 5. Webhook Events to Handle (S3)

| Event | Action |
|---|---|
| `checkout.session.completed` | Set `stripe_customer_id`, `stripe_subscription_id`, update `subscription_tier` |
| `customer.subscription.updated` | Update `subscription_tier` based on new price |
| `customer.subscription.deleted` | Downgrade to `free`, clear `stripe_subscription_id` |
| `invoice.payment_failed` | (optional) grace period logic, notify user |
| `invoice.payment_succeeded` | Confirm active status, extend period if needed |

Webhook handler: new Supabase Edge Function `stripe-webhook/index.ts`
- Validates `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`
- Updates `profiles` table via service role client
- Calls `window.SpendNoteFeatures.invalidate()` is client-side only — server update is enough (next page load picks up new tier)

---

## 6. Checkout Flow (S3)

1. User clicks "Upgrade" on pricing page or lock overlay
2. Frontend calls Edge Function `create-checkout-session` with `{ priceId, successUrl, cancelUrl }`
3. Edge Function creates Stripe Checkout Session, returns `{ url }`
4. Frontend redirects to Stripe-hosted checkout
5. On success: Stripe fires `checkout.session.completed` → webhook updates DB
6. User lands on `successUrl` → page re-reads tier from DB → features unlock

---

## 7. Customer Portal (S3)

- Stripe Customer Portal for: plan change, cancel, payment method update
- Edge Function `create-portal-session` returns portal URL
- Link in User Settings → "Manage Subscription" (visible when `stripe_customer_id` is set)

---

## 8. Environment Variables Needed

| Key | Where |
|---|---|
| `STRIPE_SECRET_KEY` | Supabase Edge Function secret |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function secret |
| `STRIPE_STANDARD_MONTHLY_PRICE_ID` | Supabase Edge Function secret |
| `STRIPE_STANDARD_YEARLY_PRICE_ID` | Supabase Edge Function secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Supabase Edge Function secret |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Supabase Edge Function secret |

---

## 9. S3 Checklist (when Stripe account ready)

- [ ] Create Products + Prices in Stripe Dashboard
- [ ] Set env vars in Supabase project secrets
- [ ] Implement `create-checkout-session` Edge Function
- [ ] Implement `create-portal-session` Edge Function
- [ ] Implement `stripe-webhook` Edge Function
- [ ] Wire up "Upgrade" buttons on pricing page → checkout
- [ ] Wire up "Manage Subscription" in User Settings
- [ ] Connect lock overlay "View Plans" → checkout flow (optional: direct to checkout)
- [ ] Enforce `can_create_transaction` server-side in `spendnote_create_transaction` RPC
- [ ] Test full checkout → webhook → tier update → feature unlock flow
- [ ] Live mode rollout + smoke test
