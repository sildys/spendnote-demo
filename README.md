# SpendNote (demo)

SpendNote is a **cash box + transaction + contacts** web app.

- Frontend: **static HTML/CSS/JavaScript** (no framework)
- Backend: **Supabase** (Auth + Postgres + RLS)

This repository is meant to be deployable as a static site (e.g. Vercel).

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
- [ ] **DEC-TRIAL** Trial without card upfront: confirm trial model (14 days and/or 20 receipts) + what happens at limit (read-only vs lock)
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
- [ ] **M1** Mobile strategy + responsive MVP: maximize mobile functionality; tables → cards/collapsible, off-canvas filters (decide exclusions during build)
- [ ] **S1** Subscription rules spec: trial model (14 days and/or 20 receipts), expiry behavior, receipt/user limits, data handling on user delete (matrix)
- [ ] **S2** Stripe prep (ready to plug in): subscription state data model + feature flags + UI placeholders + webhook handling plan
- [ ] **DEPLOY-1** Migration plan: move from Vercel/demo domain to Cloudflare on `spendnote.app` (hosting target, caching rules)
- [ ] **DEPLOY-2** Cloudflare DNS + SSL + redirects: decide canonical host (`spendnote.app` vs `www`), configure 301s and safe HSTS
- [ ] **DEPLOY-3** Supabase for new domain: update Site URL + allowed redirect URLs; test login/signup/invite flows on `spendnote.app`
- [ ] **DEPLOY-4** Cutover rehearsal + go-live checklist: staging URL, smoke tests, rollback plan
- [ ] **S3** Stripe integration: checkout, customer portal, webhooks, live mode rollout + enforcement activation
- [ ] **O1** Google OAuth (later): Supabase OAuth + account linking rules + UX
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
  - Receipt templates are implemented (A4/PDF/Email).
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

- Print (A4, 2 copies): `spendnote-receipt-a4-two-copies.html`
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
- **Print (A4)**:
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

- Contacts cash box filtering / cash box ID handling is not finished yet.
- Team features (members/roles/cash box access) are not finished yet.

Additional UX/bug backlog:

- Dashboard modal: cash box selection does not propagate correctly.
- Table column widths need adjustment.
- "Save to Contacts" checkbox: add a short inline hint ("so you can reuse it later").
- Footer redesign.

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
- Most app pages include `assets/js/auth-guard.js` which redirects to `spendnote-login.html` when not authenticated.

### Receipt templates

- Receipt templates are fully wired to load transaction data from Supabase:
  - `spendnote-pdf-receipt.html`
  - `spendnote-email-receipt.html`
  - `spendnote-receipt-a4-two-copies.html`
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
  - `send-receipt-email` — receipt email delivery
- Both use Resend API with the verified `spendnote.app` domain.

Required GitHub Secrets:

- `SUPABASE_ACCESS_TOKEN` (Supabase personal access token)
- `SUPABASE_PROJECT_REF` (Supabase project ref)

Required Supabase Edge Functions Secrets (set in Supabase Dashboard):

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `SPENDNOTE_EMAIL_FROM` (e.g. `invite@spendnote.app` — domain must be verified in Resend)
- `SPENDNOTE_APP_URL` (public app base URL used in invite links)
- `SPENDNOTE_INVITE_SUBJECT`

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
