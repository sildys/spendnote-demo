# Progress (canonical)

This is the **single canonical “where we are”** file.

If a chat thread freezes / context is lost: in the new thread say:
- **“Read `PROGRESS.md` and continue from there.”**

## AI assistant guidance

- Keep responses minimal and task-focused.
- Prefer implementing fixes over explaining them.
- Avoid long explanations, hedging, or repetitive confirmations.
- Be professional and forward-looking (anticipate edge cases, choose robust solutions).
- Communicate in **Hungarian only**.
- Aim for the **fastest, most ideal** solution that is still robust.
- Do **everything you can autonomously** (code changes, refactors, searches, commits) without asking.
- Ask me only for:
  - decisions (choice between options)
  - external configuration steps you cannot access (e.g. Supabase/Cloudflare dashboards)

## Launch roadmap (ordered checklist)

- [x] **REPO-1** Rename GitHub repo: `spendnote-demo` → `spendnote` (update local `git remote`, verify Vercel still auto-deploys, confirm GitHub Actions still runs)
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
- [ ] **L1** Onboarding UI: registration success state + post-login next steps (Cash Box → Transaction → Receipt), invite explanation, role-based messaging
- [ ] **L2** Email pack (4 only): define copy + triggers + recipients (Welcome/Account created; Email confirmation; You’ve been invited; Invite accepted/user activated → admin)
- [ ] **L3** Email delivery implementation: Resend + Edge Functions/hooks + templates
- [ ] **L4** Role-based Settings UI: Owner/Admin vs User (hide non-owned sections)
- [ ] **L5** Access control UX: user sees only assigned cash boxes; admin can assign/revoke cash box access in UI
- [ ] **DB-TEAM-1** Team/org/invite DB versioning alignment: ensure `org_memberships`/`invites`/`cash_box_memberships` tables + RLS policies + `spendnote_create_invite` RPC are all versioned in `supabase-migrations/` (not only README snippets), and align `database/schema.sql` + `database/SCHEMA-DOCUMENTATION.md` with the current org/invite model
- [ ] **M1** Mobile strategy + responsive MVP: maximize mobile functionality; tables → cards/collapsible, off-canvas filters (decide exclusions during build)
- [ ] **S1** Subscription rules spec: trial model (14 days and/or 20 receipts), expiry behavior, receipt/user limits, data handling on user delete (matrix)
- [ ] **S2** Stripe prep (ready to plug in): subscription state data model + feature flags + UI placeholders + webhook handling plan
- [x] **DEPLOY-1** Migration plan: move from Vercel/demo domain to Cloudflare on `spendnote.app` (hosting target, caching rules)
- [x] **DEPLOY-2** Cloudflare DNS + SSL + redirects: decide canonical host (`spendnote.app` vs `www`), configure 301s and safe HSTS
- [x] **DEPLOY-3** Supabase for new domain: update Site URL + allowed redirect URLs; test login/signup/invite flows on `spendnote.app`
- [x] **DEPLOY-4** Cutover rehearsal + go-live checklist: staging URL, smoke tests, rollback plan
- [ ] **S3** Stripe integration: checkout, customer portal, webhooks, live mode rollout + enforcement activation
- [ ] **O1** Google OAuth (later): Supabase OAuth + account linking rules + UX
- [ ] **MKT-1** Market scan + positioning: direct/adjacent alternatives + SpendNote differentiation + keyword list
- [ ] **MKT-2** SEO content plan: 3 landing pages (petty cash misspellings/alternatives) + “cash handoff receipt” positioning + CTA alignment to onboarding (L1/L2)
- [ ] **CLEAN-1** Codebase cleanup pass: remove unused/dead code, dedupe helpers, normalize versioned assets, performance + reliability polish
- [ ] **P3-1** Polish: Landing/FAQ/Terms refinements + edge cases + final UX consistency pass

## Where we are now (last updated: 2026-02-14 evening)

- Marketing polish (evening session):
  - Footer redesigned with dark gradient background (matching early access banner style):
    - Gradient: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)`
    - Logo updated with green gradient fill + drop-shadow glow
    - Modern pill-style disclaimer with green accent
    - Link hover effects with animated underline
    - Footer description updated: "Complete cash visibility for your team. Instant receipts, full history."
  - Pricing page improvements:
    - Replaced internal app buttons (Upgrade/Downgrade/Current Plan) with marketing CTAs (Get Started/Start Free)
    - All pricing buttons now link to signup page
    - "2 receipt templates" → "Customizable receipt layouts" across all pricing displays
  - Pro plan feature refinements:
    - "Custom receipt wording" → "Customizable text & labels (localization)" (now first feature)
    - Feature order optimized: localization first, then user count, then unlimited features
  - User Settings page pricing features synchronized with landing/pricing pages
  - Commits: `df73941`, `751d531`, `8eee347`, `b84cad2`, `c7b2c9a`, `450e4ac`, `1596956`, `68a8f51`

- Marketing polish & SEO (late night session):
  - FAQ Page Redesign:
    - Modern, card-based grid layout with central search and category tabs
    - Lightened background gradients (slate/teal) for better readability
    - Content refined based on user feedback & SEO best practices
    - Added critical trust/billing questions (downgrade, refund, support)
    - Implemented `FAQPage` JSON-LD structured data for Google Snippets
  - UX Improvements:
    - Auto-create default USD Cash Box for new users (via Supabase trigger)
    - Updated `handle_new_user` migration
  - SEO Optimization:
    - `index.html`: Meta tags, Open Graph, Canonical, `SoftwareApplication` schema
    - `spendnote-pricing.html`: H1 fix, `Product` schema with pricing offers
    - `sitemap.xml` generated for public pages
  - Commits: `93e0c0f`, `517dcff`, `54c2780`, `f28a501`, `01b41fa`

- Invites/Team hotfixes (PM):
  - Fixed DB check constraint so invite acceptance can set status to `active` (`invites_status_check`).
  - RLS policies added on `profiles` so org members can read each other's minimal profile (name/email).
  - Frontend hardened: `teamMembers.getAll()` fetches `profiles` separately and falls back to accepted invite email if profile missing; signup → login link preserves `inviteToken`.
  - Auto-accept-by-email fallback implemented (runs when no token or token-RPC fails).
  - Resend domain verified for spendnote.app; Edge Function updated with `reply_to` and personalized subject (deploy pending).
  - Go-live smoke: invite accept → inviter sees Active / no Pending — PASSED.
  - Migration 015 applied + verified in SQL Editor (`spendnote_accept_invite_v2`, `spendnote_auto_accept_my_invites` present; orphan membership check returned 0 rows).
  - README updated with 2026-02-13 PM hotfixes summary.
  - SEO safety lock for preview prep: `noindex` enabled across pages (including landing) until landing polish is finished.
  - Timeline update:
    - Beta/preview ships in the next few days.
    - Launch target is ~6 weeks: pricing + company setup + Stripe, mobile view, and final polish.
  - Indexing plan during beta:
    - Only the landing page + 2 SEO pages should be indexable.
    - Keep all internal/app pages `noindex`.
  - Onboarding decision:
    - After signup/first valid session, auto-create a default USD Cash Box (starting balance: 0).
    - Goal: first receipt can be created in ~30 seconds with a ready-to-use USD cash box.
  - Tomorrow plan: landing polish + preview disclaimer UX + GA4 baseline + Google Search Console setup.
- TODO (next session): verify and fix the auto-create Cash Box migration (`018_auto_create_default_cash_box.sql`) and any related code changes (Sonnet edits suspected incorrect).
 
 - GitHub repo is now: `https://github.com/sildys/spendnote` ✅
 - Local git `origin` points to the new repo ✅
 - GitHub Actions: green ✅
 - Vercel:
   - Project renamed to `spendnote` ✅
 - Cloudflare Pages config committed:
   - `_redirects` (clean URLs like `/login`, `/signup`) 
   - `_headers` (immutable caching for `/assets/*`, but **no-cache** for critical auth/nav scripts)
     - `assets/js/nav-loader.js`
     - `assets/js/auth-guard.js`
     - `assets/js/supabase-config.js`
 - Cloudflare Pages prod fixes committed:
   - Fixed `ERR_TOO_MANY_REDIRECTS` on clean routes like `/dashboard` (Clean URLs + `_redirects` interaction)
   - Enforced canonical host: `www.spendnote.app` → `spendnote.app`
   - Logout now returns to landing (`index.html`) and is auth-guard compatible

## If you close the IDE now (folder rename resume)

 - Folder rename target (cosmetic):
   - from: `c:\SpendNote projekt\spendnote-demo`
   - to: `c:\SpendNote projekt\spendnote-git`
 - After rename: open the project from `c:\SpendNote projekt\spendnote-git`.
 - Sanity checks to run (optional):
   - `git status`
   - `git remote -v`
 - Migration decisions (final domain):
   - Canonical host: `https://spendnote.app` (apex)
   - Redirect: `https://www.spendnote.app` → apex
   - Keep Vercel as fallback for **24–48h** after go-live
 - Simplified cutover plan file (local): `C:\Users\sild\.windsurf\plans\spendnote-cloudflare-cutover-577247.md`
 - Next milestone after folder rename: **Cloudflare Pages Phase 1** (deploy to `*.pages.dev`, smoke test `/`, `/login`, `/signup`).

## Immediate next steps (Cloudflare Pages + spendnote.app)

1) **Local folder rename (optional but recommended)**
   - Rename folder on disk:
     - from: `c:\SpendNote projekt\spendnote-demo`
     - to: `c:\SpendNote projekt\spendnote-git`
   - Close IDE before rename (prevents file locks), then re-open the new folder.
   - Quick sanity checks in terminal:
     - `git status`
     - `git remote -v`

2) **Create Cloudflare Pages project (from GitHub)**
   - Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
   - Select repo: `sildys/spendnote`
   - Build settings (static):
     - Framework preset: **None**
     - Build command: *(empty / none)*
     - Output directory: `/`
     - Production branch: `main`
   - Deploy and open the generated `*.pages.dev` URL.
   - Smoke: `/<login|signup|dashboard>` should load (via `_redirects`).

3) **Attach the real domain**
   - Cloudflare Pages → project → **Custom domains** → add: `spendnote.app`
   - Decide canonical host:
     - Option A: `spendnote.app` (recommended)
     - Option B: `www.spendnote.app`
   - Ensure SSL is active.

4) **Supabase Auth URL config update for the new domain**
   - Supabase → Auth → URL Configuration
     - Site URL: `https://spendnote.app`
     - Additional Redirect URLs: include `https://spendnote.app` and the `*.pages.dev` URL during rollout
   - Smoke test on `spendnote.app`: login/signup + invite accept.

5) **Keep Vercel as fallback briefly, then remove it**
   - Keep Vercel alive for 1–2 days after cutover.
   - After Cloudflare is stable: archive/disable Vercel project and set any legacy subdomain redirects if needed.

## Weekly cadence (time budget)

- **Mon–Thu:** evenings only (2–3 hours when possible; not every day)
- **Fri–Sun:** long-form sprint blocks (as much as sustainable)

## Next 2 weeks: Beta ship (priority)

- **Goal:** Public landing + public signup + usable app in **beta/test mode** on Cloudflare.

- **Open questions (decisions)**
  - **Q1:** Include **Google OAuth signup/login** in the beta scope? (Yes/No)

- **Beta Definition of Done (ship criteria)**
  - [ ] Cloudflare Pages deploy from `main` is green
  - [ ] Custom domain is live with SSL, canonical host decided and working
  - [ ] Supabase Auth URL Configuration updated for the final domain (Site URL + Redirect URLs)
  - [ ] Landing is public + indexable, and links to Terms + Privacy
  - [ ] Signup/login works on production domain (email-confirm flow included)
  - [ ] Beta disclaimer is visible and is explicitly accepted during signup
  - [ ] Beta is clearly communicated as **desktop-only** on landing + signup
  - [ ] Free beta mode active (unlimited during beta; 1 user + 1 cash box)
  - [ ] Minimal client error logging is live (JS errors captured for signed-in users)
  - [ ] Smoke test passes on production domain: auth, create transaction, receipt

- **Week 1 (ship infrastructure + surfaces)**
  - Cloudflare Pages: connect GitHub repo, production deploy on `main`
  - Custom domain: `spendnote.app` (canonical host decision + DNS/SSL)
  - Supabase Auth URL configuration:
    - Site URL
    - Additional Redirect URLs (for login/signup/OAuth)
  - Landing SEO baseline:
    - `robots.txt`
    - `sitemap.xml`
    - Canonical + OG/Twitter meta
  - Landing CTA: **Start free beta** → signup
  - Legal pages wired everywhere:
    - Terms + Privacy linked from landing/app

- **Week 2 (beta safety + free beta mode)**
  - Beta disclaimer + acceptance in signup UX (checkbox + link to Terms/Privacy)
  - Beta communication: **desktop-only** (mobile/responsive not supported during beta) — show on landing + signup
  - Terms/Privacy updated to reflect **beta/test period** (instability, data loss possibility, limitation of liability)
  - Beta entitlements:
    - Free is **unlimited during beta**
    - Constraints remain: **1 user + 1 cash box**
  - Smoke test checklist on `spendnote.app` (auth + create transaction + receipt)

- **Deferred until after beta ship:** team management / invites / role management / responsive & mobile view (M1)

## Current state (last updated: 2026-02-11)
- **Dashboard** ✅
  - Transaction modal fully wired to Supabase:
    - **Transaction create** via `db.transactions.create()` with full payload
    - **Robust error handling** (INSUFFICIENT_BALANCE, RLS, profile missing, session expired)
    - **Balance validation** (UI-side check prevents negative balance on expense)
    - **Contact linking** (uses selected contact UUID when available; otherwise lightweight lookup)
    - **Save to Contacts** (creates new contact if checkbox enabled)
    - **Verification** (debug-only: checks transaction exists after insert)
    - **Dashboard reload** after successful save
    - **Receipt flow** ("Done & Print" opens receipt in selected format)
  - Cash box cards display **`SN-###`** from `cash_boxes.sequence_number` (not derived index).
  - Hash deep-link open supports `cashBoxId=SN-###` and resolves to UUID.

  - Latest Transactions table (dashboard):
    - Uses unified table-style rendering (consistent with other transaction tables).
    - Shows newest 5 only (no pagination).
    - VOID indicator is consistent (pill + struck-through amount).
    - Hover tooltips for long text (Description / Cash Box / Contact).
    - Row open UX requires 2 clicks to open detail (armed-row state).
    - Avoids embedded joins for transactions page fetch to prevent PostgREST schema-cache relationship errors.
- **Contacts**
  - Contacts list + detail are wired to Supabase.
  - UI shows **Contact ID as `CONT-###`** using `sequence_number`.
  - Contacts list **View column + bottom pagination** aligned with Transaction History UI.
  - Contacts list row open UX requires **2 clicks** (armed row) to open Contact Detail (matches transaction tables).
  - Contacts List performance: uses Supabase RPC **`spendnote_contacts_stats()`** to populate:
    - `#` (active tx count)
    - `Boxes` dot list
    - `Last Tx` (ID + date)
  - Verification: Contacts List stores stats source (`rpc` vs `scan`) in `window.__spendnoteContactsStatsSource` (logs only with `SpendNoteDebug`).
  - Contact "Other ID" is stored in `contacts.phone` and is snapshot-stored onto transactions as `contact_custom_field_1` for receipts.
- **Transaction History** ✅
  - Loads from Supabase (server-side pagination + filters).
  - Does **not** auto-filter by the previously selected Cash Box (dashboard active cash box).
  - Hides system/reversal transactions (`is_system=true`) and treats legacy `is_system=NULL` as non-system.
  - Currency filter values are normalized (uppercase) and apply correctly.
  - Stats cards reflect the active filters:
    - `Total Transactions`: filtered result count
    - `Cash Boxes`: cash boxes in the filtered result
  - Monetary totals:
    - `Total IN / Total OUT / Net Balance` compute when the filtered result resolves to a single currency
    - otherwise they show `—`
  - Voided transactions:
    - show a distinct **VOID** badge
    - amount is dimmed + struck-through
    - reversal/writeback is not visible as a separate transaction
  - Contact ID column is intentionally minimal: **shows `—`** when there is no saved contact sequence.
  - Filter mapping:
    - Contact filter accepts `CONT-###` and maps to UUID internally
    - Cash Box filter accepts `SN-###` and maps to UUID internally
    - Transaction query normalizes `SNx-y` to `SNx-yyy`
  - No UUIDs shown in Cash Box / Contact suggestions.

  - Row open UX requires 2 clicks to open detail (armed-row state).
- **Transaction Detail + Receipt Preview** ✅
  - Receipt preview iframe now loads real Supabase data (transaction + cash box + profile).
  - All receipt-related UI controls (toggles, Pro text fields) are initialized from `cash_boxes.receipt_*` settings.
  - Logo preview supports `logoUrl` (from Supabase) or `logoKey` (localStorage override).
  - Quick receipt behavior:
    - Receipt IDs are shown by default in Quick mode.
    - `itemsMode=single|full` controls quick vs detailed line item rendering.
    - In `itemsMode=single`, exactly one row is filled and its amount equals the Total (grid still shows 5 rows).
    - `recordedBy=0` hides the recorded-by line.
  - Receipt templates (A4/PDF/Email) fully populate from transaction data:
    - Company name/address from profile
    - Contact name/address from transaction snapshot fields
    - Line items table + total from `tx.line_items` / `tx.amount`
    - Notes (hidden if empty)
    - **Cash Box ID: `SN-###`** (from `cash_boxes.sequence_number`)
    - **Receipt ID: `SN{cash_box_sequence}-{tx_sequence_in_box}`**
    - **Other ID: from `contact_custom_field_1`** (not cash box code)
  - **Print/A4 receipt**: date displays correctly, "Recorded by" line removed.
  - Void feedback:
    - amount is dimmed + struck-through
    - shows **Voided by + date**
    - receipt previews include a diagonal grey **VOID** watermark (A4/PDF/Email)
  - Pro badge styling unified across the app (consistent orange badge with crown icon).
  - URL hardening: invalid/missing `txId` redirects to Transaction History.
  - Duplicate button works even when opened via `SNx-yyy` (uses loaded transaction UUID).

- **Receipt print flow (new tab)** ✅
  - Print/receipt templates can open in a new tab/window (`bootstrap=1`).
  - Auth/session persistence uses `sessionStorage`, so new tabs may start without a session.
  - **FIXED (2026-02-07)**: Root cause of login flicker/redirect:
    - Receipt templates defined a global `isUuid` which collided with `supabase-config.js` and caused a `SyntaxError`.
    - Result: `supabaseClient` was never created, `auth-guard` redirected to login, which bounced back to Dashboard (flicker).
    - Fix: rename template helper `isUuid` -> `isUuidParam` (A4/PDF/Email).
  - Follow-up hardening:
    - Exposed `window.writeBootstrapSession()` for on-demand fresh token writing
    - Dashboard modal calls `writeBootstrapSession()` BEFORE opening receipt window
    - Transaction Detail Print/PDF buttons call `writeBootstrapSession()` before opening
    - Receipt iframe preview also writes fresh bootstrap before loading
    - `auth-guard.js` properly waits for session establishment after `setSession()`
    - Increased timeout + exponential backoff for bootstrap waiting (8s total)
    - iframes with `bootstrap=1` now attempt session restoration
    - Receipt templates verify auth session is established (not just `window.db` available)
- **Receipt Export (PDF/Print)** ✅
  - **PDF download**: Letter size (8.5" x 11"), white background, receipt at top with 10mm margins.
  - **PDF download flow**: hidden iframe triggers download without visible preview or popup.
  - **PDF file name**: `SpendNote_<ReceiptID>.pdf`.
  - **Print (A4)**: opens normal window with auto-print; no more tiny offscreen popup.
  - **Line items**: no 4-item limit; all items display on both A4 and PDF receipts.
  - **Cache-busting**: receipt URLs use versioned `v` param to force reload after updates.

- **Email Receipts (server-sent)** ✅
  - **Send from Transaction Detail only**.
  - Supabase **Edge Function** `send-receipt-email` + Resend (`RESEND_API_KEY` secret).
  - Email uses an **email-client compatible** layout.
  - Email includes a **public PDF link** (recipient does not need an account).
  - Email address autocomplete deferred until roles + final contacts model.

- **Bulk Actions & Export (Transaction History & Cash Box Detail)** ✅
  - **Bulk Void**: void multiple selected transactions at once
  - **Bulk Export CSV**: export selected rows with user-facing IDs only
  - **Bulk Export PDF**: export selected rows with professional overlay
  - **Filtered Export CSV**: export all filtered transactions (pagination, max 500)
  - **Filtered Export PDF**: export all filtered transactions with:
    - SpendNote-branded header with receipt logo (green gradient)
    - All active filters displayed in grid layout
    - Transaction table with zebra striping
    - Net balance summary per currency (IN/OUT/Net)
    - Generated timestamp and branding footer
    - Print-friendly (no popup blockers)
  - CSV exports use **only user-facing IDs** (no database UUIDs):
    - Transaction ID: `SN{cash_box_seq}-{tx_seq}` format
    - Cash Box ID: `SN-{seq}` format or name
    - Contact ID: `CONT-{seq}` format
  - PDF overlay uses brand colors only (green for IN, gray for OUT, black text)

- **Canonical URL params (app-wide)** ✅
  - Cash Box: `cashBoxId`
  - Contact: `contactId`
  - Transaction: `txId`
  - Legacy `id=` fallbacks removed.

- **UUID validation centralization** ✅
  - UUID validation is centralized via `window.SpendNoteIds.isUuid` (removed scattered regex fallbacks).

- **Cache-busting / immutable deploy hardening** ✅
  - Critical JS/CSS assets were version-bumped across pages to avoid stale cached builds.

- **Modal UX** ✅
  - Reduced first modal-open layout shift/flicker via scrollbar compensation.
- **Cash Box pages**
  - Cash Box Detail: accepts `id`/`cashBoxId` as UUID or `SN-###` and resolves to UUID; displays `SN-###` code.
  - Cash Box Settings: accepts `id`/`cashBoxId` as UUID or `SN-###` and resolves to UUID; displays `SN-###` in subtitle.
  - Cash Box Settings: receipt preview uses demo data (A4/PDF/Email) and respects quick/detailed + toggles.
  - Cash Box Settings: receipt preview layout/height + zoom behavior matches Transaction Detail.
  - Cash Box Settings: removed inline `onclick` handlers (bindings live in JS).
  - Cash Box Settings: Danger Zone hard delete implemented (shows transaction count, requires typing `DELETE`, deletes cash box + cascaded transactions).
  - Cash Box List: delete modal subtitle ready for dynamic data.
  - Cash Box List: shows per-cash-box transaction count (active, non-system).

- **Navigation** ✅
  - Active page menu item is underlined.
  - Active page detection works for pretty URLs (e.g. `/dashboard` as well as `dashboard.html`).

- **User Settings (Profile) / Avatar** ✅
  - Profile section redesigned.
  - Avatar upload + remove works.
  - Monogram avatar uses **outline style** (neutral fill, colored ring + colored letters).
  - Monogram palette updated to a **softer** selection (less saturated).
  - Avatar personalization persistence (client-side):
    - `spendnote.user.avatar.v1`
    - `spendnote.user.avatarColor.v1`
    - `spendnote.user.fullName.v1`
  - Nav avatar refresh is robust across pages (waits for auth/nav load).
  - Removed colored ring/border around avatars (neutral border only).

- **Tables (Created by avatar)** ✅
  - Dashboard + Transaction History tables use saved avatar image/color (no hardcoded green SVG).
  - Dashboard falls back to the current user's saved full name when `created_by_user_name` is missing.

- **Duplicate transaction** ✅
  - Duplicate always uses the **current date** (today), not the original transaction date.
  - Duplicate clears receipt/transaction identifier so a **new** one is generated.

- **ID stabilization (display IDs)** ✅
  - Cash Boxes: accept `SN-###` for deep links/filters; resolve to UUID internally.
  - Contacts: accept `CONT-###` for deep links/filters; resolve to UUID internally.
  - Transactions: Transaction Detail accepts `SNx-yyy` and resolves to UUID.
  - Legacy `CB-###` prefix support removed.

- **Permissions / org model (Supabase)** ✅
  - Tables: `orgs`, `org_memberships`, `cash_box_memberships`, `invites`, `audit_log`.
  - Roles: `owner` / `admin` / `user`.
  - Cash box access is enforced via `cash_box_memberships` (admins default to all cash boxes via auto-memberships).
  - Contacts are org-scoped (shared across cash boxes).
  - Invite flow:
    - Create invite via RPC `spendnote_create_invite`.
    - Accept invite via RPC `spendnote_accept_invite`.
    - Frontend accepts `inviteToken` on login/signup and calls accept RPC.
    - User Settings shows pending invites + provides an invite link to copy.

## 2026-02-11 thread summary (canonical)

### Auth (launch readiness) — IN PROGRESS
- Frontend changes (pushed to GitHub):
  - `auth.signUp(email, password, fullName, { emailRedirectTo })` implemented.
  - Signup shows **"check your email"** state when Supabase returns no session.
  - Login handles unconfirmed email errors and offers **Resend confirmation email**.
  - New helper: `auth.resendSignupConfirmation(email, { emailRedirectTo })`.
  - Google OAuth redirects preserve `inviteToken`.
- Supabase manual action: **Confirm sign up / email confirmation enabled** in Dashboard.
- Remaining manual actions:
  - Supabase **URL Configuration**: set Site URL + Additional Redirect URLs for:
    - `/spendnote-login.html`
    - `/spendnote-signup.html`
    - `/dashboard.html`
    - `/spendnote-user-settings.html`

### DEC-TRIAL — COMPLETED (decision)
- Trial ends at **14 days OR 20 transactions** (whichever comes first).
- After limit: **view-only**, **no export**.
- Team invites: **Pro only** (no invites on Free/Standard).

### Team/invites — PARTIAL
- Pending invite UI revoke now hard-deletes invites via RPC (RLS-safe):
  - New `SECURITY DEFINER` function: `public.spendnote_delete_invite(p_invite_id uuid)`
  - Frontend uses the RPC and falls back to direct delete.
  - Status: verified working in UI.

- Invite acceptance v2 (default cash box memberships) was implemented:
  - Migration file: `supabase-migrations/008_accept_invite_v2_default_cashbox_memberships.sql`
  - RPC: `public.spendnote_accept_invite_v2(p_token text)`
    - creates/updates `org_memberships`
    - updates invite status to `active`
    - assigns default `cash_box_memberships`:
      - admin -> all org cash boxes
      - user -> first org cash box
  - Frontend calls v2 with fallback to v1.
  - `inviteToken` is persisted to localStorage and auto-accepted on first valid session.
  - Current issue: invite may still remain `pending`.
    - Likely cause: function deployed without `SET row_security = off` (RLS blocks the update/insert).
    - Recommended fix: redeploy `spendnote_accept_invite_v2` with `SET row_security = off` and re-test.

### Cache-busting
- Multiple pages had `supabase-config.js?v=` bumped to ensure the latest auth/invite logic loads after deploy.

- **Frontend data layer migration** ✅
  - `assets/js/supabase-config.js` updated to rely on RLS (removed client-side `user_id` filtering).
  - `teamMembers` wrapper now reads `org_memberships` + `invites`.
  - `cashBoxAccess` wrapper now reads/writes `cash_box_memberships`.
  - Cache-busting bumped across app pages.

- **RLS recursion hotfix (critical)** ✅
  - Resolved `infinite recursion detected in policy` errors for:
    - `cash_box_memberships`
    - `org_memberships`
  - Fix approach:
    - Drop recursive policies.
    - Recreate policies using `SECURITY DEFINER` helper functions with `row_security = off` to avoid policy loops.

- **Invite email delivery (Edge Function)** ✅
  - Edge Function: `send-invite-email` — fully working, deployed via GitHub Actions.
  - Workflow: `.github/workflows/deploy-supabase-functions.yml`
  - Deployed with `--no-verify-jwt` (function handles auth internally via `auth.getUser()`).
  - Uses Resend API for delivery; FROM address: `invite@spendnote.app` (domain verified in Resend).
  - Invite token security: DB stores only `token_hash` (SHA-256); Edge Function hashes incoming plaintext token before lookup.
  - Client calls Edge Function via manual `fetch` (not `functions.invoke`) to surface concrete error messages from Resend/Edge Function.
  - On email failure, falls back to showing the invite link for manual copy.
  - Required GitHub Secrets:
    - `SUPABASE_ACCESS_TOKEN`
    - `SUPABASE_PROJECT_REF`
  - Required Supabase Edge Functions Secrets:
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `RESEND_API_KEY`
    - `SPENDNOTE_EMAIL_FROM` (e.g. `invite@spendnote.app`)
    - `SPENDNOTE_APP_URL`
    - `SPENDNOTE_INVITE_SUBJECT`

- **Supabase pgcrypto wrappers for invite tokens** ✅
  - Some Supabase projects have `pgcrypto` installed under schema `extensions`, which breaks unqualified calls like `gen_random_bytes(...)` / `digest(text, ...)`.
  - Fixed by enabling `pgcrypto` and adding `public.gen_random_bytes(int)` + `public.digest(text,text)` wrappers.

- **Invite token uniqueness / collision fix** ✅
  - Symptom: `duplicate key value violates unique constraint "invites_org_token_unique"`.
  - Fix: `spendnote_create_invite` RPC rewritten:
    - Generates random token via `gen_random_bytes(24)`, stores `token_hash` (SHA-256 hex), returns plaintext token in `jsonb` response.
    - If pending invite exists for same `org_id + invited_email`, regenerates token and updates existing row.
    - Retries up to 5× on token hash collision.
  - `invites` table columns: `id`, `org_id`, `invited_email`, `role`, `token_hash`, `status`, `created_by`, `accepted_by`, `created_at`, `expires_at`.

## Key decisions / invariants
- **“Unsaved contact” indicator**: keep it minimal in Transaction History.
  - If there is no saved contact/sequence, show **`—`** (no extra `CONT-*` placeholder marker).
- **Profiles vs auth.users**: app tables use `public.profiles(id)` as the user FK (not `auth.users`).

## Useful reference notes
- Detailed recovered notes from the frozen thread:
  - `SESSION-NOTES-2026-01-30.md`

## Recent commits (high level)
- `e00a7ec` Fix A4 receipt: remove 4-item limit in transaction loading section
- `261a67d` Remove 4-item limit on A4 print receipt - show all line items
- `7338406` Change PDF format from Legal to Letter
- `3ebee71` Fix PDF: place receipt at top of page, not centered vertically
- `cdf64b3` Add white background to PDF page and center receipt with margins
- `dd2bf35` Fix PDF export: remove download-mode during capture so receipt is visible
- `55effe9` Fix hidden iframe viewport for PDF download; bump receipt cache params
- `f964a6e` Cash Box Settings: init function on load
- `c3eca8c` Dashboard: use SN-### cash box display code
- `6247202` Print receipt: show date only; remove recorded-by; unify cash box code to SN-###
- `3d23334` Receipts: remove demo placeholders and fix cash box/other id mapping
- `f53ec9c` Transaction Detail: bind receipt controls and previews to Supabase data
- `4ce4d87` Unified Pro badge styling across the app
- `ede2407` Duplicate: always use current date and generate new receipt
- `5fc9f00` Monogram avatars: outline ring + colored initials
- `4487807` Dashboard: created-by avatar fallback uses current user name

## Completed (previously "Next focus")
- ~~**B)** Stabilize core IDs everywhere~~ ✅ (done: canonical URL params, SN-###/CONT-###/SNx-yyy resolution, UUID validation centralized)
- ~~**C)** Contacts list: replace remaining placeholder columns~~ ✅ (done: `spendnote_contacts_stats()` RPC populates #, Boxes, Last Tx)
- ~~**D)** Replace all native `alert()`/`confirm()`/`prompt()` with custom branded modals~~ ✅
  - Created `assets/js/modal-dialogs.js`: Promise-based `showAlert`, `showConfirm`, `showPrompt`
  - Added branded dialog CSS to `assets/css/main.css` (section 13)
  - Replaced ~90+ native dialog calls across 10 JS files + 7 HTML files
  - `modal-dialogs.js` included in all 11 app HTML pages
  - Consistent icon types: info, success, warning, error, danger
  - Destructive confirms use red danger styling; prompts for email, void reason, delete confirmation

## Next focus (pick one)
- Landing polish for public preview (copy, CTA, preview messaging, trust/legal links).
- Add visible contact email on landing (footer + clear `mailto:`) for inbound questions.
- Preview disclaimer UX on landing + signup (signup explicit acceptance).
- GA4 baseline on landing (`page_view` + signup CTA click event) + Search Console setup.
- Onboarding: auto-create a default USD Cash Box (starting balance 0) after signup/first session.
- Build SEO page #1: `petty-cash-log-software` intent page (angle: replace handwritten/duplicate receipt book with searchable digital cash handoff receipts; US keywords: "receipt book", "duplicate receipt book", "carbonless receipt book"; copy + layout + meta + canonical + internal links).
- Build SEO page #2: `cash-handoff-receipt-app` intent page (copy + layout + meta + canonical + internal links).
- After landing is ready: enable indexing for landing + these 2 SEO pages only; keep internal/app pages `noindex`.
- Deploy updated `send-invite-email` Edge Function (reply_to + personalized subject), then monitor inbox placement for 48h.

## Backlog (UX + bugs)
- **High**
  - Optional: add invite resend/revoke actions in UI.
- **High (upcoming)**
  - Permissions & roles (owner/admin/user) + org/team model:
    - Add `orgs` table (explicit org/team).
    - Multi-location (e.g. multiple restaurants) is handled as **multiple orgs**.
    - Add per-cash-box memberships (`cash_box_memberships`) with role per cash box.
    - Admins default to access for **all** cash boxes via auto-created memberships (still enforced via `cash_box_memberships` so it can be restricted later).
    - Contacts are org-level (shared across cash boxes).
    - Implement real invite flow (token/link) and acceptance.
    - No extra notifications for access changes (user sees access appear/disappear in UI).
    - Audit log: owner-only visibility, append-only (immutable) in v1.
    - Enforce access via RLS for cash_boxes / transactions / contacts.
    - Owner-only: subscription + account/cash box delete.
    - Admin: create cash boxes, invite/add users, void transactions.
    - User: record only in cash boxes they are a member of.
- **Medium**
  - Table column widths need adjustment.
  - Navigation underline styling is still inconsistent.
  - "Save to Contacts" checkbox: add a short inline hint ("so you can reuse it later").
- **Low**
  - Footer redesign.
