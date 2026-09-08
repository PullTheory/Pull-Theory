alter table public.sale_orders
  add column if not exists authentication_checklist jsonb not null default '{}'::jsonb,
  add column if not exists authentication_evidence_urls text[] not null default '{}',
  add column if not exists authentication_notes text,
  add column if not exists authenticated_by text,
  add column if not exists authenticated_at timestamptz;

comment on column public.sale_orders.authentication_checklist is 'PullShield operator inspection checklist captured before authentication approval.';
comment on column public.sale_orders.authentication_evidence_urls is 'Verification photo URLs captured during PullShield authentication.';
comment on column public.sale_orders.authentication_notes is 'Operator notes recorded during PullShield authentication.';
comment on column public.sale_orders.authenticated_by is 'Operator email that approved authentication.';
comment on column public.sale_orders.authenticated_at is 'Timestamp when PullShield authentication was approved.';
