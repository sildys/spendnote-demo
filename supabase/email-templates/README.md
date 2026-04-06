# SpendNote Email Pack

This folder contains all canonical HTML email templates:

## Auth templates (Supabase Dashboard)

1. `email-confirmation.html` — signup email confirmation
2. `password-reset.html` — password reset link

## Event templates (Edge Function: `send-user-event-email`)

3. `welcome-account-created.html` — welcome after first signup
4. `youve-been-invited.html` — team invitation
5. `invite-accepted-admin.html` — admin notification on invite accept
6. `password-changed.html` — security notification

## Billing templates (Edge Function: `send-user-event-email` + `stripe-webhook`)

7. `upgrade-confirmed.html` — plan upgrade confirmation (Standard/Pro)
8. `payment-failed.html` — payment method declined (revenue recovery)
9. `subscription-canceled.html` — user canceled, active until period end

## Trigger + recipient mapping

- **Email confirmation**
  - Trigger: Supabase Auth confirmation flow
  - Recipient: newly created user (unconfirmed)

- **Password reset**
  - Trigger: user requests password reset from login/forgot-password page
  - Recipient: user email
  - Supabase Auth handles sending automatically

- **Welcome / account created**
  - Trigger: first successful account creation (`SIGNED_UP` flow)
  - Recipient: newly created user
  - Sent by: `send-user-event-email` (`welcome_account_created`)

- **You've been invited**
  - Trigger: admin/owner sends invite from Team UI
  - Recipient: invited email address
  - Sent by: `send-invite-email`

- **Invite accepted (admin notification)**
  - Trigger: invite token accepted successfully
  - Recipient: org admins/owner
  - Sent by: `send-user-event-email` (`invite_accepted_admin`)

- **Password changed**
  - Trigger: user successfully changes password
  - Recipient: user email
  - Sent by: `send-user-event-email` (`password_changed`)

- **Upgrade confirmed**
  - Trigger: tier upgrade detected (free→standard, free→pro, standard→pro)
  - Recipient: owner email
  - Sent by: `stripe-webhook` (server-side, reliable) + `send-user-event-email` (`upgrade_confirmed`, client-side backup from dashboard)

- **Payment failed**
  - Trigger: Stripe `invoice.payment_failed` webhook
  - Recipient: owner email
  - Sent by: `stripe-webhook`

- **Subscription canceled**
  - Trigger: user cancels in Stripe Portal (`cancel_at_period_end` becomes true)
  - Recipient: owner email
  - Sent by: `stripe-webhook`

## Also rendered by Edge Functions (no static preview)

- `first_transaction_created` / `first_transaction_team` — first tx congratulations
- `trial_expiry_warning` — trial ending soon (3/2/1 days left)
- `subscription_downgraded` — plan downgrade (Pro→Standard, etc.)
- `welcome_invited_member` — welcome for invited team members
- `team_member_removed` — notification when removed from team

## Notes

- Keep legal footer line consistent:
  - `Cash handoff documentation only. Not a tax or accounting tool.`
  - `© SpendNote • spendnote.app`
- Keep button labels explicit and action-driven.
- Avoid marketing claims or fake social proof in transactional emails.
