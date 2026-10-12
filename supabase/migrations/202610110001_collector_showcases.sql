create table if not exists public.collector_showcases (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null default '',
 bio text not null default '' check (length(bio) <= 500),
 favorite_pokemon text not null default '' check (length(favorite_pokemon) <= 80),
 favorite_card text not null default '' check (length(favorite_card) <= 120),
 favorite_card_image_url text check (favorite_card_image_url is null or favorite_card_image_url ~ '^https?://'),
 completed_sets text[] not null default '{}'::text[],
 hunting_for text[] not null default '{}'::text[],
 is_public boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.collector_showcases enable row level security;
drop policy if exists "Public collector showcases are visible" on public.collector_showcases;
create policy "Public collector showcases are visible" on public.collector_showcases for select to anon, authenticated using (is_public = true or user_id = (select auth.uid()));
drop policy if exists "Collectors create their own showcase" on public.collector_showcases;
create policy "Collectors create their own showcase" on public.collector_showcases for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Collectors update their own showcase" on public.collector_showcases;
create policy "Collectors update their own showcase" on public.collector_showcases for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index if not exists collector_showcases_public_username_idx on public.collector_showcases (username) where is_public = true;
