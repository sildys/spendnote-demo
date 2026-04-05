-- 060: When a member is removed from an org (org_memberships DELETE),
-- automatically revoke all their cash_box_memberships for that org's cash boxes
-- AND delete any personal (solo) cash boxes that have zero balance and no real transactions.
-- This guarantees cleanup regardless of which client code triggered the removal.

BEGIN;

CREATE OR REPLACE FUNCTION public.trg_cleanup_after_org_member_remove()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1) Revoke all cash_box_memberships for cash boxes belonging to the removed member's org.
  DELETE FROM public.cash_box_memberships
  WHERE user_id = OLD.user_id
    AND cash_box_id IN (
      SELECT id FROM public.cash_boxes WHERE org_id = OLD.org_id
    );

  -- 2) Delete personal (solo) cash boxes that are empty and have no real transactions.
  --    "Real" = non-system rows (is_system IS NULL OR is_system = false).
  DELETE FROM public.cash_boxes cb
  WHERE cb.user_id = OLD.user_id
    AND cb.org_id IS NULL
    AND cb.current_balance = 0
    AND NOT EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.cash_box_id = cb.id
        AND coalesce(t.is_system, false) = false
    );

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_after_org_member_remove ON public.org_memberships;
CREATE TRIGGER cleanup_after_org_member_remove
  AFTER DELETE ON public.org_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_cleanup_after_org_member_remove();

COMMIT;
