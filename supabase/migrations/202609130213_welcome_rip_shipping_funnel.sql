alter table public.welcome_rip_claims
  add column if not exists shipping_status text not null default 'not_applicable',
  add column if not exists shipped_at timestamptz;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conrelid='public.welcome_rip_claims'::regclass and conname='welcome_rip_claims_shipping_status_check'
  ) then
    alter table public.welcome_rip_claims add constraint welcome_rip_claims_shipping_status_check check (shipping_status in ('not_applicable','awaiting_shipment','shipped'));
  end if;
end $$;
