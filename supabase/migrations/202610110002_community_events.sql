create table if not exists public.community_event_entries (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 event_slug text not null,
 entry_title text not null check (length(entry_title) between 3 and 100),
 entry_text text not null default '' check (length(entry_text) <= 1200),
 card_image_url text check (card_image_url is null or card_image_url ~ '^https?://'),
 is_public boolean not null default false,
 completed boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),

 check (length(event_slug) between 3 and 100)
 );
alter table public.community_event_entries drop constraint if exists community_event_entries_user_id_event_slug_key;
alter table public.community_event_entries enable row level security;
drop policy if exists "Public event entries and own entries are visible" on public.community_event_entries;
create policy "Public event entries and own entries are visible" on public.community_event_entries for select to anon, authenticated using (is_public = true or user_id = (select auth.uid()));
drop policy if exists "Collectors create their own event entries" on public.community_event_entries;
create policy "Collectors create their own event entries" on public.community_event_entries for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Collectors update their own event entries" on public.community_event_entries;
create policy "Collectors update their own event entries" on public.community_event_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "Collectors delete their own event entries" on public.community_event_entries;
create policy "Collectors delete their own event entries" on public.community_event_entries for delete to authenticated using (user_id = (select auth.uid()));
create index if not exists community_event_entries_event_created_idx on public.community_event_entries(event_slug,created_at desc);
