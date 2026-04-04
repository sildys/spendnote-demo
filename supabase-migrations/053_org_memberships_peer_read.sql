-- 053: Allow org members to read all membership rows in their org.
-- Without this, profiles_read_same_org (JOIN org_memberships m_target) cannot see peer rows,
-- so batch profile fetches only return the current user — team avatars and names stay incomplete.

BEGIN;

DROP POLICY IF EXISTS "Org members can view org peer memberships" ON public.org_memberships;

CREATE POLICY "Org members can view org peer memberships"
ON public.org_memberships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_memberships m
    WHERE m.org_id = org_memberships.org_id
      AND m.user_id = auth.uid()
  )
);

COMMIT;
