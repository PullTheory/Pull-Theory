alter table public.welcome_rip_claims
  add column if not exists decision text not null default 'pending',
  add column if not exists decided_at timestamptz,
  add column if not exists collection_id uuid references public.collections(id) on delete set null,
  add column if not exists pullshield_credit_granted boolean not null default false;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conrelid='public.welcome_rip_claims'::regclass and conname='welcome_rip_claims_decision_check'
  ) then
    alter table public.welcome_rip_claims add constraint welcome_rip_claims_decision_check check (decision in ('pending','accepted','declined'));
  end if;
end $$;

alter table public.welcome_rip_claims drop constraint if exists welcome_rip_claims_prize_id_key;
create index if not exists welcome_rip_claims_prize_id_idx on public.welcome_rip_claims(prize_id);
