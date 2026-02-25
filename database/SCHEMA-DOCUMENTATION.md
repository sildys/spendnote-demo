# SpendNote Database Schema Documentation

## Overview
This document describes the complete database schema for the SpendNote application.

## Tables

### 1. `profiles` (User Accounts)
Extends Supabase Auth with additional user data and subscription info.

**Fields:**
- `id` (UUID, PK) - References auth.users
- `email` (TEXT, UNIQUE, NOT NULL)
- `full_name` (TEXT, NOT NULL)
- `company_name` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `account_logo_url` (TEXT) - Default logo for receipts
- `avatar_url` (TEXT) - Profile avatar image
- `avatar_settings` (JSONB) - Profile avatar editor state `{scale,x,y}`
- `avatar_color` (TEXT) - Monogram accent color
- `subscription_tier` (TEXT) - 'free', 'standard', or 'pro'
- `stripe_customer_id` (TEXT)
- `stripe_subscription_id` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Subscription Limits:**
- **Free**: 1 cash box, 1 user
- **Standard**: 2 cash boxes, 1 user
- **Pro**: Unlimited cash boxes, 3 users included (additional users paid)

---

### 2. `cash_boxes` (Cash Registers)
Stores cash box information with full receipt customization.

**Fields:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `name` (TEXT, NOT NULL)
- `currency` (TEXT, DEFAULT 'USD')
- `color` (TEXT, DEFAULT '#10b981') - 8 colors available
- `icon` (TEXT, DEFAULT 'building') - 16 icons available
- `id_prefix` (TEXT, DEFAULT 'REC-') - PRO feature
- `current_balance` (DECIMAL) - Starts at 0, updated by transactions

**Receipt Settings (Standard+):**
- `receipt_show_logo` (BOOLEAN)
- `receipt_show_addresses` (BOOLEAN)
- `receipt_show_tracking` (BOOLEAN)
- `receipt_show_additional` (BOOLEAN)
- `receipt_show_note` (BOOLEAN)
- `receipt_show_signatures` (BOOLEAN)

**Receipt Custom Text (Pro only):**
- `receipt_title` (TEXT)
- `receipt_total_label` (TEXT)
- `receipt_from_label` (TEXT)
- `receipt_to_label` (TEXT)
- `receipt_description_label` (TEXT)
- `receipt_amount_label` (TEXT)
- `receipt_notes_label` (TEXT)
- `receipt_issued_by_label` (TEXT)
- `receipt_received_by_label` (TEXT)
- `receipt_footer_note` (TEXT)

**Cash Box Logo (Pro only):**
- `cash_box_logo_url` (TEXT) - Overrides account logo

**Other:**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### 3. `contacts` (Contact Directory)
Stores contact information for transactions.

**Fields:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `name` (TEXT, NOT NULL)
- `email` (TEXT)
- `phone` (TEXT)
- `address` (TEXT)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Auto-generated when:**
- Manually added in Contacts menu
- Automatically created when new name entered in transaction

---

### 4. `transactions` (Cash Transactions)
Stores all cash in/out transactions with contact snapshots.

**Fields:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `cash_box_id` (UUID, FK → cash_boxes)
- `contact_id` (UUID, FK → contacts, nullable)
- `type` (TEXT) - 'income' or 'expense'
- `amount` (DECIMAL, > 0)
- `description` (TEXT) - 5-line description field
- `notes` (TEXT) - Separate notes field
- `transaction_date` (DATE)
- `receipt_number` (TEXT)

**Contact Snapshot (for receipt regeneration):**
- `contact_name` (TEXT, NOT NULL)
- `contact_email` (TEXT)
- `contact_phone` (TEXT)
- `contact_address` (TEXT)
- `contact_custom_field_1` (TEXT)
- `contact_custom_field_2` (TEXT)

**Team Tracking:**
- `created_by_user_id` (UUID, FK → profiles)
- `created_by_user_name` (TEXT)

**Timestamps:**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Balance Update:**
- Automatically updates `cash_boxes.current_balance` via trigger

---

### 5. `orgs` (Organization)
Stores workspace/team entity.

**Fields:**
- `id` (UUID, PK)
- `name` (TEXT)
- `owner_user_id` (UUID, FK → profiles)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### 6. `org_memberships` (User Role in Org)
Maps users to organizations with roles.

**Fields:**
- `org_id` (UUID, FK → orgs)
- `user_id` (UUID, FK → profiles)
- `role` (TEXT) - 'owner', 'admin', or 'user'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

### 7. `invites` (Team Invitations)
Stores pending and accepted team invitations. Invite tokens are stored as plaintext (`token`) and their SHA-256 hash (`token_hash`) for lookup. The `send-invite-email` Edge Function uses the hash to validate tokens without exposing plaintext.

**Fields:**
- `id` (UUID, PK)
- `org_id` (UUID, FK → orgs)
- `invited_email` (TEXT) — lowercase-normalised target email
- `role` (TEXT) — 'owner', 'admin', or 'user'
- `status` (TEXT) — 'pending', 'active', 'accepted', 'expired', 'cancelled'
- `token` (TEXT) — plaintext invite token (returned to caller once)
- `token_hash` (TEXT) — SHA-256 hex of token, used for secure lookup
- `accepted_by` (UUID, FK → profiles, SET NULL on delete)
- `expires_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)

**Access Control:**
- Owner/Admin can SELECT, INSERT, UPDATE, DELETE invites for their org
- Accept/auto-accept RPCs run as SECURITY DEFINER, bypassing client RLS

**Related RPCs:**
- `spendnote_create_invite` — creates or refreshes a pending invite, returns the row
- `spendnote_accept_invite_v2` — accepts by token hash, creates `org_memberships` row
- `spendnote_auto_accept_my_invites` — accepts all pending invites matching the auth user's email
- `spendnote_delete_invite` — Owner/Admin hard-delete of an invite row

---

### 8. `cash_box_memberships` (Per-cash-box access)
Controls which users can access which cash boxes.

**Fields:**
- `cash_box_id` (UUID, FK → cash_boxes)
- `user_id` (UUID, FK → profiles)
- `created_at` (TIMESTAMP)

**Access Control:**
- Owner/Admin can manage access
- User sees assigned cash boxes only

---

### 9. `audit_log` (Audit Trail)
Append-only log of critical org-level events. Owner-only read access.

**Fields:**
- `id` (UUID, PK)
- `org_id` (UUID, FK → orgs)
- `actor_id` (UUID, FK → auth.users, SET NULL on delete)
- `action` (TEXT) — event key, e.g. `transaction.void`, `cash_box.delete`, `member.role_change`, `member.remove`
- `target_type` (TEXT) — entity type, e.g. `transaction`, `cash_box`, `user`
- `target_id` (UUID) — entity id
- `meta` (JSONB) — event-specific payload
- `created_at` (TIMESTAMPTZ)

**Access Control:**
- Owner-only SELECT via RLS
- No direct INSERT/UPDATE/DELETE for clients — writes via SECURITY DEFINER functions only

---

### Legacy note
`team_members` and `cash_box_access` are deprecated legacy tables and no longer part of the canonical model.

---

## Triggers

### 1. `update_updated_at_column()`
Automatically updates `updated_at` timestamp on UPDATE for:
- profiles
- cash_boxes
- contacts
- transactions

### 2. `update_cash_box_balance()`
Automatically updates `cash_boxes.current_balance` when:
- Transaction inserted: Add/subtract amount
- Transaction updated: Revert old, apply new
- Transaction deleted: Revert amount

### 3. `handle_new_user()`
Automatically creates profile when user signs up via Supabase Auth.

### 4. `audit_org_membership_change()`
Writes to `audit_log` when an `org_memberships` row is updated (role change) or deleted (member remove).

---

## Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users only see data in organizations where they have membership
- Owner/Admin can manage org-scoped resources
- Cash box-level access is controlled by `cash_box_memberships`

---

## Indexes

Optimized indexes for:
- User lookups
- Cash box queries
- Transaction filtering by date, type, cash box
- Contact searches by name

---

## Receipt Data Flow

When generating a receipt:
1. **Owner data**: From `profiles` (name, address, email, phone)
2. **Logo**: `cash_boxes.cash_box_logo_url` OR `profiles.account_logo_url`
3. **Contact data**: From transaction's contact snapshot fields
4. **Receipt settings**: From `cash_boxes.receipt_*` fields
5. **Custom text**: From `cash_boxes.receipt_*_label` fields (Pro only)

**Why contact snapshot?**
- Allows receipt regeneration even if contact info changes
- Preserves historical accuracy
