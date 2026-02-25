-- Cleanup: drop unused is_active column from cash_boxes
-- Cash box archiving was rejected by design — cash boxes are either active or deleted.

ALTER TABLE public.cash_boxes DROP COLUMN IF EXISTS is_active;
