BEGIN;

-- Ensure profile is created/updated during invite accept (v2)
CREATE OR REPLACE FUNCTION public.spendnote_accept_invite_v2(
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_hash text;
  v_invite public.invites;
  v_role text;
  v_org_id uuid;
  v_first_box_id uuid;
  v_now timestamptz := now();
  v_claims jsonb;
  v_full_name text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_claims := (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}'))::jsonb;

  SELECT lower(trim(coalesce(p.email, v_claims ->> 'email')))
    INTO v_email
  FROM public.profiles p
  WHERE p.id = v_uid
  LIMIT 1;

  IF v_email IS NULL OR v_email = '' THEN
    v_email := lower(trim(coalesce(v_claims ->> 'email', '')));
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Email missing';
  END IF;

  -- Derive a reasonable full name
  v_full_name := nullif(trim(coalesce(v_claims ->> 'full_name', v_claims ->> 'name', '')), '');

  -- Ensure profile exists/updated for this user
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid) THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_uid, v_email, coalesce(v_full_name, v_email))
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE public.profiles
    SET email = COALESCE(NULLIF(email, ''), v_email),
        full_name = COALESCE(NULLIF(full_name, ''), v_full_name)
    WHERE id = v_uid;
  END IF;

  v_hash := encode(public.digest(coalesce(p_token, ''), 'sha256'), 'hex');

  SELECT *
    INTO v_invite
  FROM public.invites
  WHERE token_hash = v_hash
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > v_now)
  LIMIT 1;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found or not pending';
  END IF;

  IF lower(coalesce(v_invite.invited_email, '')) <> v_email THEN
    RAISE EXCEPTION 'Invite email mismatch';
  END IF;

  v_role := CASE
    WHEN lower(coalesce(v_invite.role, '')) = 'admin' THEN 'admin'
    ELSE 'user'
  END;

  v_org_id := v_invite.org_id;

  INSERT INTO public.org_memberships (org_id, user_id, role)
  VALUES (v_org_id, v_uid, v_role)
  ON CONFLICT (org_id, user_id)
  DO UPDATE SET role = EXCLUDED.role;

  UPDATE public.invites
  SET status = 'active',
      accepted_by = v_uid
  WHERE id = v_invite.id;

  IF v_role = 'admin' THEN
    INSERT INTO public.cash_box_memberships (cash_box_id, user_id, role_in_box)
    SELECT cb.id, v_uid, 'admin'
    FROM public.cash_boxes cb
    WHERE cb.org_id = v_org_id
    ON CONFLICT (cash_box_id, user_id) DO NOTHING;
  ELSE
    SELECT cb.id
      INTO v_first_box_id
    FROM public.cash_boxes cb
    WHERE cb.org_id = v_org_id
    ORDER BY cb.sort_order NULLS LAST, cb.created_at ASC
    LIMIT 1;

    IF v_first_box_id IS NOT NULL THEN
      INSERT INTO public.cash_box_memberships (cash_box_id, user_id, role_in_box)
      VALUES (v_first_box_id, v_uid, 'user')
      ON CONFLICT (cash_box_id, user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'org_id', v_org_id,
    'role', v_role
  );
END;
$$;

-- Ensure auto-accept also creates/updates profile
CREATE OR REPLACE FUNCTION public.spendnote_auto_accept_my_invites()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_claims jsonb;
  v_invite RECORD;
  v_accepted int := 0;
  v_role text;
  v_first_box_id uuid;
  v_full_name text;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_claims := (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}'))::jsonb;

  SELECT lower(trim(coalesce(p.email, v_claims ->> 'email')))
    INTO v_email
  FROM public.profiles p
  WHERE p.id = v_uid
  LIMIT 1;

  IF v_email IS NULL OR v_email = '' THEN
    v_email := lower(trim(coalesce(v_claims ->> 'email', '')));
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_missing', 'accepted', 0);
  END IF;

  v_full_name := nullif(trim(coalesce(v_claims ->> 'full_name', v_claims ->> 'name', '')), '');

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid) THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_uid, v_email, coalesce(v_full_name, v_email))
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE public.profiles
    SET email = COALESCE(NULLIF(email, ''), v_email),
        full_name = COALESCE(NULLIF(full_name, ''), v_full_name)
    WHERE id = v_uid;
  END IF;

  FOR v_invite IN
    SELECT *
    FROM public.invites
    WHERE lower(invited_email) = v_email
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > now())
  LOOP
    v_role := CASE
      WHEN lower(coalesce(v_invite.role, '')) = 'admin' THEN 'admin'
      ELSE 'user'
    END;

    INSERT INTO public.org_memberships (org_id, user_id, role)
    VALUES (v_invite.org_id, v_uid, v_role)
    ON CONFLICT (org_id, user_id)
    DO UPDATE SET role = EXCLUDED.role;

    UPDATE public.invites
    SET status = 'active',
        accepted_by = v_uid
    WHERE id = v_invite.id;

    IF v_role = 'admin' THEN
      INSERT INTO public.cash_box_memberships (cash_box_id, user_id, role_in_box)
      SELECT cb.id, v_uid, 'admin'
      FROM public.cash_boxes cb
      WHERE cb.org_id = v_invite.org_id
      ON CONFLICT (cash_box_id, user_id) DO NOTHING;
    ELSE
      SELECT cb.id
        INTO v_first_box_id
      FROM public.cash_boxes cb
      WHERE cb.org_id = v_invite.org_id
      ORDER BY cb.sort_order NULLS LAST, cb.created_at ASC
      LIMIT 1;

      IF v_first_box_id IS NOT NULL THEN
        INSERT INTO public.cash_box_memberships (cash_box_id, user_id, role_in_box)
        VALUES (v_first_box_id, v_uid, 'user')
        ON CONFLICT (cash_box_id, user_id) DO NOTHING;
      END IF;
    END IF;

    v_accepted := v_accepted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'email', v_email,
    'accepted', v_accepted
  );
END;
$$;

COMMIT;
