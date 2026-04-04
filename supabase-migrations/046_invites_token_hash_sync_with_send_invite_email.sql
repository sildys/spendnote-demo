-- Migration 046: invites.token_hash must match send-invite-email Edge Function lookup
--
-- send-invite-email hashes inviteToken (SHA-256 hex) and selects invites WHERE token_hash = ...
-- spendnote_create_invite only set `token`, so token_hash stayed NULL → 404 → no email, link modal only.

BEGIN;

-- Backfill existing rows (pending invites already created)
UPDATE public.invites i
SET token_hash = encode(public.digest(i.token, 'sha256'), 'hex')
WHERE i.token IS NOT NULL
  AND btrim(i.token) <> ''
  AND (i.token_hash IS NULL OR i.token_hash = '');

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
  v_owner_id    uuid;
  v_seat_count  int;
  v_used_seats  int;
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

  SELECT om.user_id INTO v_owner_id
  FROM public.org_memberships om
  WHERE om.org_id = p_org_id AND lower(om.role) = 'owner'
  LIMIT 1;

  IF v_owner_id IS NOT NULL THEN
    SELECT COALESCE(p.seat_count, 3) INTO v_seat_count
    FROM public.profiles p
    WHERE p.id = v_owner_id;

    IF v_seat_count IS NULL OR v_seat_count < 1 THEN
      v_seat_count := 3;
    END IF;

    SELECT COUNT(*)::int INTO v_used_seats
    FROM (
      SELECT user_id AS uid FROM public.org_memberships WHERE org_id = p_org_id
      UNION
      SELECT NULL FROM public.invites
        WHERE org_id = p_org_id AND status = 'pending' AND invited_email <> v_email
    ) seats;

    IF v_used_seats >= v_seat_count THEN
      RAISE EXCEPTION 'SEAT_LIMIT_REACHED';
    END IF;
  END IF;

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
          expires_at = p_expires_at,
          token_hash = CASE
            WHEN v_invite.token IS NOT NULL AND btrim(v_invite.token) <> '' THEN
              encode(public.digest(v_invite.token, 'sha256'), 'hex')
            ELSE token_hash
          END
      WHERE id = v_invite.id
      RETURNING * INTO v_invite;
    RETURN v_invite;
  END IF;

  FOR i IN 1..5 LOOP
    v_token := encode(public.gen_random_bytes(24), 'hex');
    BEGIN
      INSERT INTO public.invites (org_id, invited_email, role, status, token, token_hash, expires_at)
      VALUES (
        p_org_id,
        v_email,
        v_role,
        'pending',
        v_token,
        encode(public.digest(v_token, 'sha256'), 'hex'),
        p_expires_at
      )
      RETURNING * INTO v_invite;
      RETURN v_invite;
    EXCEPTION WHEN unique_violation THEN
      -- collision, try again
    END;
  END LOOP;

  RAISE EXCEPTION 'Could not generate unique invite token';
END;
$$;

COMMIT;
