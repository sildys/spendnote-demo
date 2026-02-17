-- Persist profile avatar image/editor state on the profiles row
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_settings JSONB DEFAULT NULL;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_color TEXT;
