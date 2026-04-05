-- 062: Atomic function to re-assign all org data from a departing user to the org owner.
-- Called by delete-account Edge Function BEFORE profile deletion.
-- The balance trigger fires but is harmless: user_id changes don't affect amounts,
-- so OLD.amount - NEW.amount = 0 (net zero balance change).

BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_reassign_org_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT DISTINCT o.id AS org_id, o.owner_user_id
    FROM public.orgs o
    WHERE o.owner_user_id IS NOT NULL
      AND o.owner_user_id <> p_user_id
      AND (
        EXISTS (SELECT 1 FROM public.transactions t WHERE t.user_id = p_user_id AND t.org_id = o.id)
        OR EXISTS (SELECT 1 FROM public.contacts c WHERE c.user_id = p_user_id AND c.org_id = o.id)
        OR EXISTS (SELECT 1 FROM public.cash_boxes cb WHERE cb.user_id = p_user_id AND cb.org_id = o.id)
      )
  LOOP
    UPDATE public.transactions
    SET user_id = rec.owner_user_id
    WHERE user_id = p_user_id
      AND org_id = rec.org_id;

    UPDATE public.contacts
    SET user_id = rec.owner_user_id
    WHERE user_id = p_user_id
      AND org_id = rec.org_id;

    UPDATE public.cash_boxes
    SET user_id = rec.owner_user_id
    WHERE user_id = p_user_id
      AND org_id = rec.org_id;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.spendnote_reassign_org_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spendnote_reassign_org_data(uuid) TO service_role;

COMMIT;
