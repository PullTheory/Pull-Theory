create table if not exists public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'collector',
  status text not null default 'active',
  authentication_credits integer not null default 0,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  updated_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

create policy "Users can view their own membership"
on public.memberships for select
using (auth.uid() = user_id);
