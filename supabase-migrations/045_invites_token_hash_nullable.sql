-- Migration 045: allow NULL token_hash (app + spendnote_create_invite use `token` only)
--
-- Legacy invites tables sometimes had token_hash NOT NULL. The RPC inserts
-- (org_id, invited_email, role, status, token, expires_at) and does not set token_hash,
-- which triggers: null value in column "token_hash" violates not-null constraint

BEGIN;

ALTER TABLE public.invites
  ALTER COLUMN token_hash DROP NOT NULL;

COMMIT;
