-- Cards a collector is actively looking for. These records power private PullMatches.
create table if not exists public.wanted_cards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text,
  card_name text not null,
  card_set text,
  card_number text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists wanted_cards_user_id_idx on public.wanted_cards (user_id);
create index if not exists wanted_cards_card_name_idx on public.wanted_cards (card_name);

alter table public.wanted_cards enable row level security;

create policy "Collectors manage their own want list"
  on public.wanted_cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
