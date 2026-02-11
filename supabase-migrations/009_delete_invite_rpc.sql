BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_delete_invite(
  p_invite_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_uid uuid;
  v_org_id uuid;
  v_role text;
  v_deleted uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT org_id INTO v_org_id
  FROM public.invites
  WHERE id = p_invite_id
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite not found');
  END IF;

  SELECT role INTO v_role
  FROM public.org_memberships
  WHERE org_id = v_org_id AND user_id = v_uid
  LIMIT 1;

  IF lower(coalesce(v_role, '')) NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  DELETE FROM public.invites
  WHERE id = p_invite_id
  RETURNING id INTO v_deleted;

  IF v_deleted IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite not deleted');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', v_deleted);
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_delete_invite(uuid) TO authenticated;

COMMIT;
