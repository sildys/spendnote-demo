-- 054: Fix deployments that applied the original 053 (subquery on org_memberships → infinite RLS recursion).
-- Symptom: empty dashboard, no cash boxes, Team stuck / upgrade modal, org APIs fail.
-- Safe to run even if 053 was already the SECURITY DEFINER version (idempotent).

BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_my_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT m.org_id FROM public.org_memberships m WHERE m.user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.spendnote_my_org_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spendnote_my_org_ids() TO authenticated;

DROP POLICY IF EXISTS "Org members can view org peer memberships" ON public.org_memberships;

CREATE POLICY "Org members can view org peer memberships"
ON public.org_memberships
FOR SELECT
TO authenticated
USING (org_id IN (SELECT public.spendnote_my_org_ids()));

COMMIT;
