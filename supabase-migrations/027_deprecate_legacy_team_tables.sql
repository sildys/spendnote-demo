BEGIN;

-- Ensure current atomic delete function does not depend on legacy table.
CREATE OR REPLACE FUNCTION public.spendnote_delete_cash_box(
  p_cash_box_id uuid
)
RETURNS TABLE(success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_cb public.cash_boxes%ROWTYPE;
  v_can_delete boolean := false;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = p_cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF v_cb.user_id = v_actor THEN
    v_can_delete := true;
  ELSE
    SELECT EXISTS(
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = v_cb.org_id
        AND m.user_id = v_actor
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    ) INTO v_can_delete;
  END IF;

  IF NOT coalesce(v_can_delete, false) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.transactions WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_box_memberships WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_boxes WHERE id = p_cash_box_id;

  RETURN QUERY SELECT true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_delete_cash_box(uuid) TO authenticated;

-- Migrate legacy access rows if any still exist.
DO $$
BEGIN
  IF to_regclass('public.cash_box_access') IS NOT NULL THEN
    INSERT INTO public.cash_box_memberships (cash_box_id, user_id, created_at)
    SELECT a.cash_box_id, a.user_id, COALESCE(a.created_at, now())
    FROM public.cash_box_access a
    ON CONFLICT (cash_box_id, user_id) DO NOTHING;
  END IF;
END $$;

-- Drop legacy tables now that org_memberships + cash_box_memberships are canonical.
DROP TABLE IF EXISTS public.cash_box_access CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;

COMMIT;
