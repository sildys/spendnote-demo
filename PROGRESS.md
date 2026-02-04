# Progress (canonical)

This is the **single canonical “where we are”** file.

If a chat thread freezes / context is lost: in the new thread say:
- **“Read `PROGRESS.md` and continue from there.”**

## AI assistant guidance

- Keep responses minimal and task-focused.
- Prefer implementing fixes over explaining them.
- Avoid long explanations, hedging, or repetitive confirmations.
- Be professional and forward-looking (anticipate edge cases, choose robust solutions).

## Current state (last updated: 2026-02-04 02:07)
- **Dashboard**
  - Transaction modal works again (fixed duplicate modal JS load + ensured submit handler binds).
  - **Save to Contacts** toggle exists (no auto-save by default).
  - **Prevents negative cash box balance** on expense (UI-side check).
  - Save to Contacts checkbox uses theme accent (not red).
  - Cash box cards display **`SN-###`** from `cash_boxes.sequence_number` (not derived index).
- **Contacts**
  - Contacts list + detail are wired to Supabase.
  - UI shows **Contact ID as `CONT-###`** using `sequence_number`.
  - Contacts list **View column + bottom pagination** aligned with Transaction History UI.
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
- **Cash Box pages**
  - Cash Box Detail: loads from Supabase (UUID id param), displays `SN-###` code.
  - Cash Box Settings: loads cash box data, displays `SN-###` in subtitle.
  - Cash Box Settings: receipt preview uses demo data (A4/PDF/Email) and respects quick/detailed + toggles.
  - Cash Box Settings: receipt preview layout/height + zoom behavior matches Transaction Detail.
  - Cash Box Settings: removed inline `onclick` handlers (bindings live in JS).
  - Cash Box Settings: Danger Zone hard delete implemented (shows transaction count, requires typing `DELETE`, deletes cash box + cascaded transactions).
  - Cash Box List: delete modal subtitle ready for dynamic data.
  - Cash Box List: shows per-cash-box transaction count (active, non-system).

- **Navigation** ✅
  - Active page menu item is underlined.
  - Active page detection works for pretty URLs (e.g. `/dashboard` as well as `dashboard.html`).

## Key decisions / invariants
- **“Unsaved contact” indicator**: keep it minimal in Transaction History.
  - If there is no saved contact/sequence, show **`—`** (no extra `CONT-*` placeholder marker).
- **Profiles vs auth.users**: app tables use `public.profiles(id)` as the user FK (not `auth.users`).

## Useful reference notes
- Detailed recovered notes from the frozen thread:
  - `SESSION-NOTES-2026-01-30.md`

## Recent commits (high level)
- `f964a6e` Cash Box Settings: init function on load
- `c3eca8c` Dashboard: use SN-### cash box display code
- `6247202` Print receipt: show date only; remove recorded-by; unify cash box code to SN-###
- `3d23334` Receipts: remove demo placeholders and fix cash box/other id mapping
- `f53ec9c` Transaction Detail: bind receipt controls and previews to Supabase data
- `4ce4d87` Unified Pro badge styling across the app
- `b407890` Add session notes (2026-01-30)
- `a960cf9` Fix Transaction History crash (void fields)
- `bcf4bc7` Fix Transaction History query for legacy is_system null
- `e727ef3` Fallback when void columns missing in transactions select
- `ba3ebf6` UX: History nav unfiltered; Transaction Detail void metadata + styling
- `f1b2b74` Receipts: show VOID watermark in templates
- `275b5fc` Quick receipt: single row equals total
- `f24facc` Quick receipt: keep 5-row grid, fill only first row
- `40d9127` Quick receipt: single item mode + show receipt id by default
- `460556c` Settings demo receipt: cash-only copy + single-line addresses + toggles
- `77d489e` Docs: add UX/bug backlog items
- `b824e8b` Docs: reflect receipt preview + quick receipt changes
- `983150d` Cash Box Settings: hard delete with tx count confirmation
 - `50772d8` Cash Box Settings: remove inline onclick handlers
 - `8b4826f` Cash Box Settings: match receipt preview iframe height
 - `23ad8c8` Cash Box Settings: fix receipt preview zoom
 - `2d19b05` Cash Box Settings: align preview zoom with transaction detail
 - `439758a` Cash Box Settings: match receipt layout CSS with transaction detail

## Next focus (pick one)
- **A)** Implement end-to-end transaction create flow + robust error handling (Supabase insert + balance update)
- **B)** Stabilize core IDs everywhere (cash_box_id/contact_id selection + filters + validation)
- **C)** Contacts list: replace remaining placeholder columns (boxes / #tx / last tx) with real values
- **D)** Receipt "Done & Print" flow: wire the dashboard modal to open the receipt after saving a transaction

## Backlog (UX + bugs)
- **High**
  - Dashboard modal: cash box selection does not propagate to the dashboard state.
  - CSV export still uses internal IDs instead of display IDs.
- **Medium**
  - Avatar image should not show a colored highlight/ring.
  - Table column widths need adjustment.
  - Navigation underline styling is still inconsistent.
  - "Save to Contacts" checkbox: add a short inline hint ("so you can reuse it later").
- **Low**
  - Footer redesign.
