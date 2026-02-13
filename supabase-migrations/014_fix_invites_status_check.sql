-- Fix constraint violation for invites status
-- The error "violates check constraint invites_status_check" indicates the 'status' column
-- is restricted to certain values, and 'active' (which we try to set) is likely missing.
-- This migration updates the constraint to allow 'pending', 'active', 'accepted', 'expired', 'cancelled'.

ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_status_check;

ALTER TABLE public.invites
ADD CONSTRAINT invites_status_check
CHECK (status IN ('pending', 'active', 'accepted', 'expired', 'cancelled'));
