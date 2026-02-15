-- Add logo_settings JSONB column to profiles for storing logo scale and position
-- Example value: {"scale": 1.5, "x": 10, "y": -5}
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_settings JSONB DEFAULT NULL;
