-- 059: Tighten transactions SELECT — if a transaction belongs to an org,
-- the user_id match alone is NOT enough. The user must also pass the
-- org+cash_box_memberships check. This ensures that after revoking a
-- member's cash box access, they can no longer see even their own
-- org transactions. Solo (non-org) transactions remain visible via user_id.

BEGIN;

DROP POLICY IF EXISTS "Transactions org-aware select" ON public.transactions;

CREATE POLICY "Transactions org-aware select" ON public.transactions FOR SELECT USING (
  -- Solo transactions (no org): user_id match is sufficient
  (org_id IS NULL AND auth.uid() = user_id)
  OR
  -- Org transactions: must be org member + role-based cash box check
  (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = transactions.org_id
        AND m.user_id = auth.uid()
    )
    AND (
      -- Owner/Admin see all org transactions
      public.spendnote_is_org_owner_or_admin(transactions.org_id)
      OR
      -- User role: only transactions on assigned cash boxes
      transactions.cash_box_id IN (SELECT public.spendnote_my_assigned_cash_box_ids())
    )
  )
);

COMMIT;
