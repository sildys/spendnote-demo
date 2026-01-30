# Progress (canonical)

This is the **single canonical “where we are”** file.

If a chat thread freezes / context is lost: in the new thread say:
- **“Read `PROGRESS.md` and continue from there.”**

## Current state (last updated: 2026-01-30)
- **Dashboard**
  - Transaction modal works again (fixed duplicate modal JS load + ensured submit handler binds).
  - **Save to Contacts** toggle exists (no auto-save by default).
  - **Prevents negative cash box balance** on expense (UI-side check).
  - Save to Contacts checkbox uses theme accent (not red).
- **Contacts**
  - Contacts list + detail are wired to Supabase.
  - UI shows **Contact ID as `CONT-###`** using `sequence_number`.
  - Contacts list **View column + bottom pagination** aligned with Transaction History UI.
- **Transaction History**
  - Contact ID column is intentionally minimal: **shows `—`** when there is no saved contact sequence.

## Key decisions / invariants
- **“Unsaved contact” indicator**: keep it minimal in Transaction History.
  - If there is no saved contact/sequence, show **`—`** (no extra `CONT-*` placeholder marker).
- **Profiles vs auth.users**: app tables use `public.profiles(id)` as the user FK (not `auth.users`).

## Useful reference notes
- Detailed recovered notes from the frozen thread:
  - `SESSION-NOTES-2026-01-30.md`

## Recent commits (high level)
- `b407890` Add session notes (2026-01-30)
- `060be6e` Contacts: align View action + paginator with transaction history
- `12f6f9f` Contacts: show/search CONT-### and wire list/detail to Supabase
- `e266fc6` Prevent negative cash box balance; fix Save to Contacts checkbox color
- `d3e9ee0` Fix dashboard modal JS load (remove duplicate modal script) and bind submit handler

## Next focus (pick one)
- **A)** Implement end-to-end transaction create flow + robust error handling (Supabase insert + balance update)
- **B)** Stabilize core IDs everywhere (cash_box_id/contact_id selection + filters + validation)
- **C)** Contacts list: replace remaining placeholder columns (boxes / #tx / last tx) with real values
