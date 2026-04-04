-- Migration 044: invites.token (and related) on legacy databases
--
-- Some environments created public.invites before migration 030. Because 030 uses
-- CREATE TABLE IF NOT EXISTS, those tables never gained `token`, and
-- spendnote_create_invite fails with:
--   column "token" of relation "invites" does not exist
--
-- This migration is safe to run on fresh DBs (IF NOT EXISTS).

BEGIN;

ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS token_hash text;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS invites_token_hash_idx ON public.invites (token_hash);
CREATE INDEX IF NOT EXISTS idx_invites_token_hash ON public.invites (token_hash);

COMMIT;
