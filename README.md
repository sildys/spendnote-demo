# SpendNote (demo)

SpendNote is a **cash box + transaction + contacts** web app.

- Frontend: **static HTML/CSS/JavaScript** (no framework)
- Backend: **Supabase** (Auth + Postgres + RLS)

This repository is meant to be deployable as a static site (e.g. Vercel).

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

- cash box (must be a valid UUID)
- direction (IN/OUT)
- contact name (required to produce a receipt)
- description (required)
- amount (required, > 0)

#### Optional fields

- contact address (optional; if provided it is stored on the transaction snapshot)
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
- Current status: transaction saving is implemented, but receipt generation/printing is not fully implemented yet.

#### Receipt number (display ID)

- Every transaction has a receipt number / display ID that appears in:
  - Transaction History
  - Transaction Detail
  - all receipt outputs (print / PDF / email)
- Format is based on cash box number + transaction sequence within the cash box:
  - default prefix (SpendNote branding): `SN{cash_box_sequence}-{tx_sequence_in_box}` (example: `SN3-007`)
- Pro: cash boxes can fully override the prefix (`cash_boxes.id_prefix`), so the receipt identifier does not have to start with `SN`.

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

#### Mandatory legal disclaimer (immutable)

- Every receipt must include a mandatory legal disclaimer stating it is **cash handoff documentation only** and **not a tax/accounting document**.
- This disclaimer is **not customizable**:
  - it cannot be removed
  - it cannot be hidden via toggles
  - it cannot be edited (even in Pro)

### Current gaps / not implemented yet

- **Done & Print flow**: the dashboard modal "Done & Print" button saves the transaction but does not yet open the receipt for printing.
- Dashboard "Latest Transactions" is loaded from Supabase.
- Contacts cash box filtering / cash box ID handling is not finished yet.
- Team features (members/roles/cash box access) are not finished yet.

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

### Important security note

- Browser code must only use the **anon/public key**.
- Never put a Supabase **service role key** into this repo.

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
- Policies typically enforce ownership via `auth.uid() = user_id`.

### Stable display IDs

- Contacts: `contacts.sequence_number` -> `CONT-###`
- Transactions: receipts are expected to have a stable receipt identifier (for example `transactions.receipt_number`, and/or sequence fields like `cash_box_sequence`, `tx_sequence_in_box`).

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
- **“No authenticated user” in console**
  - You are not logged in, or session expired (expected when tab/browser closed).
- **Foreign key / RLS errors on inserts**
  - Ensure a `public.profiles` row exists for the auth user.

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
