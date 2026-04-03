-- Allow changing cash_boxes.currency only while the box has no active, non-system transactions
-- (onboarding currency confirm / fix wrong default USD)

BEGIN;

CREATE OR REPLACE FUNCTION public.lock_cash_box_identity_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_currency text;
  new_currency text;
  old_prefix text;
  new_prefix text;
  tx_count int;
BEGIN
  old_currency := COALESCE(NULLIF(upper(trim(OLD.currency)), ''), 'USD');
  new_currency := COALESCE(NULLIF(upper(trim(NEW.currency)), ''), 'USD');

  old_prefix := COALESCE(NULLIF(upper(trim(OLD.id_prefix)), ''), 'SN');
  new_prefix := COALESCE(NULLIF(upper(trim(NEW.id_prefix)), ''), 'SN');

  IF old_prefix = 'REC-' THEN old_prefix := 'SN'; END IF;
  IF new_prefix = 'REC-' THEN new_prefix := 'SN'; END IF;

  IF new_currency IS DISTINCT FROM old_currency THEN
    SELECT COUNT(*)::int INTO tx_count
    FROM public.transactions t
    WHERE t.cash_box_id = OLD.id
      AND COALESCE(lower(trim(t.status)), 'active') = 'active'
      AND (t.is_system IS NULL OR t.is_system = false);

    IF tx_count > 0 THEN
      RAISE EXCEPTION 'cash_boxes.currency is immutable after creation';
    END IF;
  END IF;

  IF new_prefix IS DISTINCT FROM old_prefix THEN
    RAISE EXCEPTION 'cash_boxes.id_prefix is immutable after creation';
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
