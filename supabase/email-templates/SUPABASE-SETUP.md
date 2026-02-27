# Supabase Email Template Setup (copy/paste map)

## 1) Supabase Dashboard paths

Go to: **Supabase Dashboard -> Authentication -> Email Templates**

## 2) Template mapping

- **Confirm signup**
  - Paste: `email-confirmation.html`

- **Reset password**
  - Paste: `password-reset.html`

- **Invite user**
  - Optional in Auth Templates (SpendNote uses custom invite sender Edge Function)
  - If you still want Auth fallback, paste: `youve-been-invited.html`

## 3) Event emails sent by Edge Function (not Auth template editor)

These are sent by `send-user-event-email`:

- `welcome-account-created.html` (event: `welcome_account_created`)
- `invite-accepted-admin.html` (event: `invite_accepted_admin`)
- `password-changed.html` (event: `password_changed`)

## 4) Required Edge Function secrets

Set in Supabase project secrets:

- `RESEND_API_KEY`
- `SPENDNOTE_EMAIL_FROM` (example: `SpendNote <no-reply@spendnote.app>`)
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

1. Sign up with new email -> confirmation email arrives
2. Confirm email and login -> welcome email arrives (if session created at signup/login path triggers)
3. Invite a user from Team page -> invite email arrives
4. Accept invite -> admin notification email arrives
5. Request password reset -> reset email arrives
6. Change password -> password-changed email arrives
