-- Migration: add listing support to trades

ALTER TABLE IF EXISTS public.trades
  ADD COLUMN IF NOT EXISTS is_listing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS listing_id bigint NULL;
