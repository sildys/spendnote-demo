-- Migration 030: Version the invites table + spendnote_create_invite RPC
-- These existed in the live DB (created via README snippets / early manual setup)
-- but were never captured in a versioned migration file.
-- This migration is fully idempotent (CREATE TABLE IF NOT EXISTS, etc.).

BEGIN;

-- ============================================================
-- 1) invites table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  role        text NOT NULL DEFAULT 'user'
                CHECK (lower(role) IN ('owner', 'admin', 'user')),
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'accepted', 'expired', 'cancelled')),
  token       text,
  token_hash  text,
  accepted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Ensure status constraint is up to date (014 already did this on live DBs;
-- the IF NOT EXISTS above means on a fresh DB the constraint is already correct).
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE public.invites
  ADD CONSTRAINT invites_status_check
  CHECK (status IN ('pending', 'active', 'accepted', 'expired', 'cancelled'));

-- Indexes
CREATE INDEX IF NOT EXISTS invites_org_id_idx         ON public.invites (org_id);
CREATE INDEX IF NOT EXISTS invites_invited_email_idx  ON public.invites (lower(invited_email));
CREATE INDEX IF NOT EXISTS invites_token_hash_idx     ON public.invites (token_hash);

-- ============================================================
-- 2) RLS
-- ============================================================
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Owner/Admin of the org can view all invites for that org
DROP POLICY IF EXISTS "invites_org_admin_select" ON public.invites;
CREATE POLICY "invites_org_admin_select" ON public.invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.org_id = invites.org_id
        AND m.user_id = auth.uid()
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

-- Owner/Admin can insert invites
DROP POLICY IF EXISTS "invites_org_admin_insert" ON public.invites;
CREATE POLICY "invites_org_admin_insert" ON public.invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.org_id = invites.org_id
        AND m.user_id = auth.uid()
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

-- Owner/Admin can update invites (e.g. role change, revoke)
DROP POLICY IF EXISTS "invites_org_admin_update" ON public.invites;
CREATE POLICY "invites_org_admin_update" ON public.invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.org_id = invites.org_id
        AND m.user_id = auth.uid()
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

-- Owner/Admin can delete/revoke invites
DROP POLICY IF EXISTS "invites_org_admin_delete" ON public.invites;
CREATE POLICY "invites_org_admin_delete" ON public.invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.org_id = invites.org_id
        AND m.user_id = auth.uid()
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 3) spendnote_create_invite RPC
--    • If pending invite already exists for org+email → refresh token + role
--    • Otherwise insert new row; retry up to 5× on token collision
-- ============================================================
CREATE OR REPLACE FUNCTION public.spendnote_create_invite(
  p_org_id       uuid,
  p_invited_email text,
  p_role         text,
  p_expires_at   timestamptz
)
RETURNS public.invites
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid         uuid;
  v_member_role text;
  v_email       text;
  v_role        text;
  v_token       text;
  v_invite      public.invites;
  i             int;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_email := lower(trim(coalesce(p_invited_email, '')));
  IF v_email = '' THEN
    RAISE EXCEPTION 'Missing invited email';
  END IF;

  v_role := CASE WHEN lower(coalesce(p_role, '')) = 'admin' THEN 'admin' ELSE 'user' END;

  SELECT role INTO v_member_role
  FROM public.org_memberships
  WHERE org_id = p_org_id AND user_id = v_uid
  LIMIT 1;

  IF v_member_role IS NULL OR lower(v_member_role) NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Reuse existing pending invite for this org+email
  SELECT * INTO v_invite
  FROM public.invites
  WHERE org_id = p_org_id
    AND invited_email = v_email
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invite.id IS NOT NULL THEN
    UPDATE public.invites
      SET role       = v_role,
          expires_at = p_expires_at
      WHERE id = v_invite.id
      RETURNING * INTO v_invite;
    RETURN v_invite;
  END IF;

  -- New invite: retry up to 5× on token collision
  FOR i IN 1..5 LOOP
    v_token := encode(public.gen_random_bytes(24), 'hex');
    BEGIN
      INSERT INTO public.invites (org_id, invited_email, role, status, token, expires_at)
      VALUES (p_org_id, v_email, v_role, 'pending', v_token, p_expires_at)
      RETURNING * INTO v_invite;
      RETURN v_invite;
    EXCEPTION WHEN unique_violation THEN
      -- collision, try again
    END;
  END LOOP;

  RAISE EXCEPTION 'Could not generate unique invite token';
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_create_invite(uuid, text, text, timestamptz) TO authenticated;

COMMIT;
