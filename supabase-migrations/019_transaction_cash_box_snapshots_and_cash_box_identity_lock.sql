-- Migration 019: immutable cash box identity + transaction cash box snapshots

BEGIN;

-- 1) Ensure id prefix defaults to SN and normalize legacy values.
ALTER TABLE public.cash_boxes
  ALTER COLUMN id_prefix SET DEFAULT 'SN';

UPDATE public.cash_boxes
SET id_prefix = 'SN'
WHERE id_prefix IS NULL
   OR btrim(id_prefix) = ''
   OR upper(btrim(id_prefix)) = 'REC-';

-- 2) Add immutable cash box snapshot columns to transactions.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS cash_box_name_snapshot text,
  ADD COLUMN IF NOT EXISTS cash_box_currency_snapshot text,
  ADD COLUMN IF NOT EXISTS cash_box_color_snapshot text,
  ADD COLUMN IF NOT EXISTS cash_box_icon_snapshot text,
  ADD COLUMN IF NOT EXISTS cash_box_id_prefix_snapshot text;

-- Backfill snapshots for existing transactions.
UPDATE public.transactions t
SET
  cash_box_name_snapshot = COALESCE(
    NULLIF(btrim(t.cash_box_name_snapshot), ''),
    NULLIF(btrim(cb.name), '')
  ),
  cash_box_currency_snapshot = COALESCE(
    NULLIF(upper(btrim(t.cash_box_currency_snapshot)), ''),
    COALESCE(NULLIF(upper(btrim(cb.currency)), ''), 'USD')
  ),
  cash_box_color_snapshot = COALESCE(
    NULLIF(btrim(t.cash_box_color_snapshot), ''),
    NULLIF(btrim(cb.color), '')
  ),
  cash_box_icon_snapshot = COALESCE(
    NULLIF(btrim(t.cash_box_icon_snapshot), ''),
    NULLIF(btrim(cb.icon), '')
  ),
  cash_box_id_prefix_snapshot = COALESCE(
    CASE
      WHEN upper(coalesce(btrim(t.cash_box_id_prefix_snapshot), '')) = 'REC-' THEN 'SN'
      ELSE NULLIF(upper(btrim(t.cash_box_id_prefix_snapshot)), '')
    END,
    CASE
      WHEN upper(coalesce(btrim(cb.id_prefix), '')) = 'REC-' THEN 'SN'
      ELSE COALESCE(NULLIF(upper(btrim(cb.id_prefix)), ''), 'SN')
    END
  )
FROM public.cash_boxes cb
WHERE cb.id = t.cash_box_id
  AND (
    t.cash_box_name_snapshot IS NULL
    OR t.cash_box_currency_snapshot IS NULL
    OR t.cash_box_color_snapshot IS NULL
    OR t.cash_box_icon_snapshot IS NULL
    OR t.cash_box_id_prefix_snapshot IS NULL
    OR upper(coalesce(btrim(t.cash_box_id_prefix_snapshot), '')) = 'REC-'
  );

-- 3) Lock cash box identity fields from updates after creation.
CREATE OR REPLACE FUNCTION public.lock_cash_box_identity_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_currency text;
  new_currency text;
  old_prefix text;
  new_prefix text;
BEGIN
  old_currency := COALESCE(NULLIF(upper(trim(OLD.currency)), ''), 'USD');
  new_currency := COALESCE(NULLIF(upper(trim(NEW.currency)), ''), 'USD');

  old_prefix := COALESCE(NULLIF(upper(trim(OLD.id_prefix)), ''), 'SN');
  new_prefix := COALESCE(NULLIF(upper(trim(NEW.id_prefix)), ''), 'SN');

  IF old_prefix = 'REC-' THEN old_prefix := 'SN'; END IF;
  IF new_prefix = 'REC-' THEN new_prefix := 'SN'; END IF;

  IF new_currency IS DISTINCT FROM old_currency THEN
    RAISE EXCEPTION 'cash_boxes.currency is immutable after creation';
  END IF;

  IF new_prefix IS DISTINCT FROM old_prefix THEN
    RAISE EXCEPTION 'cash_boxes.id_prefix is immutable after creation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lock_cash_box_identity_fields_trigger ON public.cash_boxes;

CREATE TRIGGER lock_cash_box_identity_fields_trigger
BEFORE UPDATE ON public.cash_boxes
FOR EACH ROW
EXECUTE FUNCTION public.lock_cash_box_identity_fields();

-- 4) Update atomic transaction create RPC to save cash box snapshots.
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
