-- Pull Theory third-party card sales. This extends the existing marketplace
-- without changing or removing its card-for-card trade behavior.

alter table public.trades
  add column if not exists listing_type text not null default 'trade',
  add column if not exists sale_price_cents integer,
  add column if not exists currency text not null default 'usd';

alter table public.trades
  drop constraint if exists trades_listing_type_check;

alter table public.trades
  add constraint trades_listing_type_check
  check (listing_type in ('trade', 'sell', 'trade_or_sell'));

alter table public.trades
  drop constraint if exists trades_sale_price_cents_check;

alter table public.trades
  add constraint trades_sale_price_cents_check
  check (sale_price_cents is null or sale_price_cents >= 100);

create table if not exists public.seller_accounts (
  user_id text primary key,
  stripe_account_id text not null unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sale_orders (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.trades(id),
  seller_user_id text not null,
  buyer_user_id text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_transfer_id text unique,
  stripe_refund_id text,
  currency text not null default 'usd',
  item_amount_cents integer not null,
  platform_fee_cents integer not null default 0,
  seller_payout_cents integer not null,
  payment_status text not null default 'pending',
  authentication_status text not null default 'not_started',
  order_status text not null default 'checkout_started',
  seller_tracking_number text,
  buyer_tracking_number text,
  dispute_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (seller_user_id <> buyer_user_id),
  check (item_amount_cents >= 100),
  check (platform_fee_cents >= 0),
  check (seller_payout_cents >= 0)
);

create index if not exists sale_orders_seller_user_id_idx on public.sale_orders(seller_user_id, created_at desc);
create index if not exists sale_orders_buyer_user_id_idx on public.sale_orders(buyer_user_id, created_at desc);
create index if not exists sale_orders_listing_id_idx on public.sale_orders(listing_id);

alter table public.seller_accounts enable row level security;
alter table public.sale_orders enable row level security;

drop policy if exists "Sellers can view their own Connect account" on public.seller_accounts;
create policy "Sellers can view their own Connect account"
on public.seller_accounts for select
using (auth.uid()::text = user_id);

drop policy if exists "Sale participants can view their orders" on public.sale_orders;
create policy "Sale participants can view their orders"
on public.sale_orders for select
using (auth.uid()::text = seller_user_id or auth.uid()::text = buyer_user_id);
