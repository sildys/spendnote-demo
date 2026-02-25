BEGIN;

-- Compatibility setup for org model primitives
CREATE TABLE IF NOT EXISTS public.orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Team',
  owner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.org_memberships (
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (lower(role) IN ('owner','admin','user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

ALTER TABLE public.cash_boxes
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.cash_box_memberships (
  cash_box_id uuid NOT NULL REFERENCES public.cash_boxes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cash_box_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cash_boxes_org_id ON public.cash_boxes(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(org_id);

-- 1) Org-aware RLS for core domain tables
DO $$
BEGIN
  -- cash_boxes
  IF to_regclass('public.cash_boxes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cash_boxes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own cash boxes" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own cash boxes" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own cash boxes" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own cash boxes" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Cash boxes org-aware select" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Cash boxes org-aware insert" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Cash boxes org-aware update" ON public.cash_boxes';
    EXECUTE 'DROP POLICY IF EXISTS "Cash boxes org-aware delete" ON public.cash_boxes';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'cash_boxes' AND column_name = 'org_id'
    ) THEN
      EXECUTE 'CREATE POLICY "Cash boxes org-aware select" ON public.cash_boxes FOR SELECT USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = cash_boxes.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Cash boxes org-aware insert" ON public.cash_boxes FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = cash_boxes.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '''')) IN (''owner'', ''admin'')
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Cash boxes org-aware update" ON public.cash_boxes FOR UPDATE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = cash_boxes.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '''')) IN (''owner'', ''admin'')
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Cash boxes org-aware delete" ON public.cash_boxes FOR DELETE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = cash_boxes.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '''')) IN (''owner'', ''admin'')
          )
        )
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Cash boxes org-aware select" ON public.cash_boxes FOR SELECT USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Cash boxes org-aware insert" ON public.cash_boxes FOR INSERT WITH CHECK (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Cash boxes org-aware update" ON public.cash_boxes FOR UPDATE USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Cash boxes org-aware delete" ON public.cash_boxes FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- contacts
  IF to_regclass('public.contacts') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Contacts org-aware select" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Contacts org-aware insert" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Contacts org-aware update" ON public.contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Contacts org-aware delete" ON public.contacts';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'org_id'
    ) THEN
      EXECUTE 'CREATE POLICY "Contacts org-aware select" ON public.contacts FOR SELECT USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = contacts.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Contacts org-aware insert" ON public.contacts FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = contacts.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Contacts org-aware update" ON public.contacts FOR UPDATE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = contacts.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Contacts org-aware delete" ON public.contacts FOR DELETE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = contacts.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Contacts org-aware select" ON public.contacts FOR SELECT USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Contacts org-aware insert" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Contacts org-aware update" ON public.contacts FOR UPDATE USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Contacts org-aware delete" ON public.contacts FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;

  -- transactions
  IF to_regclass('public.transactions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Transactions org-aware select" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Transactions org-aware insert" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Transactions org-aware update" ON public.transactions';
    EXECUTE 'DROP POLICY IF EXISTS "Transactions org-aware delete" ON public.transactions';

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'org_id'
    ) THEN
      EXECUTE 'CREATE POLICY "Transactions org-aware select" ON public.transactions FOR SELECT USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = transactions.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Transactions org-aware insert" ON public.transactions FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = transactions.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Transactions org-aware update" ON public.transactions FOR UPDATE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = transactions.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';

      EXECUTE 'CREATE POLICY "Transactions org-aware delete" ON public.transactions FOR DELETE USING (
        auth.uid() = user_id
        OR (
          org_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = transactions.org_id
              AND m.user_id = auth.uid()
          )
        )
      )';
    ELSE
      EXECUTE 'CREATE POLICY "Transactions org-aware select" ON public.transactions FOR SELECT USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Transactions org-aware insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Transactions org-aware update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id)';
      EXECUTE 'CREATE POLICY "Transactions org-aware delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id)';
    END IF;
  END IF;
END $$;

-- 2) Replace void RPC authorization to org model (owner/admin by org membership)
CREATE OR REPLACE FUNCTION public.spendnote_void_transaction(
  p_tx_id uuid,
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
  v_is_admin_like boolean;
BEGIN
  v_actor := auth.uid();
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_tx_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  SELECT * INTO v_cb
  FROM public.cash_boxes
  WHERE id = v_tx.cash_box_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cash box not found';
  END IF;

  IF v_tx.user_id <> v_actor THEN
    SELECT EXISTS(
      SELECT 1
      FROM public.org_memberships m
      WHERE m.org_id = v_cb.org_id
        AND m.user_id = v_actor
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    ) INTO v_is_admin_like;

    IF NOT coalesce(v_is_admin_like, false) THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  IF COALESCE(v_tx.is_system, false) THEN
    RAISE EXCEPTION 'Cannot void system transaction';
  END IF;

  IF COALESCE(v_tx.status, 'active') = 'voided' THEN
    RAISE EXCEPTION 'Already voided';
  END IF;

  IF lower(v_tx.type) = 'income' THEN
    v_reverse_type := 'expense';
    IF (v_cb.current_balance - v_tx.amount) < 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_BALANCE_FOR_VOID';
    END IF;
  ELSE
    v_reverse_type := 'income';
  END IF;

  SELECT full_name INTO v_actor_name
  FROM public.profiles
  WHERE id = v_actor;

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

  UPDATE public.transactions
  SET
    status = 'voided',
    voided_at = NOW(),
    voided_by_user_id = v_actor,
    voided_by_user_name = v_actor_name,
    void_tx_id = v_void_tx_id,
    void_reason = p_reason
  WHERE id = v_tx.id;

  RETURN QUERY SELECT v_void_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_void_transaction(uuid, text) TO authenticated;

-- 3) Atomic server-side cash box delete
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

  DELETE FROM public.transactions WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_box_memberships WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_box_access WHERE cash_box_id = p_cash_box_id;
  DELETE FROM public.cash_boxes WHERE id = p_cash_box_id;

  RETURN QUERY SELECT true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spendnote_delete_cash_box(uuid) TO authenticated;

COMMIT;
