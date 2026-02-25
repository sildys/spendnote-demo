# SpendNote — Full Application Audit

> Generated: 2025-02-17  
> Scope: All processes, features, roles, permissions, and identified gaps  
> Exclusion: Stripe/billing/subscription management (not yet implemented)

---

## 1. Architecture Overview

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML/CSS/JS (no framework), FontAwesome icons |
| **Backend** | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| **Email** | Resend API (via Edge Function) |
| **Hosting** | Cloudflare Pages (spendnote.app) |
| **Monitoring** | Sentry (consent-gated), client_error_logs table |
| **Session** | sessionStorage-based (tab-scoped), bootstrap for receipt tabs |

---

## 2. Pages & Navigation

### 2.1 Public Pages (no auth required)
| Page | Purpose |
|---|---|
| `index.html` | Marketing landing page |
| `spendnote-login.html` | Sign in (email + password) |
| `spendnote-signup.html` | Registration + invite token acceptance |
| `spendnote-forgot-password.html` | Request password reset email |
| `spendnote-reset-password.html` | Set new password (via email link) |
| `spendnote-pricing.html` | Subscription tier overview |
| `spendnote-faq.html` | FAQ page |
| `spendnote-privacy.html` | Privacy policy |
| `spendnote-terms.html` | Terms of service |

### 2.2 App Pages (auth-guarded)
| Page | Purpose |
|---|---|
| `dashboard.html` | Main dashboard — cash box cards, recent transactions, create-transaction modal |
| `spendnote-cash-box-list.html` | List all cash boxes (drag-reorder, create new) |
| `spendnote-cash-box-detail.html` | Single cash box transactions view |
| `spendnote-cash-box-settings.html` | Create/edit cash box (name, currency, color, icon, id_prefix, receipt settings, receipt labels, cash box logo) |
| `spendnote-transaction-history.html` | Full paginated transaction history with filters, search, sort, export |
| `spendnote-transaction-detail.html` | Single transaction view + receipt preview/print/email/void |
| `spendnote-contact-list.html` | Contact list (CRUD, bulk delete) |
| `spendnote-contact-detail.html` | Single contact detail + transaction history |
| `spendnote-new-transaction.html` | Mobile-only dedicated new transaction form |
| `spendnote-team.html` | Team management (invite, roles, cash box access) |
| `spendnote-user-settings.html` | Profile, avatar, receipt identity, billing (owner-only), password, delete account |

### 2.3 Receipt Template Pages (special auth handling)
| Page | Purpose |
|---|---|
| `spendnote-pdf-receipt.html` | A4/Letter PDF receipt (print-optimized) |
| `spendnote-email-receipt.html` | Email-friendly receipt HTML |
| `spendnote-receipt-print-two-copies.html` | Dual-copy print receipt |

These support `?publicToken=`, `?demo=1`, and `?bootstrap=1` for iframe/tab session sharing.

---

## 3. Authentication & Session

### 3.1 Auth Flows
| Flow | Implementation |
|---|---|
| **Sign Up** | `auth.signUp()` → Supabase email confirmation → profile auto-created via `handle_new_user()` trigger |
| **Sign In** | `auth.signIn()` → email + password |
| **Forgot Password** | `auth.resetPassword()` → email with `{{ .ConfirmationURL }}` → `spendnote-reset-password.html` |
| **Reset Password** | `auth.updatePassword()` on the reset page after OTP/code exchange |
| **Sign Out** | `auth.signOut()` → clears sessionStorage, localStorage keys, redirects to `index.html` |
| **Delete Account** | `auth.deleteAccount()` → Edge Function with role-based cascading |

### 3.2 Auth Guard (`auth-guard.js`)
- Included on all app pages
- Checks `supabaseClient.auth.getSession()`
- Receipt templates skip auth for `?publicToken` or `?demo=1`
- Iframes use bootstrap session from `localStorage` (`spendnote.session.bootstrap`)
- Supports `returnTo` parameter for post-login redirect
- Checks org selection state; redirects to `?orgPick=1` if multi-org user has no selection

### 3.3 Session Storage
- Uses **sessionStorage** (not localStorage) → session dies on tab close
- Bootstrap mechanism writes to `localStorage` for cross-tab receipt rendering
- Auth state changes trigger user cache + org context cache invalidation

---

## 4. Database Schema

### 4.1 Core Tables
| Table | Owner FK | RLS | Purpose |
|---|---|---|---|
| `profiles` | `auth.users(id)` CASCADE | Yes — own row only | User profile (name, email, company, avatar, subscription_tier, stripe IDs) |
| `cash_boxes` | `profiles(id)` CASCADE | Yes — own rows | Cash registers (name, currency, color, icon, balance, receipt settings, receipt labels, logo) |
| `contacts` | `profiles(id)` CASCADE | Yes — own rows | Customer/vendor contacts |
| `transactions` | `profiles(id)` CASCADE | Yes — own rows | Income/expense records with contact snapshot, cash box snapshot, line items |
| `team_members` | `profiles(id)` CASCADE | Yes — owner or member | Legacy team table (owner_id + member_id + role) |
| `cash_box_access` | `cash_boxes(id)` CASCADE | Yes — owner of cash box | Legacy per-box access grants |

### 4.2 Org/Team Tables (live schema, used by frontend)
| Table | Purpose |
|---|---|
| `orgs` | Organization entity (id, name, owner_user_id) |
| `org_memberships` | User ↔ Org mapping with role (owner/admin/user) |
| `invites` | Pending team invitations (token_hash, invited_email, role, status, org_id) |
| `cash_box_memberships` | Per-user cash box access for "user" role members |
| `client_error_logs` | Frontend error telemetry |

### 4.3 Key Columns & Features
- **Transaction snapshots**: `cash_box_name_snapshot`, `cash_box_currency_snapshot`, `cash_box_color_snapshot`, `cash_box_icon_snapshot`, `cash_box_id_prefix_snapshot` — immutable historical context
- **Contact snapshots**: `contact_name`, `contact_email`, `contact_phone`, `contact_address` on transactions
- **Sequence numbers**: `sequence_number` on cash_boxes, `cash_box_sequence` + `tx_sequence_in_box` on transactions, `sequence_number` on contacts
- **Void support**: `status` (active/voided), `void_reason`, `voided_by_tx_id`, `is_system` on transactions
- **Line items**: JSONB array on transactions for multi-line receipts
- **Receipt labels**: 9 customizable label columns on `cash_boxes` (Pro feature)
- **Receipt visibility**: 6 boolean show/hide flags on `cash_boxes`
- **Immutable fields**: `cash_boxes.currency` and `cash_boxes.id_prefix` locked after creation via trigger

### 4.4 Key RPC Functions
| Function | Purpose |
|---|---|
| `spendnote_create_transaction` | Atomic insert with balance check + snapshot + sequence assignment |
| `spendnote_void_transaction` | Void + create reversal system transaction |
| `spendnote_create_invite` | Create invite with hashed token |
| `spendnote_accept_invite_v2` | Accept invite by token, create org_membership |
| `spendnote_auto_accept_my_invites` | Auto-accept pending invites matching user email |
| `spendnote_delete_invite` | SECURITY DEFINER delete for invites |
| `spendnote_consume_rate_limit` | Rate limiting for Edge Functions |
| `create_cash_box` | Legacy RPC for cash box creation |

### 4.5 Triggers
| Trigger | Purpose |
|---|---|
| `update_*_updated_at` | Auto-set `updated_at` on profiles, cash_boxes, contacts, transactions |
| `update_cash_box_balance_trigger` | Auto-update `current_balance` on transaction INSERT/UPDATE/DELETE |
| `lock_cash_box_identity_fields_trigger` | Block changes to `currency` and `id_prefix` after creation |
| `on_auth_user_created` | Auto-create profile row on signup |

---

## 5. Role-Based Access Control (RBAC)

### 5.1 Roles
| Role | Scope |
|---|---|
| **Owner** | Full control — org, all cash boxes, all members, billing, receipt identity, delete org |
| **Admin** | Manage team, invite, set roles, manage cash box access, edit receipt identity, all cash boxes visible |
| **User** | View assigned cash boxes only, read-only receipt identity, no billing, no team management |

### 5.2 Permission Matrix

| Feature | Owner | Admin | User |
|---|---|---|---|
| View Dashboard | ✅ | ✅ | ✅ (assigned cash boxes only) |
| Create Transaction | ✅ | ✅ | ✅ (assigned cash boxes) |
| View All Cash Boxes | ✅ | ✅ | ❌ (only via `cash_box_memberships`) |
| Create/Edit Cash Box | ✅ | ✅ | ❌ |
| Delete Cash Box | ✅ | ✅ | ❌ |
| View Contacts | ✅ | ✅ | ✅ |
| Create/Edit/Delete Contacts | ✅ | ✅ | ✅ |
| View Transaction History | ✅ | ✅ | ✅ (filtered by access) |
| Void Transaction | ✅ | ✅ | ✅ |
| View Team Page | ✅ | ✅ | ❌ (link hidden) |
| Invite Members | ✅ | ✅ | ❌ |
| Set Member Roles | ✅ | ✅ | ❌ |
| Remove Members | ✅ | ✅ | ❌ |
| Manage Cash Box Access | ✅ | ✅ | ❌ |
| Edit Org Name | ✅ | ✅ | ❌ |
| Edit Receipt Identity | ✅ | ✅ | ❌ (read-only) |
| Edit Account Logo | ✅ | ✅ | ❌ (disabled) |
| View Billing | ✅ | ❌ | ❌ |
| Change Password | ✅ | ✅ | ✅ |
| Edit Profile (name, avatar) | ✅ | ✅ | ✅ |
| Delete Account | ✅ (deletes org) | ✅ (self only) | ✅ (self only) |

### 5.3 Role Determination
- Fetched from `org_memberships` table via `db.orgMemberships.getMyRole()`
- Cached in `__orgContextCache` with 30s TTL
- Applied in `computeAndApplyRole()` on user-settings, and `initTeamPage()` on team page
- Nav dropdown shows/hides Team link based on role

---

## 6. Core Feature Flows

### 6.1 Cash Box Lifecycle
1. **Create**: `spendnote-cash-box-settings.html` → `db.cashBoxes.create()` → direct insert or RPC fallback
2. **Edit**: Same page in edit mode → `db.cashBoxes.update()` (currency + id_prefix locked)
3. **Delete**: Confirm dialog → deletes transactions → memberships → cash_box_access → cash box
4. **Reorder**: Drag-and-drop on list page → `sort_order` column update
5. **Settings**: Receipt visibility toggles, receipt label customization (Pro), cash box logo (Pro)

### 6.2 Transaction Lifecycle
1. **Create**: Dashboard modal or mobile page → contact getOrCreate → `spendnote_create_transaction` RPC
   - Receipt limit check (200 in preview mode)
   - Cash box snapshot auto-populated
   - Balance auto-updated via trigger
   - Sequence numbers assigned
2. **View**: Transaction detail page → receipt preview (A4, PDF, email, print-two-copies)
3. **Void**: `spendnote_void_transaction` RPC → creates reversal system transaction → balance corrected
4. **Filtering**: By cash box, date range, type, amount range, contact, created_by, transaction ID
5. **Sorting**: By date, amount, type, ID, cash box, contact, created_by

### 6.3 Contact Lifecycle
1. **Create**: Contact list page or auto-created via `getOrCreate` during transaction
2. **Edit**: Contact detail page
3. **Delete**: Single or bulk delete from list
4. **Snapshot**: Contact details snapshotted on transaction for receipt reproducibility

### 6.4 Team & Invite Flow
1. **Invite**: Owner/Admin → enter email + role → `spendnote_create_invite` RPC → `send-invite-email` Edge Function (Resend API)
2. **Accept**: Invitee signs up with `?inviteToken=` → `spendnote_accept_invite_v2` RPC → org_membership created
3. **Auto-accept**: On login, `spendnote_auto_accept_my_invites` matches pending invites by email
4. **Cash Box Access**: Admins get all cash boxes automatically; Users need explicit `cash_box_memberships` grants
5. **Role Change**: Owner/Admin can change user ↔ admin via dropdown
6. **Remove**: Delete org_membership or revoke pending invite

### 6.5 Account Deletion
1. **Frontend**: DELETE confirmation + 5-second countdown
2. **Edge Function** (`delete-account/index.ts`):
   - Verifies JWT
   - If owner: deletes all owned orgs (cascades to memberships)
   - Deletes auth user via `admin.deleteUser()` → cascades to profiles → cash_boxes → transactions etc.
   - `created_by_user_id` SET NULL, `created_by_user_name` preserved

### 6.6 Receipt System
- **Formats**: A4 PDF, Email HTML, Print Two Copies
- **Customization**: Per-cash-box visibility toggles (logo, addresses, tracking, additional, note, signatures)
- **Labels**: 9 customizable receipt text labels (Pro)
- **Logo**: Account logo + cash box logo with zoom/pan editor
- **Watermark**: Mandatory on dashboard modal preview
- **Session**: Receipt tabs use bootstrap session or postMessage for auth

### 6.7 User Settings
- **Profile**: Full name, company, phone, address, email (read-only)
- **Avatar**: Upload + zoom/pan editor, stored in localStorage + profiles table
- **Receipt Identity**: Display name, other ID, address — role-based editability
- **Account Logo**: Upload + zoom/pan editor — role-based control
- **Password**: Change current password
- **Delete Account**: Role-based warning text + DELETE confirmation + countdown
- **Billing**: Owner-only section (placeholder for Stripe integration)

---

## 7. Edge Functions

| Function | Trigger | Auth | Purpose |
|---|---|---|---|
| `send-invite-email` | Team invite flow | JWT + role check (owner/admin) | Sends invite email via Resend API with rate limiting |
| `delete-account` | User settings | JWT verification | Cascading account/org deletion with service_role key |

---

## 8. Security Measures

| Area | Implementation |
|---|---|
| **RLS** | All tables have Row Level Security enabled with per-user policies |
| **Auth Guard** | All app pages include `auth-guard.js` |
| **Session scope** | sessionStorage (tab-scoped) — no persistent login |
| **JWT verification** | Edge Functions verify caller JWT before any action |
| **Service role** | Only used server-side in Edge Functions, never exposed to client |
| **Rate limiting** | `spendnote_consume_rate_limit` RPC for invite emails (3/target, 12/caller per 10min) |
| **CORS** | Edge Functions return proper CORS headers |
| **Invite tokens** | Hashed with SHA-256 before storage; plaintext never persisted in DB |
| **Immutable fields** | Cash box currency + id_prefix locked via trigger after creation |
| **Error logging** | Client errors logged to `client_error_logs` table; Sentry integration (consent-gated) |
| **Cookie consent** | GDPR-aware banner with strict-mode for EU countries |
| **www redirect** | `www.spendnote.app` → `spendnote.app` canonical redirect |

---

## 9. Org Context & Multi-Org Support

- Users can belong to multiple orgs via `org_memberships`
- Org selection stored per-user in `localStorage` (`spendnote.selectedOrgByUser.v1.<userId>`)
- If multiple memberships and no selection → redirect to org picker on login
- All data queries (cash boxes, transactions, contacts) filter by `org_id`
- Dropdown in nav shows current org name, role, and user identity
- Team link in dropdown visible only for Owner/Admin

---

## 10. Identified Gaps & Recommendations

### 10.1 CRITICAL

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| C1 | **No RLS on `orgs` table in schema.sql** | The `orgs` table policies are managed via migration 025 but not in base schema — risk of drift | Add orgs table + policies to `database/schema.sql` |
| C2 | **`cash_boxes` RLS uses `user_id = auth.uid()`** | In org context, cash boxes belong to org owner's user_id, not the current user — Admin/User access works via `cash_box_memberships` + frontend org_id filter, but RLS itself only checks `user_id` | Consider RLS policies that also check `org_memberships` for org-aware access |
| C3 | **`contacts` RLS uses `user_id = auth.uid()`** | Same issue — contacts created by org owner are only readable by owner via RLS; team members likely rely on org_id filtering at application layer | Add org-aware RLS policies for contacts |
| C4 | **`transactions` RLS uses `user_id = auth.uid()`** | Same pattern — team members can only see transactions where `user_id` matches, which may be the owner's ID | Add org-aware RLS policies for transactions |

### 10.2 HIGH

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| H1 | **No email verification enforcement** | Users can sign up without confirming email; Supabase may or may not have confirmation enabled | Verify Supabase project has email confirmation enabled; add UI feedback for unverified users |
| H2 | **No password strength validation** | Neither signup nor password change enforces complexity rules | Add client-side password strength indicator + minimum requirements |
| H3 | **Cash box delete is client-side cascading** | `db.cashBoxes.delete()` manually deletes transactions → memberships → access → box in sequence — partial failure possible | Move to server-side RPC or rely on DB CASCADE constraints |
| H4 | **No audit trail** | No log of who changed what (role changes, cash box edits, member removal) | Add an `audit_log` table for critical actions |
| H5 | **Void has no role restriction** | Any user with transaction access can void — no confirmation of who voided | Add role check (Owner/Admin) for voiding or at minimum log the voider |
| H6 | **User role can create/delete contacts but schema RLS only allows `user_id = auth.uid()`** | If contacts are created under org owner's ID, the "User" role member won't be able to edit/delete them via RLS | Ensure contacts are created with correct user_id or add org-aware policies |

### 10.3 MEDIUM

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| M1 | **No onboarding flow** | New user lands on empty dashboard with no guidance | Add first-run wizard or empty-state CTAs |
| M2 | **No transaction edit** | Transactions can only be voided, not edited (amount, description, date) | Consider allowing edit for recent/draft transactions, or document this as by-design |
| M3 | **No transaction delete** | `db.transactions.delete()` exists in API but no UI exposes it | Either expose with confirmation or remove the API method |
| M4 | **No export/download** | Transaction history has no CSV/PDF export | Add export functionality |
| M5 | **No search on contacts page** | Contact list loads all contacts with no search/filter | Add search input |
| M6 | **Receipt limit hardcoded to 200** | `PREVIEW_RECEIPT_LIMIT = 200` with localStorage override — no server enforcement | Enforce limit server-side via RPC or RLS |
| M7 | **No cash box archive** | Cash boxes can only be deleted, not archived/deactivated (despite `is_active` column existing) | Expose archive functionality using `is_active` |
| M8 | **Profile email is read-only** | No way to change email address after signup | Add email change flow via Supabase `updateUser()` |
| M9 | **No 2FA/MFA support** | Only email+password authentication | Consider adding TOTP or Supabase MFA |
| M10 | **`team_members` + `cash_box_access` tables are legacy** | Frontend uses `org_memberships` + `cash_box_memberships` but old tables still exist in schema | Remove or mark deprecated; clean up schema.sql |

### 10.4 LOW

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| L1 | **No dark mode** | App only has light theme | Add dark mode CSS variables + toggle |
| L2 | **No i18n** | All strings hardcoded in English | Extract to i18n files if multi-language is planned |
| L3 | **No offline support** | App requires connectivity for all operations | Consider service worker for basic offline read |
| L4 | **No notification system** | No in-app or push notifications (e.g., new team member joined) | Add notification center |
| L5 | **FAQ page has old version** | `spendnote-faq-old.html` still exists | Remove or redirect |
| L6 | **Sentry DSN in client code** | DSN is public (expected) but no environment filtering beyond localhost check | Add environment tag to Sentry init |
| L7 | **No pagination on contact list** | All contacts loaded at once | Add pagination for large contact sets |

---

## 11. Migration History (25 migrations)

| # | Migration | Purpose |
|---|---|---|
| 001 | `add_sequence_numbers` | Sequence numbers for cash boxes and transactions |
| 002 | `transactions_stats_and_indexes` | Stats views and indexes |
| 003 | `sequences_triggers` | Auto-sequence assignment triggers |
| 004 | `void_transactions` | Void status, reason, reversal fields |
| 005 | `update_transactions_stats_for_void` | Stats updated for void support |
| 006 | `atomic_create_transaction_rpc` | `spendnote_create_transaction` RPC |
| 007 | `contacts_stats_rpc` | Contact statistics |
| 008 | `accept_invite_v2_default_cashbox_memberships` | Invite v2 + auto cash box membership |
| 009 | `delete_invite_rpc` | `spendnote_delete_invite` RPC |
| 010 | `client_error_logs` | Client error logging table |
| 011 | `accept_invite_compat` | Backward-compatible invite acceptance |
| 012 | `accept_invite_v2_use_jwt_email` | Use JWT email for invite matching |
| 013 | `auto_accept_invites_by_email` | `spendnote_auto_accept_my_invites` |
| 014 | `fix_invites_status_check` | Fix invite status validation |
| 015 | `accept_invite_ensure_profile` | Ensure profile exists before invite accept |
| 016 | `profiles_read_policy` | Cross-user profile read for team display |
| 017 | `add_receipt_labels_to_cash_boxes` | 9 receipt label columns |
| 018 | `auto_create_default_cash_box` | Auto-create cash box on signup |
| 019 | `transaction_cash_box_snapshots_and_cash_box_identity_lock` | Snapshot columns + immutable identity trigger |
| 020 | `add_profile_avatar_fields` | Avatar URL, settings, color on profiles |
| 021 | `strip_data_url_avatar_from_auth_metadata` | Clean up base64 avatars from auth metadata |
| 022 | `edge_function_rate_limit` | Rate limit table + RPC |
| 023 | `prevent_role_downgrade_on_invite_accept` | Don't downgrade role on re-accept |
| 024 | `preview_profiles_force_pro` | Force pro tier for preview users |
| 025 | `orgs_team_name_rls` | Org table RLS + team name support |

---

## 12. JavaScript Module Map

| Module | Size | Responsibility |
|---|---|---|
| `supabase-config.js` | 3310 lines | Supabase client init, auth helpers, db CRUD API, org context, invite logic, session bootstrap |
| `main.js` | 971 lines | Nav init, consent banner, Sentry, menu colors, numeric text fitting |
| `nav-loader.js` | 431 lines | Shared nav HTML injection, page highlighting, bottom nav, FAB button |
| `auth-guard.js` | 266 lines | Auth redirect, receipt template exceptions, session bootstrap |
| `dashboard-data.js` | 920 lines | Dashboard data loading, transaction table rendering, cash box cards |
| `dashboard-form.js` | 786 lines | Transaction creation form logic, contact autocomplete, receipt URL building |
| `dashboard-modal.js` | (modal UI) | Create transaction modal open/close/animation |
| `dashboard-ui.js` | (UI helpers) | Dashboard UI state management |
| `cash-box-list-data.js` | 493 lines | Cash box list rendering, drag reorder, transaction counts |
| `cash-box-settings-data.js` | 1344 lines | Cash box create/edit form, receipt settings, visibility, labels, logo |
| `transaction-history-data.js` | (paginated list) | Transaction history page with filters, pagination, sort |
| `transaction-detail-data.js` | 517 lines | Transaction detail page data loading, snapshot resolution |
| `transaction-detail-ui.js` | (receipt UI) | Receipt preview, email, print, void actions |
| `user-settings.js` | 1296 lines | Profile, avatar, receipt identity, password, team table, delete account |
| `team-page.js` | 486 lines | Dedicated team page: invite, roles, access, org name |
| `logo-editor.js` | 347 lines | Logo upload/zoom/pan editor component |
| `modal-dialogs.js` | 215 lines | Custom alert/confirm/prompt replacing native dialogs |

---

## 13. Summary

SpendNote is a **cash management SaaS** with receipt generation, team collaboration, and role-based access. The application is functionally complete for its core workflows (cash boxes, transactions, contacts, receipts, team management, account lifecycle). The main areas needing attention are:

1. **RLS policy gaps** for org-aware multi-user access (Critical)
2. **Missing server-side enforcement** for receipt limits and cash box deletion (High)
3. **No onboarding, export, or transaction editing** (Medium UX gaps)
4. **Billing/subscription integration** not yet built (excluded from this audit)

The codebase is well-structured with clear separation between data, UI, and auth layers. The migration history shows systematic evolution. The Edge Functions are properly secured with JWT verification and rate limiting.
