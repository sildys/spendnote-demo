# Supabase Email Template Setup (copy/paste map)

## 1) Supabase Dashboard paths

Go to: **Supabase Dashboard -> Authentication -> Email Templates**

## 2) Template mapping

- **Confirm signup**
  - Subject: `Confirm your email — start tracking your cash`
  - Paste: `email-confirmation.html`

- **Reset password**
  - Subject: `Reset your SpendNote password`
  - Paste: `password-reset.html`

- **Invite user**
  - Optional in Auth Templates (SpendNote uses custom invite sender Edge Function)
  - If you still want Auth fallback, paste: `youve-been-invited.html`

## 3) Event emails sent by Edge Function (not Auth template editor)

These are sent by `send-user-event-email`:

- `welcome_account_created` — welcome email driving first transaction
- `first_transaction_created` — congratulations + nudge to record another
- `trial_expiry_warning` — loss-framed trial warning with tx count
- `upgrade_confirmed` — plan confirmation with unlocked features
- `invite_accepted_admin` — admin notification when invite is accepted
- `password_changed` — security notification

Sent by `send-invite-email`:

- Team invitation email with personalized inviter name

## 4) Required Edge Function secrets

Set in Supabase project secrets:

- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 5) Deploy functions

Deploy these functions after pull:

- `send-invite-email`
- `send-user-event-email`

## 6) Placeholders

Auth templates must keep Supabase variables intact:

- `{{ .ConfirmationURL }}` in confirmation/reset templates

## 7) Post-setup smoke test

1. Sign up with new email -> confirmation email arrives (subject: "Confirm your email — start tracking your cash")
2. Confirm email and login -> welcome email arrives (subject: "{name}, your cash tracking starts now")
3. Record first transaction -> first-tx email arrives (subject: "Your first transaction is on record")
4. Invite a user from Team page -> invite email arrives (subject: "{inviter} invited you to SpendNote")
5. Accept invite -> admin notification email arrives (subject: "{user} joined your team")
6. Request password reset -> reset email arrives
7. Change password -> password-changed email arrives
