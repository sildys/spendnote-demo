-- 038: Complete rewrite of spendnote_void_transaction
-- Based on proven 004 version + org_id/snapshot/audit additions
-- Fixes from 028: missing user_id, wrong column names, wrong type values

DROP FUNCTION IF EXISTS public.spendnote_void_transaction(uuid, text);

BEGIN;

CREATE OR REPLACE FUNCTION public.spendnote_void_transaction(
  p_transaction_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS TABLE(void_transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx public.transactions%ROWTYPE;
  v_cb public.cash_boxes%ROWTYPE;
  v_reverse_type text;
  v_void_tx_id uuid;
  v_actor uuid;
  v_actor_name text;
  v_can_void boolean := false;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the transaction row
  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Cannot void system (reversal) transactions
  IF COALESCE(v_tx.is_system, false) THEN
    RAISE EXCEPTION 'Cannot void system transaction';
  END IF;

  -- Cannot void already voided
  IF COALESCE(v_tx.status, 'active') = 'voided' THEN
    RAISE EXCEPTION 'Transaction is already voided';
  END IF;

  -- Auth check 1: cash box owner (works for solo users without org_memberships)
  SELECT EXISTS(
    SELECT 1
    FROM public.cash_boxes cb
    WHERE cb.id = v_tx.cash_box_id
      AND cb.user_id = v_actor
  ) INTO v_can_void;

  -- Auth check 2: org-level owner/admin (works for team members)
  IF NOT v_can_void AND v_tx.org_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = v_tx.org_id
        AND m.user_id = v_actor
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    ) INTO v_can_void;
  END IF;

  IF NOT coalesce(v_can_void, false) THEN
    RAISE EXCEPTION 'Not authorized — only Owner/Admin can void';
  END IF;

  -- Lock the cash box and determine reverse type
  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = v_tx.cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF lower(v_tx.type) = 'income' THEN
    v_reverse_type := 'expense';
    IF (v_cb.current_balance - v_tx.amount) < 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_BALANCE_FOR_VOID';
    END IF;
  ELSE
    v_reverse_type := 'income';
  END IF;

  -- Get actor name
  SELECT full_name INTO v_actor_name
  FROM public.profiles
  WHERE id = v_actor;

  -- Create reversal transaction
  INSERT INTO public.transactions(
    user_id,
    org_id,
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
    status,
    is_system,
    original_tx_id,
    cash_box_name_snapshot,
    cash_box_currency_snapshot,
    cash_box_color_snapshot,
    cash_box_icon_snapshot,
    cash_box_id_prefix_snapshot
  ) VALUES (
    v_tx.user_id,
    v_tx.org_id,
    v_tx.cash_box_id,
    v_tx.contact_id,
    v_reverse_type,
    v_tx.amount,
    v_tx.description,
    v_tx.notes,
    v_tx.transaction_date,
    NULL,
    v_tx.line_items,
    v_tx.contact_name,
    v_tx.contact_email,
    v_tx.contact_phone,
    v_tx.contact_address,
    v_tx.contact_custom_field_1,
    v_tx.contact_custom_field_2,
    v_actor,
    COALESCE(v_actor_name, v_tx.created_by_user_name),
    'active',
    true,
    v_tx.id,
    v_tx.cash_box_name_snapshot,
    v_tx.cash_box_currency_snapshot,
    v_tx.cash_box_color_snapshot,
    v_tx.cash_box_icon_snapshot,
    v_tx.cash_box_id_prefix_snapshot
  )
  RETURNING id INTO v_void_tx_id;

  -- Mark original as voided
  UPDATE public.transactions
  SET
    status = 'voided',
    voided_at = NOW(),
    voided_by_user_id = v_actor,
    voided_by_user_name = v_actor_name,
    void_tx_id = v_void_tx_id,
    void_reason = p_reason
  WHERE id = v_tx.id;

  -- Audit log (skip for solo users without org)
  IF v_tx.org_id IS NOT NULL THEN
    PERFORM public.spendnote_write_audit_log(
        v_tx.org_id, v_actor, 'transaction.void', 'transaction', v_tx.id,
        jsonb_build_object('void_tx_id', v_void_tx_id, 'reason', coalesce(p_reason, ''))
    );
  END IF;

  RETURN QUERY SELECT v_void_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_void_transaction(uuid, text) TO authenticated;

COMMIT;
