-- Per-cash-box logo transform (scale, x, y) for receipts — was only in localStorage before.
ALTER TABLE public.cash_boxes
  ADD COLUMN IF NOT EXISTS logo_settings JSONB DEFAULT NULL;

COMMENT ON COLUMN public.cash_boxes.logo_settings IS 'JSON: { scale, x, y } for receipt logo positioning; cash_box_logo_url holds the image.';
