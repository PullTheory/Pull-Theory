alter table public.sale_orders
  add column if not exists platform_fee_bps integer not null default 800,
  add column if not exists seller_plan text not null default 'collector';

alter table public.sale_orders
  drop constraint if exists sale_orders_platform_fee_bps_check;

alter table public.sale_orders
  add constraint sale_orders_platform_fee_bps_check
  check (platform_fee_bps >= 0 and platform_fee_bps <= 10000);

alter table public.sale_orders
  drop constraint if exists sale_orders_seller_plan_check;

alter table public.sale_orders
  add constraint sale_orders_seller_plan_check
  check (seller_plan in ('collector', 'trader', 'pro', 'elite'));