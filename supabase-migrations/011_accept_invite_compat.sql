BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_accept_invite(
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN public.spendnote_accept_invite_v2(p_token);
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_accept_invite(text) TO authenticated;

COMMIT;
