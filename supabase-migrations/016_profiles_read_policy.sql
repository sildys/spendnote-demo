-- Allow org members to read each other's minimal profile fields (name, email)
-- so the inviter can see invited members' details on the Team table.

BEGIN;

-- Ensure authenticated can select (RLS will still apply)
GRANT SELECT ON public.profiles TO authenticated;

-- Policy: a user can read their own profile
CREATE POLICY IF NOT EXISTS profiles_read_self
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: org members can read profiles of other users in the same org
CREATE POLICY IF NOT EXISTS profiles_read_same_org
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.org_memberships AS m_self
    JOIN public.org_memberships AS m_target
      ON m_target.org_id = m_self.org_id
    WHERE m_self.user_id = auth.uid()
      AND m_target.user_id = profiles.id
  )
);

COMMIT;
