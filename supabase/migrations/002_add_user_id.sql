-- Migration: add user_id column to trades

ALTER TABLE IF EXISTS public.trades
  ADD COLUMN IF NOT EXISTS user_id text;
