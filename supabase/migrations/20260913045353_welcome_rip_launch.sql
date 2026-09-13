create table if not exists public.welcome_rip_prizes (
  id uuid primary key default gen_random_uuid(),
  tier text not null check (tier in ('bulk','nice','good','big','chase')),
  display_name text not null,
  value_min_cents integer not null check (value_min_cents >= 0),
  value_max_cents integer not null check (value_max_cents >= value_min_cents),
  card_name text,
  card_set text,
  card_number text,
  image_url text,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists welcome_rip_prizes_claimed_by_key on public.welcome_rip_prizes (claimed_by) where claimed_by is not null;
create table if not exists public.welcome_rip_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  prize_id uuid not null unique references public.welcome_rip_prizes(id) on delete restrict,
  claimed_at timestamptz not null default now()
);
create table if not exists public.welcome_rip_settings (
  singleton boolean primary key default true check (singleton = true),
  launch_at timestamptz not null default now(),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.welcome_rip_settings(singleton, launch_at, active) values (true, now(), true) on conflict (singleton) do nothing;
alter table public.welcome_rip_prizes enable row level security;
alter table public.welcome_rip_claims enable row level security;
alter table public.welcome_rip_settings enable row level security;
revoke all on public.welcome_rip_prizes from anon, authenticated;
revoke all on public.welcome_rip_claims from anon, authenticated;
revoke all on public.welcome_rip_settings from anon, authenticated;
grant select, insert, update, delete on public.welcome_rip_prizes to service_role;
grant select, insert, update, delete on public.welcome_rip_claims to service_role;
grant select, insert, update, delete on public.welcome_rip_settings to service_role;
create policy "welcome rip prizes service only" on public.welcome_rip_prizes for all to service_role using (true) with check (true);
create policy "welcome rip claims service only" on public.welcome_rip_claims for all to service_role using (true) with check (true);
create policy "welcome rip settings service only" on public.welcome_rip_settings for all to service_role using (true) with check (true);

create or replace function public.claim_welcome_rip(target_user_id uuid)
returns table (prize_id uuid,tier text,display_name text,value_min_cents integer,value_max_cents integer,card_name text,card_set text,card_number text,image_url text,claimed_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
declare selected_id uuid; launch_time timestamptz; promotion_active boolean; account_created timestamptz; account_confirmed timestamptz;
begin
  select s.launch_at, s.active into launch_time, promotion_active from public.welcome_rip_settings s where s.singleton = true;
  if coalesce(promotion_active, false) is not true then return; end if;
  select u.created_at, coalesce(u.email_confirmed_at, u.confirmed_at) into account_created, account_confirmed from auth.users u where u.id = target_user_id;
  if account_created is null or account_created < launch_time or account_confirmed is null then return; end if;
  return query select p.id,p.tier,p.display_name,p.value_min_cents,p.value_max_cents,p.card_name,p.card_set,p.card_number,p.image_url,c.claimed_at from public.welcome_rip_claims c join public.welcome_rip_prizes p on p.id=c.prize_id where c.user_id=target_user_id;
  if found then return; end if;
  select p.id into selected_id from public.welcome_rip_prizes p where p.claimed_by is null order by random() limit 1 for update skip locked;
  if selected_id is null then return; end if;
  update public.welcome_rip_prizes set claimed_by=target_user_id,claimed_at=now() where id=selected_id;
  insert into public.welcome_rip_claims(user_id,prize_id) values(target_user_id,selected_id) on conflict(user_id) do nothing;
  return query select p.id,p.tier,p.display_name,p.value_min_cents,p.value_max_cents,p.card_name,p.card_set,p.card_number,p.image_url,c.claimed_at from public.welcome_rip_claims c join public.welcome_rip_prizes p on p.id=c.prize_id where c.user_id=target_user_id;
end; $$;
revoke all on function public.claim_welcome_rip(uuid) from public, anon, authenticated;
grant execute on function public.claim_welcome_rip(uuid) to service_role;

insert into public.welcome_rip_prizes(tier,display_name,value_min_cents,value_max_cents)
select 'bulk','Mystery Pokemon Card',10,99 from generate_series(1,55) where not exists(select 1 from public.welcome_rip_prizes)
union all select 'nice','Nice Pull - Mystery Pokemon Card',100,499 from generate_series(1,25) where not exists(select 1 from public.welcome_rip_prizes)
union all select 'good','Good Hit - Mystery Pokemon Card',500,999 from generate_series(1,12) where not exists(select 1 from public.welcome_rip_prizes)
union all select 'big','Big Hit - Mystery Pokemon Card',1000,2499 from generate_series(1,6) where not exists(select 1 from public.welcome_rip_prizes)
union all select 'chase','CHASE HIT - Mystery Pokemon Card',2500,5000 from generate_series(1,2) where not exists(select 1 from public.welcome_rip_prizes);
