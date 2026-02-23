# Smoke Checklist (Release Quick Run)

Purpose: fast pass/fail validation before release or after critical backend/auth changes.

## Preconditions

- Environment: `https://spendnote.app`
- Test account: active user with at least 1 Cash Box
- Browser: one fresh normal window (not private)
- Optional: second account/email for invite verification

## Pass Criteria

All critical flows below complete without blocker errors, with expected UI feedback and no data loss.

## Checklist

### 1) Auth: Login + Session

- [ ] Log in with valid credentials.
- [ ] Confirm dashboard loads and nav/user menu is visible.
- [ ] Hard refresh once; confirm session remains valid.

Fail if:
- login loops, blank screen, or immediate unauthorized state.

### 2) Create Transaction (Core)

- [ ] Create one `IN` transaction from Dashboard modal.
- [ ] Create one `OUT` transaction with valid amount.
- [ ] Confirm both appear in recent/history with expected values.

Fail if:
- save fails without actionable message, or created item is missing.

### 3) Receipt: Print/PDF

- [ ] Open created transaction detail.
- [ ] Generate print receipt.
- [ ] Generate PDF receipt.
- [ ] Confirm receipt pages load transaction data (not empty placeholders).

Fail if:
- receipt pages fail to open, are blank, or show mismatched transaction data.

### 4) Receipt Email (Edge Function)

- [ ] Send receipt email from transaction detail to a valid email.
- [ ] Confirm success toast/message.
- [ ] If fail is forced, verify error includes a useful message (and optional `Ref:` id).

Fail if:
- request silently fails or user only sees generic/non-actionable error.

### 5) Team Invite (RPC + Edge Function)

- [ ] Invite a team member from User Settings.
- [ ] Confirm pending invite appears in team list.
- [ ] Verify either email sent successfully OR fallback invite link is provided.

Fail if:
- invite creation fails without clear error context or pending row is not created.

### 6) Regression Quick Check

- [ ] Open transaction detail again and confirm no new console error storm.
- [ ] Confirm no major layout break on Dashboard/User Settings.

Fail if:
- repeated runtime errors or obvious UI breakage appears after above actions.

## Run Log Template

- Date:
- Environment:
- Tester:
- Result: PASS / FAIL
- Failed steps:
- Notes:

## Latest Run

- Date: 2026-02-23
- Environment: https://spendnote.app
- Tester: User (manual quick run)
- Result: PASS
- Failed steps: none
- Notes:
  - All 6 checklist groups passed: auth, create transaction (IN/OUT), receipt print/PDF, receipt email, team invite.
