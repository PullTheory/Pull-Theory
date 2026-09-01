-- Private, one-time lifecycle milestones for the PullShield operator dashboard.
-- Stores only a member UUID and milestone type; never names, emails, or card details.
create table if not exists public.lifecycle_events (
  id bigint generated always as identity primary key,
  member_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now(),
  unique (member_id, event_type)
);

create index if not exists lifecycle_events_type_idx on public.lifecycle_events (event_type);
alter table public.lifecycle_events enable row level security;
