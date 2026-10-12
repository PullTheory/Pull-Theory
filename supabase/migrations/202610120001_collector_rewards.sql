-- Collector rewards: participation, completed marketplace trades, and helpful community behavior.
create table if not exists public.collector_reward_ledger (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 points integer not null check (points > 0),
 reason text not null check (reason in ('weekly_event_participation','completed_trade','helpful_community')),
 source_type text not null check (source_type in ('event_week','trade','appreciation')),
 source_id text not null,
 created_at timestamptz not null default now(),
 unique (user_id, source_type, source_id)
);
alter table public.collector_reward_ledger enable row level security;
drop policy if exists "Collector reward totals are readable" on public.collector_reward_ledger;
create policy "Collector reward totals are readable" on public.collector_reward_ledger for select to anon, authenticated using (true);
grant select on public.collector_reward_ledger to anon, authenticated;

create table if not exists public.community_appreciations (
 id uuid primary key default gen_random_uuid(),
 giver_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 entry_id uuid not null references public.community_event_entries(id) on delete cascade,
 week_start date not null default (date_trunc('week', now())::date),
 created_at timestamptz not null default now(),
 constraint community_appreciations_not_self check (giver_id <> recipient_id),
 unique (giver_id, recipient_id, week_start)
);
alter table public.community_appreciations enable row level security;
drop policy if exists "Collectors can appreciate public entries" on public.community_appreciations;
create policy "Collectors can appreciate public entries" on public.community_appreciations for insert to authenticated
 with check (
  giver_id = (select auth.uid())
  and giver_id <> recipient_id
  and exists (
   select 1 from public.community_event_entries e
   where e.id = entry_id and e.user_id = recipient_id and e.is_public = true
  )
 );
drop policy if exists "Appreciations are publicly readable" on public.community_appreciations;
drop policy if exists "Collectors can read their appreciations" on public.community_appreciations;
create policy "Collectors can read their appreciations" on public.community_appreciations for select to authenticated
 using (giver_id = (select auth.uid()) or recipient_id = (select auth.uid()));
grant select, insert on public.community_appreciations to anon, authenticated;

create or replace function public.set_community_appreciation_recipient()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare entry_owner uuid;
begin
 select e.user_id into entry_owner from public.community_event_entries e
 where e.id = new.entry_id and e.is_public = true;
 if entry_owner is null or entry_owner = new.giver_id then
  raise exception 'You can only appreciate another collector’s public entry.';
 end if;
 new.recipient_id := entry_owner;
 new.week_start := date_trunc('week', now())::date;
 return new;
end;
$$;
revoke all on function public.set_community_appreciation_recipient() from public, anon, authenticated;
drop trigger if exists set_community_appreciation_recipient on public.community_appreciations;
create trigger set_community_appreciation_recipient before insert on public.community_appreciations
 for each row execute function public.set_community_appreciation_recipient();

create or replace function public.award_community_entry_points()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
 insert into public.collector_reward_ledger(user_id,points,reason,source_type,source_id)
 values (new.user_id,5,'weekly_event_participation','event_week',
         new.event_slug || ':' || date_trunc('week', coalesce(new.created_at, now()))::date::text)
 on conflict (user_id,source_type,source_id) do nothing;
 return new;
end;
$$;
revoke all on function public.award_community_entry_points() from public, anon, authenticated;
drop trigger if exists award_community_entry_points on public.community_event_entries;
create trigger award_community_entry_points after insert on public.community_event_entries
 for each row execute function public.award_community_entry_points();

create or replace function public.award_helpful_community_points()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
 insert into public.collector_reward_ledger(user_id,points,reason,source_type,source_id)
 values (new.recipient_id,3,'helpful_community','appreciation',new.id::text)
 on conflict (user_id,source_type,source_id) do nothing;
 return new;
end;
$$;
revoke all on function public.award_helpful_community_points() from public, anon, authenticated;
drop trigger if exists award_helpful_community_points on public.community_appreciations;
create trigger award_helpful_community_points after insert on public.community_appreciations
 for each row execute function public.award_helpful_community_points();

create or replace function public.award_completed_trade_points()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare owner_id uuid;
declare offerer_id uuid;
begin
 if new.status in ('completed','verified') and coalesce(old.status,'') not in ('completed','verified')
    and coalesce(new.is_listing,false) = false and new.listing_id is not null then
  if new.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
   offerer_id := new.user_id::uuid;
  end if;
  select case when t.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then t.user_id::uuid else null end
   into owner_id from public.trades t where t.id = new.listing_id and t.is_listing = true;
  if offerer_id is not null then
   insert into public.collector_reward_ledger(user_id,points,reason,source_type,source_id)
   values (offerer_id,20,'completed_trade','trade',new.id::text)
   on conflict (user_id,source_type,source_id) do nothing;
  end if;
  if owner_id is not null and owner_id is distinct from offerer_id then
   insert into public.collector_reward_ledger(user_id,points,reason,source_type,source_id)
   values (owner_id,20,'completed_trade','trade',new.id::text)
   on conflict (user_id,source_type,source_id) do nothing;
  end if;
 end if;
 return new;
end;
$$;
revoke all on function public.award_completed_trade_points() from public, anon, authenticated;
drop trigger if exists award_completed_trade_points on public.trades;
create trigger award_completed_trade_points after update of status on public.trades
 for each row execute function public.award_completed_trade_points();

create or replace view public.collector_reward_leaderboard with (security_invoker = true) as
 select cs.username, cs.display_name, coalesce(sum(l.points),0)::integer as points
 from public.collector_showcases cs
 left join public.collector_reward_ledger l on l.user_id = cs.user_id
 where cs.is_public = true
 group by cs.username, cs.display_name;
grant select on public.collector_reward_leaderboard to anon, authenticated;
