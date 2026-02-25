# S1 — Subscription Rules Specification

> Canonical reference for trial model, plan limits, feature flags, and billing behavior.
> Used by: S2 (Stripe prep), L1b (tier-specific onboarding), enforcement logic.

---

## 1. Trial Model

- **Duration:** 14 calendar days OR 20 transactions — whichever comes first.
- **Trial plan:** equivalent to Free plan limits during trial.
- **At expiry:** account switches to Free (view-only enforcement kicks in).

---

## 2. Plans & Limits

| | **Free** | **Standard** | **Pro** |
|---|---|---|---|
| **Price (monthly)** | $0 | $19/mo | $29/mo (3 users) |
| **Price (yearly)** | $0 | ~$15.83/mo | ~$24.17/mo |
| **Users** | 1 | 1 | 3 included; +$5/mo per extra user |
| **Cash Boxes** | 1 | 2 | Unlimited |
| **Transactions** | 20 total | Unlimited | Unlimited |
| **Basic receipt (print/PDF)** | ✓ | ✓ | ✓ |
| **Custom logo upload** | ✗ | ✓ | ✓ |
| **Customizable receipt layout** | ✗ | ✓ | ✓ |
| **CSV export** | ✗ | ✓ | ✓ |
| **PDF export** | basic only | ✓ | ✓ |
| **Email receipt** | ✗ | ✗ | ✓ |
| **Custom text & labels** | ✗ | ✗ | ✓ |
| **Team invite** | ✗ | ✗ | ✓ |
| **Role-based permissions** | ✗ | ✗ | ✓ |
| **Yearly discount** | — | 2 months free | 2 months free |

---

## 3. Trial / Free Expiry Behavior

When trial expires or account is on Free plan and hits limits:

- **View-only:** existing transactions and receipts remain readable.
- **Create blocked:** new transactions cannot be created once tx limit (20) reached.
- **Export blocked:** CSV and PDF export disabled on Free.
- **Invite blocked:** team invites only available on Pro.

---

## 4. Downgrade Behavior

When a user downgrades to a plan with stricter limits (e.g. Pro → Standard):

- **Lock, don't delete:** existing data above the new plan's limits is locked (read-only), not deleted.
- Example: Pro → Standard with 5 cash boxes → 2 cash boxes active, 3 locked (no new transactions, no edit — but history visible).
- User is shown a clear message explaining which resources are locked and how to unlock (upgrade).

---

## 5. Account Deletion Behavior

- **Owner deletes account:** entire org is deleted (all cash boxes, transactions, contacts, members, invites).
- **Admin/User deletes account:** only their own profile is removed from the org; org and data remain intact.

---

## 6. Feature Flag Keys (for frontend enforcement)

| Feature | Flag key |
|---|---|
| Create transaction | `can_create_transaction` |
| CSV export | `can_export_csv` |
| PDF export (full) | `can_export_pdf` |
| Email receipt | `can_send_email_receipt` |
| Logo upload | `can_upload_logo` |
| Custom receipt labels | `can_customize_labels` |
| Team invite | `can_invite_members` |
| Extra cash box (>1) | `can_add_cash_box` |

> Implementation note: feature flags are derived client-side from the subscription tier stored in `profiles.subscription_tier`. Server-side enforcement via RLS/RPC where applicable.

---

## 7. Open / Deferred

- Yearly billing: discount shown, Stripe yearly price IDs TBD (S2).
- Per-user billing for Pro extra users: Stripe metered/quantity billing TBD (S2/S3).
- Grace period after payment failure: TBD (S2).
