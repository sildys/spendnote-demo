-- 066: Soft-lock excess cash boxes after plan downgrade (S1 §4).
-- - transactions_blocked on cash_boxes blocks new transactions (RPC enforce).
-- - tier_cash_boxes_pending on profiles until owner picks which boxes stay active.

BEGIN;

ALTER TABLE public.cash_boxes
  ADD COLUMN IF NOT EXISTS transactions_blocked boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier_cash_boxes_pending boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.cash_boxes.transactions_blocked IS 'When true, spendnote_create_transaction rejects for this box (plan downgrade / excess cash boxes).';
COMMENT ON COLUMN public.profiles.tier_cash_boxes_pending IS 'Owner must choose active cash boxes after downgrade; until then boxes may be blocked.';

CREATE OR REPLACE FUNCTION public.spendnote_resolve_tier_cash_boxes(p_keep_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_pending boolean;
  v_tier text;
  v_max int;
  v_keep int;
  v_bad boolean;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT coalesce(tier_cash_boxes_pending, false),
         lower(coalesce(nullif(trim(subscription_tier), ''), 'free'))
  INTO v_pending, v_tier
  FROM public.profiles
  WHERE id = v_actor;

  IF NOT coalesce(v_pending, false) THEN
    RAISE EXCEPTION 'No pending cash box plan resolution for this account';
  END IF;

  IF p_keep_ids IS NULL OR array_length(p_keep_ids, 1) IS NULL OR array_length(p_keep_ids, 1) < 1 THEN
    RAISE EXCEPTION 'Select at least one cash box to keep active';
  END IF;

  v_max := CASE v_tier
    WHEN 'free' THEN 1
    WHEN 'standard' THEN 2
    ELSE 1000000
  END;

  v_keep := array_length(p_keep_ids, 1);
  IF v_keep > v_max THEN
    RAISE EXCEPTION 'Too many cash boxes selected for your current plan';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM unnest(p_keep_ids) AS k(id)
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.cash_boxes cb
      WHERE cb.id = k.id
        AND (
          (cb.user_id = v_actor AND cb.org_id IS NULL)
          OR (
            cb.org_id IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM public.org_memberships m
              WHERE m.org_id = cb.org_id
                AND m.user_id = v_actor
                AND lower(coalesce(m.role, '')) = 'owner'
            )
          )
        )
    )
  ) INTO v_bad;

  IF coalesce(v_bad, false) THEN
    RAISE EXCEPTION 'Invalid cash box selection';
  END IF;

  UPDATE public.cash_boxes cb
  SET transactions_blocked = CASE WHEN cb.id = ANY (p_keep_ids) THEN false ELSE true END,
      updated_at = now()
  WHERE (cb.user_id = v_actor AND cb.org_id IS NULL)
     OR (
       cb.org_id IS NOT NULL
       AND EXISTS (
         SELECT 1
         FROM public.org_memberships m
         WHERE m.org_id = cb.org_id
           AND m.user_id = v_actor
           AND lower(coalesce(m.role, '')) = 'owner'
       )
     );

  UPDATE public.profiles
  SET tier_cash_boxes_pending = false,
      updated_at = now()
  WHERE id = v_actor;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_resolve_tier_cash_boxes(uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.spendnote_create_transaction(
  p_tx jsonb
)
RETURNS TABLE(transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_cb public.cash_boxes%ROWTYPE;
  v_contact_id uuid;
  v_cash_box_id uuid;
  v_type text;
  v_amount numeric;
  v_tx_id uuid;
  v_subscription_tier text;
  v_billing_status text;
  v_preview_cap integer;
  v_active_tx_count bigint;
  v_created_at timestamptz;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_cash_box_id := NULLIF(p_tx->>'cash_box_id', '')::uuid;
  v_type := lower(coalesce(p_tx->>'type', ''));
  v_amount := NULLIF(p_tx->>'amount', '')::numeric;
  v_contact_id := NULLIF(p_tx->>'contact_id', '')::uuid;

  IF v_cash_box_id IS NULL THEN
    RAISE EXCEPTION 'Missing cash_box_id';
  END IF;

  IF v_type <> 'income' AND v_type <> 'expense' THEN
    RAISE EXCEPTION 'Invalid type';
  END IF;

  IF v_amount IS NULL OR v_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT
    lower(coalesce(nullif(trim(subscription_tier), ''), 'preview')),
    lower(
      coalesce(
        nullif(trim(billing_status), ''),
        CASE
          WHEN lower(coalesce(nullif(trim(subscription_tier), ''), 'preview')) = 'preview' THEN 'preview'
          WHEN lower(coalesce(nullif(trim(subscription_tier), ''), 'free')) = 'free' THEN 'free'
          ELSE 'active'
        END
      )
    ),
    GREATEST(1, coalesce(preview_transaction_cap, 200))
  INTO v_subscription_tier, v_billing_status, v_preview_cap
  FROM public.profiles
  WHERE id = v_actor;

  IF v_subscription_tier = 'free' THEN
    SELECT created_at INTO v_created_at FROM auth.users WHERE id = v_actor;
    IF v_created_at IS NOT NULL AND (now() - v_created_at) > interval '14 days' THEN
      RAISE EXCEPTION 'FREE_TRIAL_EXPIRED';
    END IF;
  END IF;

  IF v_subscription_tier IN ('preview', 'free') THEN
    IF (v_subscription_tier = 'preview' OR v_billing_status = 'preview') THEN
      SELECT COUNT(*)
      INTO v_active_tx_count
      FROM public.transactions t
      WHERE t.user_id = v_actor
        AND coalesce(t.status, 'active') = 'active'
        AND coalesce(t.is_system, false) = false;

      IF v_active_tx_count >= v_preview_cap THEN
        RAISE EXCEPTION 'PREVIEW_RECEIPT_LIMIT_REACHED';
      END IF;
    END IF;

    IF v_subscription_tier = 'free' THEN
      SELECT COUNT(*)
      INTO v_active_tx_count
      FROM public.transactions t
      WHERE t.user_id = v_actor
        AND coalesce(t.is_system, false) = false;

      IF v_active_tx_count >= 20 THEN
        RAISE EXCEPTION 'FREE_TRANSACTION_LIMIT';
      END IF;
    END IF;
  END IF;

  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = v_cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF coalesce(v_cb.transactions_blocked, false) THEN
    RAISE EXCEPTION 'CASH_BOX_TRANSACTIONS_BLOCKED';
  END IF;

  IF v_cb.user_id IS DISTINCT FROM v_actor THEN
    IF v_cb.org_id IS NULL THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = v_cb.org_id
        AND m.user_id = v_actor
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.cash_box_memberships c
      WHERE c.cash_box_id = v_cash_box_id
        AND c.user_id = v_actor
    ) THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  IF v_type = 'expense' THEN
    IF (v_cb.current_balance - v_amount) < 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
    END IF;
  END IF;

  INSERT INTO public.transactions(
    user_id,
    cash_box_id,
    contact_id,
    type,
    amount,
    description,
    notes,
    transaction_date,
    receipt_number,
    line_items,
    contact_name,
    contact_email,
    contact_phone,
    contact_address,
    contact_custom_field_1,
    contact_custom_field_2,
    created_by_user_id,
    created_by_user_name,
    cash_box_name_snapshot,
    cash_box_currency_snapshot,
    cash_box_color_snapshot,
    cash_box_icon_snapshot,
    cash_box_id_prefix_snapshot,
    sender_company_name_snapshot,
    sender_address_snapshot,
    sender_phone_snapshot,
    sender_profile_logo_url_snapshot,
    receipt_show_logo,
    receipt_show_addresses,
    receipt_show_tracking,
    receipt_show_additional,
    receipt_show_note,
    receipt_show_signatures,
    receipt_title,
    receipt_total_label,
    receipt_from_label,
    receipt_to_label,
    receipt_description_label,
    receipt_amount_label,
    receipt_notes_label,
    receipt_issued_by_label,
    receipt_received_by_label,
    receipt_footer_note
  ) VALUES (
    v_actor,
    v_cash_box_id,
    v_contact_id,
    v_type,
    v_amount,
    NULLIF(p_tx->>'description', ''),
    NULLIF(p_tx->>'notes', ''),
    COALESCE(NULLIF(p_tx->>'transaction_date', '')::date, CURRENT_DATE),
    NULLIF(p_tx->>'receipt_number', ''),
    COALESCE((p_tx->'line_items')::jsonb, '[]'::jsonb),
    COALESCE(NULLIF(p_tx->>'contact_name', ''), '—'),
    NULLIF(p_tx->>'contact_email', ''),
    NULLIF(p_tx->>'contact_phone', ''),
    NULLIF(p_tx->>'contact_address', ''),
    NULLIF(p_tx->>'contact_custom_field_1', ''),
    NULLIF(p_tx->>'contact_custom_field_2', ''),
    v_actor,
    NULLIF(p_tx->>'created_by_user_name', ''),
    NULLIF(v_cb.name, ''),
    COALESCE(NULLIF(upper(trim(v_cb.currency)), ''), 'USD'),
    NULLIF(trim(v_cb.color), ''),
    NULLIF(trim(v_cb.icon), ''),
    CASE
      WHEN upper(coalesce(trim(v_cb.id_prefix), '')) = 'REC-' THEN 'SN'
      ELSE COALESCE(NULLIF(upper(trim(v_cb.id_prefix)), ''), 'SN')
    END,
    NULLIF(p_tx->>'sender_company_name_snapshot', ''),
    NULLIF(p_tx->>'sender_address_snapshot', ''),
    NULLIF(p_tx->>'sender_phone_snapshot', ''),
    NULLIF(p_tx->>'sender_profile_logo_url_snapshot', ''),
    coalesce(v_cb.receipt_show_logo, true),
    coalesce(v_cb.receipt_show_addresses, true),
    coalesce(v_cb.receipt_show_tracking, true),
    coalesce(v_cb.receipt_show_additional, false),
    coalesce(v_cb.receipt_show_note, false),
    coalesce(v_cb.receipt_show_signatures, true),
    NULLIF(trim(v_cb.receipt_title), ''),
    NULLIF(trim(v_cb.receipt_total_label), ''),
    NULLIF(trim(v_cb.receipt_from_label), ''),
    NULLIF(trim(v_cb.receipt_to_label), ''),
    NULLIF(trim(v_cb.receipt_description_label), ''),
    NULLIF(trim(v_cb.receipt_amount_label), ''),
    NULLIF(trim(v_cb.receipt_notes_label), ''),
    NULLIF(trim(v_cb.receipt_issued_by_label), ''),
    NULLIF(trim(v_cb.receipt_received_by_label), ''),
    NULLIF(trim(v_cb.receipt_footer_note), '')
  )
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_create_transaction(jsonb) TO authenticated;

COMMIT;
