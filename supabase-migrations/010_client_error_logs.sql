BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.client_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  page_url text,
  message text,
  source text,
  lineno integer,
  colno integer,
  stack text,
  user_agent text,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS client_error_logs_user_id_created_at_idx
  ON public.client_error_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS client_error_logs_created_at_idx
  ON public.client_error_logs (created_at DESC);

ALTER TABLE public.client_error_logs ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON TABLE public.client_error_logs TO authenticated;

DROP POLICY IF EXISTS "client_error_logs_insert_own" ON public.client_error_logs;
CREATE POLICY "client_error_logs_insert_own"
  ON public.client_error_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMIT;
