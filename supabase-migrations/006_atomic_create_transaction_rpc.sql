BEGIN;

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

  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = v_cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF v_cb.user_id <> v_actor THEN
    RAISE EXCEPTION 'Not authorized';
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
    cash_box_id_prefix_snapshot
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
    END
  )
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_create_transaction(jsonb) TO authenticated;

COMMIT;
