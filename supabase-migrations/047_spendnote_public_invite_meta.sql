-- Public read of invite email for /invite/{token} landing (token is high-entropy; no org secrets returned).
BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_public_invite_meta(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_t text;
  v_hash text;
  v_email text;
  v_role text;
BEGIN
  v_t := trim(coalesce(p_token, ''));
  IF length(v_t) < 20 THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  v_hash := encode(public.digest(v_t, 'sha256'), 'hex');

  SELECT lower(trim(i.invited_email)), i.role::text
  INTO v_email, v_role
  FROM public.invites i
  WHERE i.status = 'pending'
    AND (i.token = v_t OR i.token_hash = v_hash)
  LIMIT 1;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'invited_email', v_email,
    'role', coalesce(nullif(trim(v_role), ''), 'user')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_public_invite_meta(text) TO anon, authenticated;

COMMIT;
