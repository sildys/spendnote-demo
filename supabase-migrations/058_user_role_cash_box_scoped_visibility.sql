-- 058: User role scoped visibility — users with role='user' in org_memberships
-- can only see cash_boxes, transactions, and contacts for cash boxes they are
-- explicitly assigned to via cash_box_memberships.
-- Owner and Admin roles continue to see all org data.

BEGIN;

-- Helper: returns cash_box_ids the current user is assigned to via cash_box_memberships.
-- SECURITY DEFINER avoids RLS recursion when used inside policies.
CREATE OR REPLACE FUNCTION public.spendnote_my_assigned_cash_box_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT cbm.cash_box_id
  FROM public.cash_box_memberships cbm
  WHERE cbm.user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.spendnote_my_assigned_cash_box_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spendnote_my_assigned_cash_box_ids() TO authenticated;

-- Helper: returns true if the user is owner or admin in ANY org they belong to.
-- Used to short-circuit the cash_box_memberships check for privileged roles.
CREATE OR REPLACE FUNCTION public.spendnote_is_org_owner_or_admin(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_memberships m
    WHERE m.org_id = p_org_id
      AND m.user_id = auth.uid()
      AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.spendnote_is_org_owner_or_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spendnote_is_org_owner_or_admin(uuid) TO authenticated;

-- ── transactions SELECT ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Transactions org-aware select" ON public.transactions;

CREATE POLICY "Transactions org-aware select" ON public.transactions FOR SELECT USING (
  auth.uid() = user_id
  OR (
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

-- ── cash_boxes SELECT ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Cash boxes org-aware select" ON public.cash_boxes;

CREATE POLICY "Cash boxes org-aware select" ON public.cash_boxes FOR SELECT USING (
  auth.uid() = user_id
  OR (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = cash_boxes.org_id
        AND m.user_id = auth.uid()
    )
    AND (
      -- Owner/Admin see all org cash boxes
      public.spendnote_is_org_owner_or_admin(cash_boxes.org_id)
      OR
      -- User role: only assigned cash boxes
      cash_boxes.id IN (SELECT public.spendnote_my_assigned_cash_box_ids())
    )
  )
);

-- ── contacts SELECT ──────────────────────────────────────────────────────
-- Contacts are org-wide, but User role should only see contacts if they have
-- at least one assigned cash box in the org (i.e., they are active in the org).

DROP POLICY IF EXISTS "Contacts org-aware select" ON public.contacts;

CREATE POLICY "Contacts org-aware select" ON public.contacts FOR SELECT USING (
  auth.uid() = user_id
  OR (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = contacts.org_id
        AND m.user_id = auth.uid()
    )
    AND (
      -- Owner/Admin see all org contacts
      public.spendnote_is_org_owner_or_admin(contacts.org_id)
      OR
      -- User role: only if they have at least one assigned cash box in this org
      EXISTS (
        SELECT 1
        FROM public.cash_box_memberships cbm
        JOIN public.cash_boxes cb ON cb.id = cbm.cash_box_id
        WHERE cbm.user_id = auth.uid()
          AND cb.org_id = contacts.org_id
      )
    )
  )
);

COMMIT;
