# SpendNote (demo)

SpendNote is a **cash box + transaction + contacts** web app.

- Frontend: **static HTML/CSS/JavaScript** (no framework)
- Backend: **Supabase** (Auth + Postgres + RLS)

This repository is meant to be deployable as a static site (e.g. Vercel).

## Current status (2026-02-26 late evening — logo baseline + OAuth + mobile currency fixes validated)

### User Settings logo + mobile transaction currency fixes (2026-02-26)

- **Receipt logo baseline persistence fixed (User Settings):**
  - `assets/js/logo-editor.js`: baseline lifecycle hardened so saved logo appearance becomes the new 100% baseline on reload.
  - `assets/js/user-settings.js`: baseline UI reset enforced after load/save, with stale localStorage transform overrides neutralized.
  - Result: no post-save jump back to old zoom state (e.g. 280%); persisted logo appears consistently in receipt previews.
- **Google OAuth flow validated in production usage:**
  - Login/signup Google flow is functioning correctly with redirect handling and invite-token handoff path.
  - Login flow now also explicitly requests account chooser (`prompt=select_account`) for safer account selection consistency.
  - Added `GOOGLE-OAUTH-PROD-CHECKLIST.md` to close remaining provider/dashboard-side production checks.
  - Current remaining work is checklist-level operational verification only (provider dashboard consistency + account-linking policy confirmation).
- **Mobile new-transaction currency symbol regression fixed:**
  - `assets/js/dashboard-modal.js`: `applyModalCurrencyUi` exposed on `window` for standalone mobile page reuse.
  - `spendnote-new-transaction.html`: explicit currency UI refresh runs on cash box change and after preset line-item injection.
  - Result: main amount prefix, line items, and total now follow the selected cash box currency (e.g. Ft / € / $) instead of sticking to `$`.
- **Stripe pre-go-live checklist prepared:**
  - Added `STRIPE-GO-LIVE-CHECKLIST.md` with secret mapping, webhook event wiring, and end-to-end billing validation script.
- **Receipt preview/company placeholder leakage fix (all receipt templates):**
  - Removed hardcoded `Acme Corporation` fallback for `demoCompany` in print/PDF/email templates.
  - Cash box settings preview now shows `—` when company name is missing instead of synthetic placeholder organization text.

## Current status (2026-02-25 evening — receipt FROM/TO fix + Account Settings regression fixed)

### Receipt FROM/TO swap + Account Settings fix (2026-02-25 evening)

- **Receipt FROM/TO direction fix (all 3 templates):**
  - `spendnote-receipt-print-two-copies.html`, `spendnote-pdf-receipt.html`, `spendnote-email-receipt.html` corrected.
  - IN transactions: contact = FROM (sender), company = TO (receiver).
  - OUT transactions: company = FROM (sender), contact = TO (receiver).
  - `isIncome` boolean drives conditional `fromName`/`toName`/`fromAddress`/`toAddress`/`fromOtherId`/`toOtherId` assignment.
- **Onboarding wizard Other ID persistence bugfix:**
  - `spendnote-welcome.html` (existing wizard): `receiptOtherId` field was not being saved. Fixed — now persisted as `phone` in profile on setup completion.
- **Cash box settings preview — live profile data:**
  - `spendnote-cash-box-settings.html`: receipt preview now loads real DB profile instead of `DUMMY_PROFILE` placeholder.
  - `demoCompanyId` URL param now populated from `profile.phone`.
- **Account Settings regression fix (root cause: `setAvatarStorageUserId` undefined):**
  - `user-settings.js`: removed calls to non-existent `setAvatarStorageUserId()` which caused a silent `ReferenceError` crashing the entire `initUserSettingsPage` init.
  - Result: Full Name, Email, Display Name, Address, logo all load correctly again.
- **Logo editor preview fix:**
  - Preview box now always shows logo at `scale(1)` — no overflow outside container.
  - Zoom % label still reflects the actual saved zoom value.
  - Zoom/drag settings only affect receipt rendering, not the settings page preview.

## Current status (2026-02-25 — all high-priority audit items shipped)

### Email verification + password policy + audit log (2026-02-25)

- **Email verification enforce (AUDIT-H1):**
  - `auth-guard.js` now checks `email_confirmed_at` on session; unconfirmed users are signed out and redirected to login with resend UI.
  - Login page auto-shows resend confirmation UI when `?emailUnconfirmed=1` is present.
- **Password strength policy (AUDIT-H2):**
  - Shared `window.SpendNotePasswordPolicy` in `supabase-config.js` (min 8 chars, uppercase, lowercase, number/symbol).
  - Applied consistently on signup, reset-password, and user settings password change.
- **Audit log (AUDIT-H4):**
  - New migration: `supabase-migrations/028_audit_log.sql`.
  - `audit_log` table with owner-only RLS read access.
  - `spendnote_void_transaction` and `spendnote_delete_cash_box` RPCs now write audit entries.
  - `org_memberships` trigger logs role changes and member removals.
  - Frontend API: `window.auditLog.getEntries(orgId)` for owner-only audit log reading.

### Dead code cleanup (2026-02-25)

- **M2/M3 rejected by design:** Transaction edit/delete not supported — only void. Removed dead `transactions.delete()` method and legacy cascade delete fallback from `cashBoxes.delete()`.
- **M7 rejected:** Cash box archiving will not be implemented. Dropped `is_active` column from DB (`029_drop_is_active_and_dead_code_cleanup.sql`), schema, docs, and seed data.

### Security audit remediation round 1 (2026-02-25)

- **Org-aware RLS policies deployed (AUDIT-C1/C2/C3/C4):**
  - `cash_boxes`, `contacts`, `transactions` tables now enforce access via `org_memberships` (not just `user_id = auth.uid()`).
  - New migration: `supabase-migrations/026_org_security_and_atomic_delete.sql`.
  - Canonical `database/schema.sql` updated with org tables, `org_id` columns, and org-aware policies.
- **Atomic cash box delete RPC (AUDIT-H3):**
  - `spendnote_delete_cash_box` replaces multi-step client-side delete with a single atomic server-side RPC.
  - Auth check uses `org_memberships` owner/admin model.
- **Void transaction auth hardened (AUDIT-H5):**
  - `spendnote_void_transaction` RPC now checks `org_memberships` for owner/admin role.
  - Frontend void button role check updated to use `orgMemberships.getMyRole()`.
- **Contact CRUD consistency (AUDIT-H6):**
  - Contact create/getOrCreate now sets `user_id` to the authenticated user consistently.
  - Frontend org-scope filtering added to contacts and transactions queries.
- **Legacy DB cleanup (AUDIT-M10):**
  - New migration: `supabase-migrations/027_deprecate_legacy_team_tables.sql`.
  - `cash_box_access` data migrated to `cash_box_memberships`; legacy tables (`team_members`, `cash_box_access`) dropped.
  - `database/schema.sql`, `database/README.md`, `database/SCHEMA-DOCUMENTATION.md` updated to canonical org model.
  - Frontend legacy `cash_box_access` cleanup code removed from `supabase-config.js`.
  - `delete-account` Edge Function comments updated to reflect canonical tables.
- **Legacy FAQ cleanup (AUDIT-L5):**
  - `spendnote-faq-old.html` deleted; 301 redirects added in `_redirects`.

### Previous auth + account lifecycle progress (2026-02-25)

- **Password reset flow** fully operational end-to-end.
- **User dropdown org-context** reliability + compact UX shipped.
- **Account deletion** feature shipped (Edge Function + frontend + deploy).
- **Transaction history** created-by filter supports deleted users.

### Latest team/org context progress (2026-02-24)

- Team Name is now handled as a DB-backed org field (`orgs.name`) for org context display.
- Team page now includes Team Name management UI for owner/admin users.
- Login org selection and nav org-context header were aligned to show human-readable Team Name.
- Dropdown UI was cleaned up (user name + role + `Team: <name>`), and cache-version sync was rolled out across pages.
- Added migration for orgs RLS (`supabase-migrations/025_orgs_team_name_rls.sql`) to allow org members to read org row and owner/admin to update Team Name.

### Team management scope status (important)

- Team management is **not closed yet**.
- Remaining mandatory scope:
  - Admin vs User registration flow completion (role-based onboarding/entry path)
  - Role-based Settings completion for admin/user separation
  - Final end-to-end team flow closure after these are implemented

### Latest landing performance progress (2026-02-24, mobile Lighthouse)

- Landing page mobile performance optimization started with an LCP/CLS-focused pass.
- Implemented:
  - async/deferred loading pattern for Google Fonts and Font Awesome,
  - hero screenshot layout reservation (`aspect-ratio`) + explicit image dimensions,
  - high-priority loading for the first hero screenshot,
  - responsive compressed hero image variants (`960w`/`1280w`) and `srcset` delivery.
- Measured mobile Lighthouse improvement after rollout:
  - Performance: **55 -> 77**
  - LCP: **~6.0s -> ~4.1s**
  - CLS stabilized around **0.067**
- Remaining known work for further gains:
  - additional render-blocking reduction,
  - unused CSS/JS trimming,
  - contrast/accessibility fixes on pricing CTA blocks.

### Completed in the latest release-polish cycle

- **Standalone New Transaction duplicate prefill fixed (mobile page):**
  - Duplicate now pre-fills cash box, direction, amount, description, contact fields, note, and line items.
- **New Transaction mobile shift fixed:**
  - Footer positioning stabilized to prevent horizontal movement/jitter.
- **User Settings layout regression fixed:**
  - Content width now matches shared nav/footer container on large screens.
- **Landing mobile feature cards improved:**
  - Icon footprint reduced for better card proportions.
- **Privacy page mobile overflow fixed:**
  - Table/cell wrapping and width behavior hardened.
- **Privacy content cleanup:**
  - Contact emails unified to `legal@spendnote.app`.
  - "Contact form" row removed from section 11.
- **Footer consistency pass (global):**
  - Duplicate copyright symbol issue fixed.
  - Desktop link alignment corrected.
  - Footer logo + tagline normalized between marketing and internal pages.

### State right now

- Dashboard and mobile view are **UI-complete**.
- Core functional flows are **stable** in continuous manual testing.
- App is in a **go-live capable** state.
- Preview usage cap is now **technically enforced** at 200 transactions during preview.
- Public SEO copy is now **aligned and consistent** on billing/refund wording and key landing/SEO trust lines.
- SEO go-live + copy follow-up is **fully closed** in this cycle.
- P0 backend/Edge error visibility first pass is **implemented** for critical invite + receipt-email flows.

### Latest app-internal hardening update (2026-02-23)

- **P0/1 backend error visibility delivered** (invite + receipt email paths):
  - Added shared backend error helpers in `supabase-config.js`:
    - response/request reference extraction (`x-request-id` / `x-supabase-request-id` / `cf-ray`),
    - normalized fetch error parsing,
    - standardized user message builder,
    - structured backend logging + Sentry capture.
  - Team invite flow now logs RPC and Edge email send errors with context and reference IDs.
  - Transaction Detail receipt email send now uses the same shared error pipeline.
  - Transaction Detail JS cache-bust bumped so clients load latest error handling immediately.
- **P0/2 formal smoke checklist documented**:
  - new release checklist file: `SMOKE_CHECKLIST.md`,
  - includes pass/fail checks for auth, create transaction, print/PDF/email receipt, and invite flow.
- **P0/3 Cloudflare abuse/WAF baseline completed (within current Free plan limits)**:
  - Cloudflare managed ruleset active,
  - Security Events show managed-rule blocks,
  - challenge passage configured (30 min),
  - Bot Fight Mode is ON,
  - one active rate-limit rule is in place (`RL-HighRisk-Paths`, Block),
  - note: additional endpoint-specific rate-limit rules are constrained by current Free-plan rule limits.
- **P0+ backend throttling hardening (invite path) delivered**:
  - new migration: `supabase-migrations/022_edge_function_rate_limit.sql`,
  - added DB-backed rate-limit primitive `spendnote_consume_rate_limit(...)`,
  - `send-invite-email` edge function now enforces per-caller and per-target limits and returns `429` + `Retry-After`.
- **Team/org context hardening delivered (Pro multi-org safety)**:
  - selected org context introduced in `supabase-config.js` (`SpendNoteOrgContext`),
  - Pro users with multiple org memberships must choose org at login when no selected org is set,
  - app pages redirect back to login when org selection is required,
  - org switch is intentionally disabled inside app (switch via Log out -> Log in only),
  - dashboard now shows active org+role informational indicator for Pro multi-org context.
- **Invite role safety hardening delivered**:
  - new migration: `supabase-migrations/023_prevent_role_downgrade_on_invite_accept.sql`,
  - invite accept flows now prevent owner/admin role downgrade when lower-role invite is accepted in the same org.

### Latest SEO/copy follow-up (2026-02-23)

- **Billing FAQ wording clarified** to remove ambiguity:
  - cancellation stops renewal but paid access remains until period end,
  - refund terms are separate,
  - no prorated refund outside the 30-day guarantee window.
- **Billing FAQ layout regression fixed** (`spendnote-faq.html` card markup corrected).
- **Landing reassurance copy updated**:
  - "Designed for speed: one form → PDF → done." → "Űrlap, nyomtat, kész."
- **Cash handoff SEO hero copy softened**:
  - "Clear accountability for every handoff." → "Clear record for every handoff."
- **Search Console follow-up completed**:
  - modified indexable pages re-submitted for indexing.

### Next major scope (deep round, estimate: ~6-8 weeks)

- Deep SEO + FAQ overhaul
  - intent-focused content quality, structural cleanup, stronger internal linking, schema quality pass.
- Onboarding redesign + implementation
  - guided post-signup flow, role-based paths, completion-state UX.
- Registration wizard (multi-step signup)
  - progress states, better validation UX, clearer error handling.
- Confirmation/transactional email system
  - trigger matrix, templates, delivery logic, and delivery validation.
- Full Team management redesign
  - role model, invite lifecycle, cash-box access model, and edge-case handling.
- Billing/subscription alignment with the new team + onboarding model.

### Completed operational baseline

- Cloudflare monitoring baseline configured (Web Analytics + Health Check alerts).
- Sentry frontend error tracking configured and validated with test issue.
- Google Search Console baseline configured:
  - domain property active,
  - sitemap submitted successfully,
  - indexing requests sent for `/` and `/faq`.
- SEO go-live hardening completed (2026-02-22):
  - indexable public set aligned to 4 pages: `/`, `/faq`, `/petty-cash-receipt-generator`, `/cash-handoff-receipt`.
  - `petty-cash-receipt-generator.html` and `cash-handoff-receipt.html` refined with schema improvements, image SEO, and cross-linking.
  - homepage + FAQ metadata cleanup completed (valid OG/Twitter image URLs and valid Organization logo URL).
  - verified no fake rating schema on public SEO pages (no `aggregateRating` / `ratingValue` blocks).
  - sitemap reduced to only currently indexable public pages and re-submitted (`https://spendnote.app/sitemap.xml`).
  - indexing requests sent for all 4 public indexable pages.
- SEO/copy follow-up completed (2026-02-23):
  - billing/refund copy consistency pass completed on FAQ + Pricing,
  - minor landing + cash handoff SEO copy improvements merged,
  - new indexing requests submitted after copy updates.
- Preview receipt cap enforcement configured:
  - create-time check blocks new transactions after 200 active receipts,
  - clear UI message shown on limit reached,
  - cache-busted script references for `supabase-config.js` and `dashboard-form.js` on main create flows.

## Near-term execution plan (next sessions)

1. **Security audit — all high-priority items are now complete (C1–C4, H1–H6).**
2. Onboarding + registration wizard specification and implementation prep.
3. Team/org/invite model alignment (DB-TEAM-1) and role-based settings plan.
4. Billing/subscription + Stripe prep alignment with the team/onboarding model.
5. Keep weekly 5-minute operational checks running:
   - Sentry issues,
   - Search Console indexing status (`/`, `/faq`, `/petty-cash-receipt-generator`, `/cash-handoff-receipt`),
   - Cloudflare analytics + alerts,
   - core smoke (login + new transaction + receipt).

## Recent engineering updates (2026-02-19 — modal header alignment fix)

- **Modal header alignment fix (CSS root cause + cleanup):**
  - Fixed 4px vertical misalignment between IN/OUT direction buttons and cash box selector in the create transaction modal.
  - **Root cause:** `.modal-header` used `display: grid` with two wrapper divs (`.modal-header-left`, `.modal-header-right`) that created different vertical centering contexts for each side.
  - **Fix:** Changed `.modal-header` to `display: flex; align-items: center; height: 72px; gap: 12px`. Removed wrapper divs from HTML — all items (direction buttons, cashbox, watermark, close) are now direct flex children.
  - **Cleanup (104 lines removed):**
    - Removed `!important` override block at end of `dashboard.css`
    - Removed inline `<style>` block from `dashboard.html` `<head>`
    - Removed inline `style` attributes from modal header elements
    - Removed unused `.modal-header-left` / `.modal-header-right` CSS rules
    - Added `margin-right: auto` to `.modal-direction-primary` for left/right separation
  - JS safety net retained in `dashboard-modal.js` (`requestAnimationFrame` + `translateY` correction if >0.5px offset detected — currently inactive since CSS fix is sufficient).
  - Watermark remains visible and correctly positioned.
  - **Commits:** `50dd264`, `2b9c085`, `e33a9b7`, `f053d9d`, `fd994ef`, `5fbae35`, `4026544`

## Recent engineering updates (2026-02-18 — mobile redesign)

- **Full mobile redesign ("profi app" feel):**
  - **Bottom navigation bar** — replaces hamburger menu on mobile; 5 tabs: Home, Transactions, + FAB, Contacts, Cash Boxes. Frosted glass, safe-area padding, active dot indicator. Injected via `nav-loader.js` so it appears on every app page automatically.
  - **Transaction card list** — dashboard and transaction history now render a `.tx-card` list alongside the table; on mobile the table is hidden and cards are shown. JS renderers (`dashboard-data.js`, `transaction-history-data.js`) generate both views simultaneously.
  - **Contact card list** — contact list shows avatar initials (green gradient circle) + name + tx count on mobile instead of the table.
  - **Modal bottom sheet** — create transaction modal slides up from the bottom on mobile; sticky header + scrollable body + sticky footer with save button; inputs forced to `font-size: 16px` to prevent iOS zoom.
  - **Transaction detail** — amount displayed as large hero number (36px, centered); action buttons in 2×2 grid; Pro Options collapsed by default on mobile.
  - **Shared card CSS** — `.tx-card-*` styles moved from `dashboard.css` to `app-layout.css` so all pages inherit them. `app-layout.css` bumped to `v15` across all HTML files.
  - **Commits:** `2ee902e`, `3b072d6`, `b7818bb`, `ae03f59`, `48c8310`, `1651f59`, `f2e6f11`

- **Transaction Detail 400 error fix:**
  - `transactionsJoinSupported` defaulted to `false` — plain fetch + enrich path used always, avoiding joined query 400 errors.
  - `supabase-config.js` broadened error detection for joined select failures.
  - Cache-bust on `spendnote-transaction-detail.html` to force latest JS.

## Recent engineering updates (2026-02-18 — cash box & receipt fixes)

- **Cash Box Settings logo persistence compatibility (schema-safe):**
  - Fixed save flow so Cash Box Settings no longer fails when DB schema is missing `cash_box_logo_url`.
  - Added local fallback logo persistence key per cash box: `spendnote.cashBox.{id}.logo.v1`.
  - On load, logo preview now resolves from DB logo first, then local fallback.
  - Compatibility retry now treats missing `cash_box_logo_url` as a non-fatal schema capability downgrade (instead of hard error).
- **Production hotfix:**
  - Fixed `ReferenceError: cashBoxId is not defined` in Cash Box Settings loader by using the function argument `id` consistently.
- **Receipt date format normalization (US):**
  - Unified receipt date display to US format (`MM/DD/YYYY`) across A4, PDF, Email templates and related demo/preview paths.
  - Updated receipt cache-busting params in receipt URL builders to ensure latest templates are loaded immediately online.
- **Cash Box Settings UI cleanup:**
  - Removed the "Quick preset: Logo, addresses, line items, total, signatures" helper block from Cash Box Settings page.
- **Commits (this thread):**
  - `92e9e01` Fix cash box logo save compatibility fallback
  - `ae8c41d` Fix cash box settings load ReferenceError
  - `fa68a3d` Use US date format on receipt templates
  - `38bebed` Remove quick preset summary from cash box settings

## Recent engineering updates (2026-02-16)

- **Receipt logo stabilization (User Settings):**
  - `LogoEditor` now initializes immediately on `DOMContentLoaded` (no DB wait), so upload controls are always usable.
  - Prevented delayed profile sync from overwriting a freshly uploaded logo (`hasUserEdited` guard).
  - Added snapshot debounce to reduce rapid DB writes and improve stability.
  - File input is reset on click/change, so re-uploading the same image works reliably.
  - Cache-bust versions updated in `spendnote-user-settings.html` for `logo-editor.js` and `user-settings.js`.
- **Receipt logo size tuning by channel:**
  - **Print:** unchanged (kept as baseline).
  - **PDF:** logo reduced to `160x80` for better balance.
  - **Email:** logo increased to `240x120` for better visibility.

## Recent engineering updates (2026-02-15)

- **Marketing polish & SEO:**
  - **FAQ Page Redesign:** Complete rewrite with modern card-based grid layout, central search, category tabs, and expanded content (downgrade/refund/support questions).
  - **SEO Optimization:** Added `meta` tags, Open Graph tags, Canonical URLs, and JSON-LD Structured Data (`SoftwareApplication`, `Product`, `FAQPage`) to `index.html`, `spendnote-pricing.html`, and `spendnote-faq.html`.
  - **Sitemap:** Generated `sitemap.xml` for public pages.
  - **SEO Landing Pages:** 6 intent pages created (template, generator, handoff, receipt book, small business, carbonless). Copy/layouts are done; only final refinements remain.
- **UX / Onboarding:**
  - **Auto-create Cash Box:** New users now automatically get a default "Main Cash Box" (USD) upon signup via a new database trigger (`018_auto_create_default_cash_box.sql`).
- **Fixes:**
  - Corrected `h2` -> `h1` hierarchy on Pricing page.
  - Updated FAQ content to clearer tax/accounting wording based on feedback.

## Recent engineering updates (2026-02-13)

- Cloudflare Pages cutover fixes (production stability):
  - Fixed `ERR_TOO_MANY_REDIRECTS` on clean routes like `/dashboard` caused by Cloudflare Pages **Clean URLs** interacting with `_redirects`.
  - Canonical host enforced (`www.spendnote.app` → `spendnote.app`) to avoid Supabase `sessionStorage` origin split during auth flows.
  - Logout now always returns to the landing page (`index.html`) and is compatible with `auth-guard.js` (guard respects an explicit logout intent).
  - Caching: `_headers` keeps long-lived caching for `/assets/*`, but excludes critical auth/nav scripts from immutable caching:
    - `assets/js/nav-loader.js`
    - `assets/js/auth-guard.js`
    - `assets/js/supabase-config.js`

## Recent engineering updates (2026-02-13 PM hotfixes)

- Invites / team management (production fixes):
  - Fixed DB constraint: `invites_status_check` now allows `pending|active|accepted|expired|cancelled`.
  - Added RLS policies for `profiles` so org members can read each other’s minimal profile (name/email). Team table now shows invited member details.
  - Frontend hardening:
    - `teamMembers.getAll()` fetches `profiles` separately and falls back to the accepted invite’s email when a profile is missing.
    - Signup page “Log in” link preserves `inviteToken`/`invitedEmail` when navigating to Login.
    - Added auto-accept-by-email fallback: if token-based accept fails or there is no token, attempt accept by the authenticated user’s email.
    - Cache-bust updated for `assets/js/supabase-config.js` across app pages.
- Deliverability:
  - Resend domain verified for `spendnote.app`.
  - Edge Function `send-invite-email` updated with `reply_to` and personalized subject (deploy pending).
- SQL migrations added:
  - `014_fix_invites_status_check.sql`
  - `015_accept_invite_ensure_profile.sql` (applied + verified)
  - `016_profiles_read_policy.sql` (applied)
- Follow-ups:
  - Optional one-time backfill only if legacy org members without `profiles` rows are found.
  - Deploy updated `send-invite-email`; monitor inbox placement for 48h; trim invite debug logs afterwards.

## Planned for next session (preview prep)

- Landing/public preview:
  - Landing polish before indexing (copy + CTA + preview message + trust/legal links).
  - Add preview/beta disclaimer UX on landing + signup (explicit acceptance on signup).
  - Show contact email on the landing (footer + clear `mailto:` link) for inbound questions.
  - Build 2 indexable SEO pages:
    - `petty-cash-log-software` intent page (angle: replace handwritten/duplicate receipt book with searchable digital cash handoff receipts; US keywords: "receipt book", "duplicate receipt book", "carbonless receipt book")
    - `cash-handoff-receipt-app` intent page
  - Create a demo account with typical US cash boxes, addresses, and transactions so we can capture screenshots for SEO pages + landing.
  - Populate the demo account in Supabase tables so it is usable for screenshots/videos.
- Data & onboarding:
  - Verify and fix the auto-create Cash Box migration (`018_auto_create_default_cash_box.sql`) and any related code changes (Sonnet edits were incorrect).
- SEO/Indexing rollout:
  - Keep `noindex` while landing is being finalized.
  - During beta: enable indexing for landing + the 2 SEO pages only; internal/app pages remain `noindex`.
- Analytics:
  - Add GA4 baseline on landing (`page_view` + signup CTA click event).
  - Connect Google Search Console and verify indexing/sitemap flow.

- Beta/Launch timeline (working plan):
  - Beta/preview: ships in the next few days.
  - Launch target: ~6 weeks (pricing + company setup + Stripe, mobile view, final polish).
  - Onboarding: after signup/first valid session, auto-create a default USD Cash Box (starting balance: 0) so the first receipt can be created in ~30 seconds.

## Recent engineering updates (2026-02-11)

- Auth (launch readiness):
  - Signup now supports email-confirm flows via `auth.signUp(..., { emailRedirectTo })`.
  - Signup shows a clear **"check your email"** state when Supabase returns no session.
  - Login detects unconfirmed-email errors and offers **Resend confirmation email**.
  - New helper: `auth.resendSignupConfirmation(email, { emailRedirectTo })`.
  - Google OAuth redirects preserve `inviteToken` in the redirect URL.
  - Supabase Dashboard action (manual): **Confirm sign up / email confirmation was enabled**.
  - Remaining (manual): configure Supabase **URL Configuration** (Site URL + Additional Redirect URLs).

- Invites / team management:
  - Added a new invite accept RPC: `spendnote_accept_invite_v2(p_token text)`.
    - On accept, creates/updates `org_memberships` and assigns default `cash_box_memberships`:
      - `admin`: all cash boxes in the org
      - `user`: first cash box in the org
    - Note: if invite acceptance still stays `pending`, ensure the function is deployed with `SET row_security = off` (RLS-safe).
  - Pending invite tokens are persisted to localStorage and auto-accepted on the first valid session:
    - Key: `spendnote.inviteToken.pending`
    - Auto-retry uses v2 with fallback to v1.
  - Team Members list dedupes pending invites by email when an active org member exists.
  - Pending invite revoke was changed to **hard delete** (instead of soft-revoke):
    - Implemented via `SECURITY DEFINER` RPC `spendnote_delete_invite(p_invite_id uuid)` due to RLS.

- Cache-busting:
  - `supabase-config.js?v=` was bumped across pages multiple times to ensure new auth/team/invite logic is actually loaded after deploy.

- Contacts list UX:
  - Contacts list row open uses **2 clicks** (armed row) to open Contact Detail (matches transaction tables).

## Recent engineering updates (2026-02-08)

- **Branded modal dialogs** replace all native `alert()`/`confirm()`/`prompt()` calls:
  - `assets/js/modal-dialogs.js` exposes Promise-based `showAlert`, `showConfirm`, `showPrompt` on `window`.
  - ~90+ native dialog calls replaced across 10 JS files and 7 HTML files.
  - Styled with the app's CSS variables; destructive actions use red danger buttons.
- Canonical query params are now enforced app-wide:
  - Cash Box: `cashBoxId`
  - Contact: `contactId`
  - Transaction: `txId`
  - Legacy `id=` fallbacks were removed.
- UUID validation was centralized to `window.SpendNoteIds.isUuid` (removed scattered regex fallbacks).
- Cache-busting was standardized across pages for critical JS/CSS assets (immutable deploy caching).
- Dashboard:
  - Latest Transactions table was unified to the same table-style rendering as other transaction tables.
  - VOID is shown consistently (pill + struck-through amount).
  - Latest Transactions shows the newest 5 only (no pagination), and avoids embedded joins to prevent schema-cache relationship errors.
  - Hover tooltips added for long text (Description / Cash Box / Contact).
- Modal: reduced first-open layout shift/flicker via scrollbar compensation.
- Row open UX: transaction tables require 2 clicks to open detail (with an armed-row state) to prevent accidental navigation.

## Launch roadmap (ordered checklist)

- [x] **DEC-L1** Decide onboarding structure (chosen: 1=A, 2=B)
  - Signup success: in-page vs new `spendnote-welcome.html`
  - Next steps: success only vs success + dismissable dashboard panel
- [x] **DEC-TRIAL** Trial without card upfront (decision): **14 days OR 20 transactions** (whichever comes first). At limit: **view-only**, **no export**. Invites: **Pro only**.
- [ ] **P0** Production-ready acceptance criteria (baseline)
  - [ ] Client error tracking (e.g. Sentry)
  - [ ] Edge Function logging + surfacing non-2xx errors clearly
  - [ ] Smoke test checklist: auth, create transaction, receipt email, receipt PDF
  - [ ] Abuse protection: basic rate limiting on email/invite endpoints
  - [ ] Cloudflare baseline protection: bot/WAF rules (minimal, safe defaults)
- [x] **L1a** Onboarding UI (core): registration success state + post-login next steps — **done** (`spendnote-welcome.html`)
- [ ] **L2** Email pack (4 only): define copy + triggers + recipients (Welcome/Account created; Email confirmation; You’ve been invited; Invite accepted/user activated → admin)
- [ ] **L3** Email delivery implementation: Resend + Edge Functions/hooks + templates
- [x] **L4** Role-based Settings UI: Owner/Admin vs User (hide non-owned sections) — **done** (`user-settings` + `team` role-based visibility/disable)
- [x] **L5** Access control UX: user sees only assigned cash boxes; admin can assign/revoke cash box access in UI — **done** (`spendnote-team.html` cash box grant/revoke + user scope filtering)
- [x] **M1** Mobile strategy + responsive MVP — **done** (bottom nav, card lists, modal bottom sheet, tx detail 2×2 grid)
- [x] **S1** Subscription rules spec — **done** (`S1-SPEC.md`)
- [x] **S2** Stripe prep (ready to plug in): subscription state data model + feature flags + UI placeholders + webhook handling plan — done (`031_profiles_billing_state_and_preview_tier.sql`, `SpendNoteBilling`, User Settings billing summary)
- [x] **S2b** Server-side create enforcement guard — **done** (`032_spendnote_create_transaction_preview_server_guard.sql`; `spendnote_create_transaction` RPC preview-cap guard)
- [x] **DEPLOY-1** Migration plan: move from Vercel/demo domain to Cloudflare on `spendnote.app` (hosting target, caching rules)
- [x] **DEPLOY-2** Cloudflare DNS + SSL + redirects: decide canonical host (`spendnote.app` vs `www`), configure 301s and safe HSTS
- [x] **DEPLOY-3** Supabase for new domain: update Site URL + allowed redirect URLs; test login/signup/invite flows on `spendnote.app`
- [x] **DEPLOY-4** Cutover rehearsal + go-live checklist: staging URL, smoke tests, rollback plan
- [ ] **S3** Stripe integration: checkout, customer portal, webhooks, live mode rollout + enforcement activation — **skeleton in place** (`create-checkout-session`, `create-portal-session`, `stripe-webhook`), production secrets/live test pending (runtime E2E still pending)
- [ ] **O1** Google OAuth: signup/login UI flow wired (Google buttons + Supabase OAuth redirect), pending Supabase provider credentials + redirect whitelist + account-linking policy hardening
- [ ] **MKT-1** Market scan + positioning: direct/adjacent alternatives + SpendNote differentiation + keyword list
- [ ] **MKT-2** SEO content plan: 3 landing pages (petty cash misspellings/alternatives) + “cash handoff receipt” positioning + CTA alignment to onboarding (L1/L2)
- [ ] **CLEAN-1** Codebase cleanup pass: remove unused/dead code, dedupe helpers, normalize versioned assets, performance + reliability polish
- [ ] **P3-1** Polish: Landing/FAQ/Terms refinements + edge cases + final UX consistency pass

### Weekly cadence (time budget)

- **Mon–Thu:** evenings only (2–3 hours when possible; not every day)
- **Fri–Sun:** long-form sprint blocks (as much as sustainable)

### 5-week launch schedule (milestones)

- **Week 1:** DEC-TRIAL, L1 + L2, start L3 (Resend + skeleton sending), start MKT-1
- **Week 2:** finish L3, L4, L5, MKT-2 (SEO outlines + keyword landing structure)
- **Week 3:** S1, S2, Mobile sprint #1 (Create Transaction + Receipt mobile-usable)
- **Week 4:** Mobile sprint #2 (History + Contacts + filters), start Cloudflare migration work (DEPLOY-1/2/3)
- **Week 5:** Cloudflare cutover (DEPLOY-4) + Stripe integration (S3) + stabilization + cleanup (CLEAN-1) + polish (P3-1)

### Google Search starter keywords (USA, long-tail, ~$300/mo)

- **Match types:** Phrase + Exact only (no Broad for first 4–6 weeks)
- **Ad groups:**
  - **A:** Petty cash log / tracking (core buyer intent)
  - **B:** Cash handoff / cash handling log (buyer intent)
  - **C:** Receipt log / cash receipt app (buyer intent)
  - **D (optional):** Template alternative (separate ad group/campaign with lower bid)

**Ad group A (Exact):** `[petty cash log app]`, `[petty cash tracking software]`, `[petty cash management software]`, `[petty cash log software]`  
**Ad group A (Phrase):** "petty cash log", "petty cash tracking", "petty cash software", "petty cash management", "petty cash online", "online petty cash log", "petty cash log online"  
**Ad group B (Exact):** `[cash handoff receipt]`, `[cash handling log]`, `[cash transfer log]`, `[cash handoff log]`  
**Ad group B (Phrase):** "cash handoff", "cash handover", "cash handling log", "cash transfer receipt"  
**Ad group C (Exact):** `[cash receipt app]`, `[cash receipt log]`, `[receipt log app]`, `[digital cash receipt]`  
**Ad group C (Phrase):** "cash receipt log", "digital receipt for cash", "replace handwritten receipts"  
**Ad group D (Phrase):** "petty cash template alternative", "petty cash spreadsheet alternative", "cash receipt template alternative"

**Negative keywords (campaign-level starter list):** `free`, `template`, `printable`, `pdf`, `word`, `doc`, `excel`, `spreadsheet`, `download`, `form`, `fillable`, `sample`, `example`, `blank`, `worksheet`, `canva`

### SEO: “Template → Tool” bridge (lead magnet)

- **Goal:** template-search users get the download they want, then a soft bridge to the app (warm user, not a sales CTA)
- **Minimal page pattern:**
  - Downloadable PDF / Google Sheet template
  - 1-line bridge under download (soft link, not a button):
    - `If you want this automatically generated and stored, this is the tool we use.`
  - Link to SpendNote with UTM tags (e.g. `utm_source=template&utm_medium=download&utm_campaign=petty_cash_log`)
  - Optional: 1 screenshot/GIF of the tool right below the bridge + “No card required.”

### Admin-side “invite pressure” (workflow nudge, not referral)

- **Intent:** this is not a referral program (no rewards/discounts). It’s a workflow reality nudge for B2B teams.
- **Example trigger:** after an admin creates a receipt/transaction, show a small note:
  - `This usually works better if the other person is also here.`
  - Then offer a one-click path to invite/add the other person.

- Supabase permissions model implemented:
  - Org/team model: `orgs` + `org_memberships` (roles: `owner`/`admin`/`user`).
  - Cash box access: `cash_box_memberships` (enforced by RLS).
  - Contacts: org-scoped (shared across the org).
  - Invites: token/link flow via `invites` + RPCs; frontend accepts `inviteToken` on login/signup.
  - Frontend data layer removed client-side `user_id` filters and relies on RLS.

## Permissions model (implemented)

- Multi-location (e.g. multiple restaurants) is handled as **multiple orgs** (team accounts).
- Contacts are **org-level** (shared across cash boxes in the org).
- Roles:
  - `owner`: subscription + account/org delete + cash box delete
  - `admin`: create cash boxes, invite/add users, void transactions
  - `user`: can record only in cash boxes they have access to
- Access enforcement:
  - Cash box access is enforced via `cash_box_memberships`.
  - Admins default to having access to **all cash boxes** in the org via auto-created memberships (can be restricted later).
- Invites:
  - Real invite flow via token/link (membership created on accept/signup).
- Audit log:
  - Owner-only visibility
  - Append-only (immutable) in v1
- Notifications:
  - No extra notifications for access changes (users simply see access appear/disappear in UI).

### Notes on RLS (important)

- Membership-based policies must avoid policy recursion (e.g. `cash_boxes` <-> `cash_box_memberships`).
- Where needed, policies use `SECURITY DEFINER` helper functions (with `row_security = off`) to avoid infinite recursion.

## What the app does (product)

- Track multiple **Cash Boxes** (registers) with balances
- Record **Transactions** (cash movements) into cash boxes
- Treat each transaction as a **receipt-ready record**: all receipt-relevant data is stored on the transaction so receipts can be regenerated later (PDF / email / print)
- Scope: **cash handoff documentation** (petty cash / internal movements), not invoicing and not a tax/accounting tool
- Maintain **Contacts** and optionally attach a transaction to a saved contact
- Browse/search/filter **Transaction History**
  - Voided transactions remain visible with a **VOID** indicator (hidden writeback is system-only)

## How the app works

### Cash Boxes (core)

- Cash Boxes are the backbone of the app.
- A Cash Box has an **immutable ID** (database primary key). This ID is the stable reference used across:
  - Dashboard
  - Cash Box list/detail/settings
  - Transactions (cash_box_id)
- Editable Cash Box properties (can be changed later via Settings):
  - name
  - currency
  - icon
  - color (accent)
  - default receipt settings (format, toggles, labels)

#### Cash box order (user-defined)

- Cash Boxes can be reordered on `spendnote-cash-box-list.html` via drag-and-drop.
- The order is persisted to the database as `cash_boxes.sort_order`.
- The Dashboard consumes the same ordering (cash boxes are loaded via `db.cashBoxes.getAll()` which orders by `sort_order`, with fallback to `created_at`).

### Active Cash Box color invariant (UI)

- The entire app uses the **active cash box accent color** to help orientation.
- The active cash box is persisted across pages in `localStorage`:
  - `activeCashBoxId`
  - `activeCashBoxColor`
  - `activeCashBoxRgb`
- The active color is applied globally via CSS variables:
  - `--active`
  - `--active-rgb`
- The navigation reflects the active cash box color (including the "New Transaction" button).

### User avatar personalization (UI)

- The user avatar shown in the navigation and tables can be customized on `spendnote-user-settings.html`.
- Current persistence is **client-side** (localStorage):
  - `spendnote.user.avatar.v1` (uploaded image as data URL)
  - `spendnote.user.avatarColor.v1` (monogram accent color)
  - `spendnote.user.fullName.v1` (used to render initials immediately)
- If no image is uploaded, the UI renders a monogram avatar using the saved color.
- Monogram style is **outline** (neutral fill, colored ring + colored letters).

### Create a transaction / receipt (Dashboard modal)

The transaction modal is the core data entry flow. It is designed for a fast "~30 seconds" receipt workflow.

#### Entry points

- Dashboard cash box cards:
  - Each cash box has quick actions **IN** / **OUT**.
  - Clicking them opens the modal with:
    - cash box preselected
    - direction preselected
- Navigation "New Transaction" button:
  - On the dashboard: opens the modal directly.
  - On other pages: navigates to `dashboard.html#new-transaction` to open the modal.

#### Cash box + direction behavior

- Cash box selection inside the modal updates the app-wide active cash box color.
- Direction selection uses a distinct visual tone:
  - **IN** uses the positive/green styling.
  - **OUT is neutral/gray (not red).**
- Direction is stored on the modal container as `data-direction="in|out"`.

#### Quick vs Detailed mode

The modal supports two modes:

- **Quick**: minimal fields for fast receipt creation.
- **Detailed**: expanded fields, optional note, and multiple line items.

Mode is stored as `data-mode="quick|detailed"` and persisted via `localStorage` key `spendnote.modalMode`.

#### Required fields (both modes)

- cash box (resolves to a valid UUID internally)
- direction (IN/OUT)
- contact name (required to produce a receipt)
- description (required)
- amount (required, > 0)

#### Optional fields

- contact address (optional; if provided it is stored on the transaction snapshot)
- contact other id (optional; stored on the transaction snapshot as `contact_custom_field_1` and used on receipts)
- save to contacts (optional, via the "Save to Contacts" checkbox)
- note (detailed mode)

#### Line items

- The modal always stores at least one line item (the main description + amount).
- Detailed mode allows adding up to 4 extra items.
- Total maximum items per transaction from the modal: **5** (1 base + 4 extra).
- Final amount persisted on the transaction is the sum of all items.

#### Saving logic

- Pressing **Done** creates a transaction in Supabase via `db.transactions.create(payload)`.
- OUT transactions enforce a non-negative cash box balance (client-side validation).
- If "Save to Contacts" is enabled:
  - the modal will create or get a Contact and set `transactions.contact_id`.
  - contact snapshot fields are also stored on the transaction for receipt regeneration.

#### Transaction cancellation (void-only, no delete)

- The create-transaction modal has a **Cancel** button which simply closes the modal before saving.
- Existing transactions are never deleted.
- Canceling an existing transaction is done via **void** (admin-only):
  - the original transaction remains visible in history/detail
  - it is marked as void (e.g. "VOID")
  - the system records a compensating writeback/reversal so balances are corrected
  - the writeback/reversal is recorded but **not shown** as a separate user-visible transaction
- Receipt/transaction numbering and counts treat the voided transaction as a single original entry (the hidden writeback does not create another visible receipt/transaction).

#### Done & Print

- The modal includes a **Done & Print** action.
- Current status:
  - Transaction saving is implemented.
  - Receipt templates are implemented (Print-2-copies/PDF/Email).
  - Done & Print opens a receipt template in a new tab/window.
  - Receipt pages opened in a new tab use a bootstrap mechanism to establish auth (see "Session behavior").

#### Receipt number (display ID)

- Every transaction has a receipt number / display ID that appears in:
  - Transaction History
  - Transaction Detail
  - all receipt outputs (print / PDF / email)
- Format is based on cash box number + transaction sequence within the cash box:
  - default prefix (SpendNote branding): `SN{cash_box_sequence}-{tx_sequence_in_box}` (example: `SN3-007`)
- Pro: cash boxes can fully override the prefix (`cash_boxes.id_prefix`), so the receipt identifier does not have to start with `SN`.

#### Duplicate transaction

- Duplicate creates a **new** transaction draft.
- It always uses the **current date** (today) for the duplicated transaction.
- It clears transaction/receipt identifiers so Supabase can generate a new one.

### Receipts (implemented)

Receipts are generated from **stored transaction data** (single source of truth) and rendered into one of the existing templates.
The storage part is in place (transactions persist receipt-relevant snapshot fields), and the templates are now fully wired to load and display real data.

#### Receipt formats / templates

- Print (Letter, 2 copies): `spendnote-receipt-print-two-copies.html`
- PDF: `spendnote-pdf-receipt.html`
- Email: `spendnote-email-receipt.html`

Receipts for voided transactions show a diagonal grey **VOID** watermark in the templates.

#### Data sources (receipt data flow)

When generating a receipt for a transaction:

- Owner/account data: from `profiles` (company_name, full_name, address)
- Logo:
  - default: `profiles.account_logo_url`
  - Pro override per cash box: `cash_boxes.cash_box_logo_url`
  - localStorage override: `spendnote.proLogoDataUrl` (for uploaded logos)
- Cash box receipt settings: from `cash_boxes` (receipt visibility toggles + optional Pro label customizations)
- Contact data for the receipt is taken from **transaction snapshot fields** (`transactions.contact_name`, `transactions.contact_address`, `transactions.contact_custom_field_1`), so receipts can be regenerated even if the Contact record changes.
- Line items: from `transactions.line_items` (the transaction amount is the sum of items)
- Currency: from `cash_boxes.currency`

#### Per-cash-box receipt settings

Each cash box has default receipt settings that apply to receipts created for transactions in that cash box.

- Default output format (used by the "Done & Print" / receipt action)
- Field visibility toggles (cash box level):
  - show logo
  - show addresses
  - show tracking details
  - show additional info
  - show note
  - show signatures

#### Pro: receipt text customization (localization)

In Pro, the cash box can override the text/labels used on receipts (e.g. title, total label, from/to labels, issued/received labels, footer note).
This enables localization and per-cash-box personalization.

#### Receipt design versioning (policy)

- Default/MVP behavior: when regenerating a receipt for an old transaction, the receipt uses the **current** cash box receipt settings (toggles, labels, logo override).
- Transaction content stays historically accurate via snapshot fields (contact snapshot + stored line items).
- Possible future enhancement: store a snapshot of receipt settings on the transaction at creation time to preserve the exact historical look.

Quick defaults:

- Quick receipt mode hides the logo by default.
- Quick receipt mode hides additional identifiers by default (toggles remain available).

#### Mandatory legal disclaimer (immutable)

- Every receipt must include a mandatory legal disclaimer stating it is **cash handoff documentation only** and **not a tax/accounting document**.
- This disclaimer is **not customizable**:
  - it cannot be removed
  - it cannot be hidden via toggles
  - it cannot be edited (even in Pro)

### Receipt Export (PDF / Print) - COMPLETED

- **PDF download**:
  - Letter size (8.5" x 11")
  - White background with 10mm margins
  - Receipt positioned at top of page
  - Uses html2canvas + jsPDF
  - Hidden iframe download (no visible preview or popup)
  - File name format: `SpendNote_<ReceiptID>.pdf` (example: `SpendNote_SN7-007.pdf`)
- **Print (2 copies)**:
  - Opens in normal window with auto-print
  - Two copies per page
- **Line items**: no artificial limits; all transaction items displayed
- **Cache-busting**: versioned `v` param on receipt URLs

### Email Receipts (server-sent) - COMPLETED

- Email sending is available **only on Transaction Detail**.
- Server-side sending uses:
  - Supabase **Edge Function**: `send-receipt-email`
  - Resend API (`RESEND_API_KEY` stored as an Edge Functions secret)
- Email HTML is rendered in an **email-client compatible** layout (no flex/grid dependency).
- The email contains a **public PDF download link** (no login required for recipients).
- Email address autocomplete/picker is deferred until roles + the final contacts model is in place.

### Bulk Actions & Export (Transaction History & Cash Box Detail) - COMPLETED

Both Transaction History and Cash Box Detail tables include bulk actions:

- **Bulk Void**: void multiple selected transactions at once (admin-only)
- **Bulk Export CSV**: export selected rows to CSV with user-facing IDs
- **Bulk Export PDF**: export selected rows to PDF with professional overlay design
- **Filtered Export CSV**: export all filtered transactions (with pagination, max 500 rows)
- **Filtered Export PDF**: export all filtered transactions with:
  - Professional SpendNote-branded header with receipt logo
  - All active filters displayed (date range, cash box, currency, direction, etc.)
  - Transaction table with zebra striping
  - Net balance summary per currency (IN/OUT/Net)
  - Generated timestamp
  - Print-friendly layout (no popup blockers)

CSV exports use **only user-facing IDs** (no database UUIDs):
- Transaction ID: `SN{cash_box_seq}-{tx_seq}` format
- Cash Box ID: `SN-{seq}` format or name
- Contact ID: `CONT-{seq}` format

PDF overlay design:
- SpendNote receipt logo (green gradient)
- Brand colors only (green for IN, gray for OUT, black text)
- Filter metadata in grid layout
- Summary card with gradient background
- Footer with branding

### Contacts List performance (server-side stats RPC) - COMPLETED

The Contacts List avoids loading thousands of transactions on page load by using a server-side stats function:

- RPC: `spendnote_contacts_stats()`
- Returns per-contact:
  - transaction count (`#`)
  - cash boxes involved (dot list)
  - last transaction (ID + date)

If the RPC is not available yet in a given Supabase project, the UI falls back to a client-side scan.

Verification note: the Contacts List stores the stats source in `window.__spendnoteContactsStatsSource` (and logs it only when `window.SpendNoteDebug` is enabled).

### Current gaps / not implemented yet

This is the consolidated missing-items list that was identified (beyond responsiveness + email confirmation), grouped for beta execution.

#### P0 — Must-have before beta

- [ ] Client error tracking (Sentry or equivalent) for production JS/runtime failures.
- [ ] Edge Function error visibility: non-2xx logging + clear debugging path.
- [ ] Formal smoke checklist + run before each release (auth, create transaction, receipt preview/PDF/email).
- [ ] Abuse protection baseline: rate limiting on invite/email endpoints.
- [ ] Cloudflare baseline security: minimal WAF/bot protection rules.
- [ ] Beta entitlement enforcement (preview/free limits enforced in code, not only UI text).

#### P1 — Strongly recommended for beta stability

- [ ] Desktop-only communication on landing + signup until mobile is fully stable.
- [ ] Terms/Privacy beta wording pass (preview status + limitations).
- [ ] Safari/cross-browser auth regression round before each release.
- [ ] SEO/indexing hygiene: `robots.txt`, remove fake `aggregateRating`, only landing + 2 SEO pages indexable in beta.
- [ ] GA4 baseline + Search Console setup verification.

#### P2 — Post-beta (already visible gaps)

- [ ] Role-based settings UI completion (Owner/Admin/User).
- [ ] Cash box access assignment/revocation UX completion.
- [ ] Stripe/billing stack completion (checkout, portal, webhook, enforcement).

Recent UX fixes:

- Navigation: active page menu item is underlined.
- Cash Boxes list: shows per-cash-box transaction count (active, non-system).
- Transaction History:
  - Stats counts reflect the active filters (transactions + cash boxes).
  - Currency filter normalizes values and applies immediately on change.
  - Total IN / OUT / Net Balance compute when the filter result resolves to a single currency (otherwise shows `—`).

Cash Box deletion:

- Cash Box Settings includes a Danger Zone **hard delete** action.
- The UI shows the number of transactions that will be deleted and requires typing `DELETE` to confirm.
- Deleting a cash box also deletes its transactions (FK `ON DELETE CASCADE`).

Cash Box Settings status:

- Receipt & Print Settings preview behavior is now aligned with Transaction Detail (same layout sizing + zoom behavior).
- Inline `onclick` handlers have been removed; event bindings are handled in JS.

## Canonical conventions / decisions (do not change casually)

This section is meant to prevent re-explaining core decisions in new chat threads.

### URL parameter conventions

- Prefer `cashBoxId` for cash box filtering / deep links.
- Prefer `direction` for transaction direction (`in|out`).
- Prefer `txId` for receipt rendering of a specific transaction.

### Active cash box state (cross-page)

- Active cash box state is persisted in `localStorage`:
  - `activeCashBoxId`
  - `activeCashBoxColor`
  - `activeCashBoxRgb`
- CSS variables used app-wide:
  - `--active`
  - `--active-rgb`
- Any UI surface may update the active cash box (this is currently a flexible rule while wiring is still in progress).

### cash_box_id propagation rule

- `cash_box_id` is the primary linkage for transactions and must be carried end-to-end:
  - create transaction payloads
  - list views and detail views
  - deep links (URL params)

### Receipt rendering integration (planned)

- Receipts are rendered from stored data via **txId-based loading**:
  - templates load the transaction by `txId`
  - templates load cash box receipt settings + owner profile data
- "Done & Print" uses the cash box **Default format**.
- Receipt display ID:
  - default prefix: `SN` (SpendNote branding)
  - Pro: prefix fully overridable via `cash_boxes.id_prefix`
- Mandatory disclaimer is always present and immutable.

### Team roles & permissions (planned)

- Owner is admin.
- Admin can grant admin/user roles and per-cash-box access.
- Admin-only:
  - create cash boxes
  - change cash box receipt settings
  - invite/add users
  - void existing transactions
- Users can:
  - record transactions
  - generate/print receipts
  - search
  - export within their access scope

### Terminology

- **Transaction**: the stored record (single source of truth).
- **Receipt**: an output rendering (print/PDF/email) generated from a transaction.

## Main flows

### Authentication

- Auth uses Supabase Auth.
- Most app pages include `assets/js/auth-guard.js` which redirects to `spendnote-login.html` when not authenticated (but after an explicit logout, it returns to `index.html`).

### Receipt templates

- Receipt templates are fully wired to load transaction data from Supabase:
  - `spendnote-pdf-receipt.html`
  - `spendnote-email-receipt.html`
  - `spendnote-receipt-print-two-copies.html`
- Templates are populated from the transaction record so the same receipt can be printed/emailed/downloaded again at any time.
- Each template:
  - Waits for `window.db` to be ready
  - Loads transaction by `txId` URL param
  - Enriches with cash box and profile data
  - Populates company name/address, contact name/address, line items, total, notes, IDs
  - Supports logo via `logoUrl` or `logoKey` (localStorage) query params
  - Respects display toggles (logo, addresses, tracking, additional, note, signatures) via query params

### Contacts

- Contacts list + detail are wired to Supabase.
- UI uses a stable display ID: **`CONT-###`** derived from `contacts.sequence_number`.

### Transaction History

- Search/filter across transactions.
- Contact ID display is intentionally minimal:
  - if there is no saved contact sequence, show **`—`** (no placeholder `CONT-*`).
- Stats cards:
  - `Total Transactions` and `Cash Boxes` reflect the active filters.
  - Monetary totals are shown only when the filter result is a single currency.

## Pages / routes (high level)

- Public
  - `index.html` (landing)
  - `spendnote-login.html`, `spendnote-signup.html`, `spendnote-forgot-password.html`
- App
  - `dashboard.html` (overview + create transaction modal)
  - `spendnote-cash-box-list.html`
  - `spendnote-cash-box-detail.html`
  - `spendnote-transaction-history.html`
  - `spendnote-transaction-detail.html`
  - `spendnote-contact-list.html`
  - `spendnote-contact-detail.html`
  - `spendnote-user-settings.html`

## Local development

### Requirements

- Node.js (only needed to run the tiny local static server)

### Run the app locally

Run:

```bat
start-server.bat
```

Then open:

- `http://localhost:8000`

## Supabase configuration

### Where credentials live

Supabase is configured in:

- `assets/js/supabase-config.js`

It defines:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `window.supabaseClient`
- `window.auth` (auth wrapper)
- `window.db` (DB access wrappers)

### Session behavior

The Supabase client is configured to use **`sessionStorage`**, so closing the tab/browser drops the session.

Receipt templates may be opened in **new tabs/windows** (e.g. Print). Because `sessionStorage` is per-tab, receipt pages can start without a session.
To avoid a login redirect/flicker, the app uses a lightweight bootstrap mechanism:

- The main app writes the current session tokens to `localStorage` key `spendnote.session.bootstrap`.
- Receipt pages opened with `bootstrap=1` attempt to set the session from that key (and may also request it from `window.opener` as a fallback).

### Important security note

- Browser code must only use the **anon/public key**.
- Never put a Supabase **service role key** into this repo.

### Edge Functions deployment (GitHub Actions)

This repo deploys Supabase Edge Functions via GitHub Actions on push to `main` (only when `supabase/functions/**` changes).

- Workflow: `.github/workflows/deploy-supabase-functions.yml`
- Current functions:
  - `send-invite-email` — team invite email delivery (deployed with `--no-verify-jwt`; auth handled internally)
  - `create-checkout-session` — Stripe Checkout session creation (authenticated)
  - `create-portal-session` — Stripe Customer Portal session creation (authenticated)
  - `stripe-webhook` — Stripe webhook event handler (`--no-verify-jwt`, signature-verified)
- Invite emails use Resend (`spendnote.app` verified domain); Stripe functions use Stripe API secrets.

Required GitHub Secrets:

- `SUPABASE_ACCESS_TOKEN` (Supabase personal access token)
- `SUPABASE_PROJECT_REF` (Supabase project ref)

Required Supabase Edge Functions Secrets (set in Supabase Dashboard):

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `SPENDNOTE_EMAIL_FROM` (e.g. `invite@spendnote.app` — domain must be verified in Resend)
- `SPENDNOTE_APP_URL` (public app base URL used in invite links)
- `SPENDNOTE_INVITE_SUBJECT`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STANDARD_MONTHLY_PRICE_ID`
- `STRIPE_STANDARD_YEARLY_PRICE_ID`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`
- `APP_BASE_URL` (e.g. `https://spendnote.app`, used for Stripe return URLs)

### Invite token security

- The `invites` table stores only a SHA-256 hash of the invite token (`token_hash` column), not the plaintext token.
- The `spendnote_create_invite` RPC generates a random token, stores the hash, and returns the plaintext token in a `jsonb` response.
- The `send-invite-email` Edge Function hashes the incoming plaintext token with `crypto.subtle.digest('SHA-256', ...)` before looking up by `token_hash`.

## Code structure (important entry points)

### Shared CSS

- `assets/css/main.css`
- `assets/css/app-layout.css`

### Shared JS

- `assets/js/supabase-config.js`
  - Defines the data layer (`window.db.*`) and auth helpers.
- `assets/js/auth-guard.js`
  - Redirects unauthenticated users to login on app pages.
- `assets/js/nav-loader.js`
  - Injects the shared navigation (`loadNav()`), binds logout + “New Transaction”.
- `assets/js/main.js`
  - Global helpers (formatting, nav avatar, logout binding, theme color persistence).

### Page-specific JS

- Dashboard transaction UI: `assets/js/dashboard-form.js`
- Transaction History UI/data: `assets/js/transaction-history-data.js`

## Database invariants (critical)

### profiles vs auth.users

- App tables are scoped by `user_id` that references **`public.profiles(id)`**.
- This means a **profile row must exist** for a newly registered auth user, otherwise FK/RLS will break.

### RLS

- RLS is enabled.
- Policies enforce access via org + membership tables (not client-side filters).

### Stable display IDs

- Contacts: `contacts.sequence_number` -> `CONT-###`
- Transactions: receipts are expected to have a stable receipt identifier (for example `transactions.receipt_number`, and/or sequence fields like `cash_box_sequence`, `tx_sequence_in_box`).
- Cash Boxes: `cash_boxes.sequence_number` -> `SN-###`

### Receipt regeneration (store snapshots)

- Product intent: a transaction stores snapshot fields (for example contact name/address at the time of the transaction), so receipts can be regenerated later even if the Contact record changes.

### Cash box ordering

- Cash boxes try to use `sort_order` for stable ordering, with fallback to `created_at`.

## Migrations / schema

- Base schema + docs: `database/schema.sql`, `database/SCHEMA-DOCUMENTATION.md`
- Supabase migrations: `supabase-migrations/*.sql`

## Deployment

This repo is designed to work as a static deployment.

- Vercel config: `vercel.json`
  - Uses immutable caching for `/assets/*`.

## Troubleshooting

- **Redirect loop to login**
  - Check that `SUPABASE_URL` / `SUPABASE_ANON_KEY` are correct.
  - Check that your Supabase Auth settings allow the current site origin.
  - If the issue occurs only when printing/opening receipts in a new tab, check the receipt URL contains `bootstrap=1` and that `localStorage.spendnote.session.bootstrap` is populated.

- **ERR_TOO_MANY_REDIRECTS on clean routes (Cloudflare Pages)**
  - Symptom: `https://spendnote.app/dashboard` (or similar clean routes) loops with 308 redirects.
  - Cause: Cloudflare Pages Clean URLs (`/dashboard.html` → `/dashboard`) can conflict with `_redirects` rules that rewrite clean routes back to `.html`.
  - Fix: ensure `_redirects` does not rewrite clean routes to `*.html` and avoid self-rewrite rules.

- **Invites fail with missing `gen_random_bytes()` / `digest()`**
  - Some Supabase projects install `pgcrypto` under the `extensions` schema. If DB functions call `gen_random_bytes(...)` or `digest(text, ...)` without schema qualification, you may see errors like:
    - `function gen_random_bytes(integer) does not exist`
    - `function digest(text, unknown) does not exist`
  - Run this in Supabase SQL Editor:

```sql
create extension if not exists "pgcrypto" with schema extensions;

create or replace function public.gen_random_bytes(integer)
returns bytea
language sql
immutable
as $$
  select extensions.gen_random_bytes($1);
$$;

create or replace function public.digest(text, text)
returns bytea
language sql
immutable
as $$
  select extensions.digest(convert_to($1, 'utf8'), $2);
$$;
```

- **Invites fail with unique constraint `invites_org_token_unique`**
  - This means the invite token generator is producing the same token more than once for the same org.
  - Fix: replace the `spendnote_create_invite` RPC to use randomized tokens and to reuse an existing pending invite for the same email.
  - Run this in Supabase SQL Editor:

```sql
create or replace function public.spendnote_create_invite(
  p_org_id uuid,
  p_invited_email text,
  p_role text,
  p_expires_at timestamptz
)
returns public.invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_member_role text;
  v_email text;
  v_role text;
  v_token text;
  v_invite public.invites;
  i int;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_email := lower(trim(coalesce(p_invited_email, '')));
  if v_email = '' then
    raise exception 'Missing invited email';
  end if;

  v_role := case when lower(coalesce(p_role, '')) = 'admin' then 'admin' else 'user' end;

  select role into v_member_role
  from public.org_memberships
  where org_id = p_org_id and user_id = v_uid
  limit 1;

  if v_member_role is null or lower(v_member_role) not in ('owner', 'admin') then
    raise exception 'Not allowed';
  end if;

  select * into v_invite
  from public.invites
  where org_id = p_org_id
    and invited_email = v_email
    and status = 'pending'
  order by created_at desc
  limit 1;

  if v_invite.id is not null then
    update public.invites
      set role = v_role,
          expires_at = p_expires_at
      where id = v_invite.id
      returning * into v_invite;
    return v_invite;
  end if;

  for i in 1..5 loop
    v_token := encode(public.gen_random_bytes(24), 'hex');
    begin
      insert into public.invites (org_id, invited_email, role, status, token, expires_at)
      values (p_org_id, v_email, v_role, 'pending', v_token, p_expires_at)
      returning * into v_invite;
      return v_invite;
    exception when unique_violation then
      -- try again
    end;
  end loop;

  raise exception 'Could not generate unique invite token';
end;
$$;
```

- **Receipt page shows login flicker / opens Dashboard instead of loading the receipt**
  - Check the browser console for a `SyntaxError`.
  - A past root cause was a global function/const name collision in receipt templates (e.g. defining a top-level `isUuid` that collided with `supabase-config.js`).
  - Avoid defining common globals in templates; prefer unique helper names (e.g. `isUuidParam`).
- **“No authenticated user” in console**
  - You are not logged in, or session expired (expected when tab/browser closed).
- **Foreign key / RLS errors on inserts**
  - Ensure a `public.profiles` row exists for the auth user.

- **Changes to JS/CSS don’t show up**
  - This repo uses immutable caching for `/assets/*` in `vercel.json`.
  - When you update files under `assets/`, bump the `?v=` query param in the consuming HTML page(s).

## “New chat starter” (so you don’t need to re-explain)

If a chat thread resets/freezes, start the new chat with:

- "Read `PROGRESS.md` and `README.md`, then continue from there."

## AI assistant guidance (for new chat threads)

- Keep responses minimal and task-focused.
- Prefer implementing the fix over explaining it.
- Avoid long explanations, hedging, or repetitive confirmations.
- Be professional and forward-looking: choose robust solutions and prevent likely edge cases.
- Ask only the necessary clarifying questions when requirements are ambiguous.

## Progress tracking

- Canonical status: `PROGRESS.md`
- Session snapshot (2026-01-30): `SESSION-NOTES-2026-01-30.md`
