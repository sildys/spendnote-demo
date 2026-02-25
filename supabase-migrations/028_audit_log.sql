-- AUDIT-H4: Audit log table + event logging for critical actions
-- Events logged: transaction.void, cash_box.delete, member.role_change, member.remove

-- Pre-drop functions whose parameter names changed (CREATE OR REPLACE cannot rename params)
DROP FUNCTION IF EXISTS public.spendnote_void_transaction(uuid, text);
DROP FUNCTION IF EXISTS public.spendnote_delete_cash_box(uuid);

BEGIN;

-- 1) Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_created ON public.audit_log(org_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Owner-only read access
CREATE POLICY "audit_log_owner_select" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.org_memberships m
            WHERE m.org_id = audit_log.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) = 'owner'
        )
    );

-- No INSERT/UPDATE/DELETE policies for regular users.
-- Only SECURITY DEFINER functions can write.

-- 2) Internal helper to write audit entries (SECURITY DEFINER, not directly callable for writes)
CREATE OR REPLACE FUNCTION public.spendnote_write_audit_log(
    p_org_id uuid,
    p_actor_id uuid,
    p_action text,
    p_target_type text DEFAULT NULL,
    p_target_id uuid DEFAULT NULL,
    p_meta jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_log (org_id, actor_id, action, target_type, target_id, meta)
    VALUES (p_org_id, p_actor_id, p_action, p_target_type, p_target_id, p_meta);
END;
$$;

-- Only grant to postgres (used internally by other SECURITY DEFINER functions)
-- Do NOT grant to authenticated — this prevents direct client writes.
REVOKE ALL ON FUNCTION public.spendnote_write_audit_log(uuid, uuid, text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spendnote_write_audit_log(uuid, uuid, text, text, uuid, jsonb) FROM authenticated;

-- 3) Public RPC for owners to read audit log (paginated)
CREATE OR REPLACE FUNCTION public.spendnote_get_audit_log(
    p_org_id uuid,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    org_id uuid,
    actor_id uuid,
    action text,
    target_type text,
    target_id uuid,
    meta jsonb,
    created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor uuid;
    v_is_owner boolean;
BEGIN
    v_actor := auth.uid();
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM public.org_memberships m
        WHERE m.org_id = p_org_id
          AND m.user_id = v_actor
          AND lower(coalesce(m.role, '')) = 'owner'
    ) INTO v_is_owner;

    IF NOT coalesce(v_is_owner, false) THEN
        RAISE EXCEPTION 'Not authorized — owner only';
    END IF;

    RETURN QUERY
    SELECT al.id, al.org_id, al.actor_id, al.action,
           al.target_type, al.target_id, al.meta, al.created_at
    FROM public.audit_log al
    WHERE al.org_id = p_org_id
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_get_audit_log(uuid, integer, integer) TO authenticated;

-- 4) Update spendnote_void_transaction to write audit log entry
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
  v_actor uuid;
  v_tx public.transactions%ROWTYPE;
  v_can_void boolean := false;
  v_void_tx_id uuid;
  v_reverse_type text;
  v_actor_name text;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_tx.status = 'voided' THEN
    RAISE EXCEPTION 'Transaction is already voided';
  END IF;

  -- Check org-level owner/admin permission
  SELECT EXISTS(
    SELECT 1
    FROM public.org_memberships m
    WHERE m.org_id = v_tx.org_id
      AND m.user_id = v_actor
      AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
  ) INTO v_can_void;

  IF NOT coalesce(v_can_void, false) THEN
    RAISE EXCEPTION 'Not authorized — only Owner/Admin can void';
  END IF;

  v_reverse_type := CASE WHEN v_tx.type = 'IN' THEN 'OUT' ELSE 'IN' END;

  SELECT coalesce(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
  INTO v_actor_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = v_actor;

  INSERT INTO public.transactions (
    org_id, cash_box_id, contact_id, type, amount,
    description, notes, transaction_date, receipt_number,
    line_items, contact_name, contact_email, contact_phone,
    contact_address, contact_custom_field_1, contact_custom_field_2,
    created_by_user_id, created_by_user_name, status,
    is_void_entry, original_transaction_id,
    cash_box_name_snapshot, cash_box_currency_snapshot,
    cash_box_color_snapshot, cash_box_icon_snapshot,
    cash_box_id_prefix_snapshot
  ) VALUES (
    v_tx.org_id, v_tx.cash_box_id, v_tx.contact_id,
    v_reverse_type, v_tx.amount, v_tx.description, v_tx.notes,
    v_tx.transaction_date, NULL, v_tx.line_items,
    v_tx.contact_name, v_tx.contact_email, v_tx.contact_phone,
    v_tx.contact_address, v_tx.contact_custom_field_1,
    v_tx.contact_custom_field_2, v_actor,
    COALESCE(v_actor_name, v_tx.created_by_user_name),
    'active', true, v_tx.id,
    v_tx.cash_box_name_snapshot, v_tx.cash_box_currency_snapshot,
    v_tx.cash_box_color_snapshot, v_tx.cash_box_icon_snapshot,
    v_tx.cash_box_id_prefix_snapshot
  )
  RETURNING id INTO v_void_tx_id;

  UPDATE public.transactions
  SET
    status = 'voided',
    voided_at = NOW(),
    voided_by_user_id = v_actor,
    voided_by_user_name = v_actor_name,
    void_tx_id = v_void_tx_id,
    void_reason = p_reason
  WHERE id = v_tx.id;

  -- Audit log
  PERFORM public.spendnote_write_audit_log(
      v_tx.org_id, v_actor, 'transaction.void', 'transaction', v_tx.id,
      jsonb_build_object('void_tx_id', v_void_tx_id, 'reason', coalesce(p_reason, ''))
  );

  RETURN QUERY SELECT v_void_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_void_transaction(uuid, text) TO authenticated;

-- 5) Update spendnote_delete_cash_box to write audit log entry
CREATE OR REPLACE FUNCTION public.spendnote_delete_cash_box(
  p_cash_box_id uuid
)
RETURNS TABLE(success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid;
  v_cb public.cash_boxes%ROWTYPE;
  v_can_delete boolean := false;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = p_cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF v_cb.user_id = v_actor THEN
    v_can_delete := true;
  ELSE
    SELECT EXISTS(
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = v_cb.org_id
        AND m.user_id = v_actor
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    ) INTO v_can_delete;
  END IF;

  IF NOT coalesce(v_can_delete, false) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Audit log BEFORE delete (so org_id is still available)
  PERFORM public.spendnote_write_audit_log(
      v_cb.org_id, v_actor, 'cash_box.delete', 'cash_box', p_cash_box_id,
      jsonb_build_object('name', coalesce(v_cb.name, ''), 'currency', coalesce(v_cb.currency, ''))
  );

  DELETE FROM public.transactions WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_box_memberships WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_boxes WHERE id = p_cash_box_id;

  RETURN QUERY SELECT true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_delete_cash_box(uuid) TO authenticated;

-- 6) Trigger-based audit for org_memberships role changes and removals
CREATE OR REPLACE FUNCTION public.trg_audit_org_membership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Only log if role actually changed
        IF lower(coalesce(OLD.role, '')) IS DISTINCT FROM lower(coalesce(NEW.role, '')) THEN
            PERFORM public.spendnote_write_audit_log(
                NEW.org_id, auth.uid(), 'member.role_change', 'user', NEW.user_id,
                jsonb_build_object(
                    'old_role', coalesce(OLD.role, ''),
                    'new_role', coalesce(NEW.role, '')
                )
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.spendnote_write_audit_log(
            OLD.org_id, auth.uid(), 'member.remove', 'user', OLD.user_id,
            jsonb_build_object('role', coalesce(OLD.role, ''))
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_org_membership_change ON public.org_memberships;
CREATE TRIGGER audit_org_membership_change
    AFTER UPDATE OR DELETE ON public.org_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_audit_org_membership_change();

COMMIT;
