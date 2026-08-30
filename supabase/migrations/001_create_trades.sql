-- Migration: create trades table
-- Run this against your Supabase/Postgres instance to create the trades table used by the app.

CREATE TABLE IF NOT EXISTS public.trades (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  offered_card text NOT NULL,
  desired_card text NOT NULL,
  shipping_address text NOT NULL,
  notes text,
  agree boolean DEFAULT false,
  status text DEFAULT 'pending',
  accepted_by text[] DEFAULT ARRAY[]::text[],
  authenticator_address text,
  verification_result text,
  created_at timestamptz DEFAULT now()
);
