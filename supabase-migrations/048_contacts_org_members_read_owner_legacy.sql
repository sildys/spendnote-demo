-- Let org members read contacts owned by the org owner when org_id was never set (legacy rows),
-- so invited users share the same contact list as the workspace owner.

BEGIN;

DROP POLICY IF EXISTS "Contacts read org owner legacy rows" ON public.contacts;

CREATE POLICY "Contacts read org owner legacy rows"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orgs o
    INNER JOIN public.org_memberships m
      ON m.org_id = o.id
     AND m.user_id = auth.uid()
    WHERE o.owner_user_id = contacts.user_id
      AND contacts.org_id IS NULL
  )
);

COMMIT;
