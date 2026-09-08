create table if not exists public.marketing_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.marketing_preferences enable row level security;

create policy "Users can view their own marketing preference"
on public.marketing_preferences for select
using (auth.uid() = user_id);
