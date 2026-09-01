-- Private, aggregate-only website traffic for the PullShield Desk.
-- Visitor IDs are randomly generated in the browser; no names, emails, or IP addresses are stored.
create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  path text not null default '/',
  visited_at timestamptz not null default now()
);

create index if not exists site_visits_visited_at_idx on public.site_visits (visited_at desc);
create index if not exists site_visits_visitor_id_idx on public.site_visits (visitor_id);

alter table public.site_visits enable row level security;
