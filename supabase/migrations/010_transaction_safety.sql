-- Transaction safety: serialize marketplace checkout per listing and prevent
-- a refund after a seller payout has already been released.

create or replace function public.reserve_marketplace_sale_order(
  p_listing_id bigint,
  p_buyer_user_id text,
  p_platform_fee_cents integer,
  p_platform_fee_bps integer,
  p_seller_plan text
)
returns public.sale_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.trades%rowtype;
  v_existing public.sale_orders%rowtype;
  v_order public.sale_orders%rowtype;
begin
  -- Serialize buyers attempting to purchase the same listing.
  select * into v_listing
  from public.trades
  where id = p_listing_id
  for update;

  if not found
     or v_listing.is_listing is distinct from true
     or coalesce(v_listing.status, 'pending') <> 'pending'
     or v_listing.listing_type not in ('sell', 'trade_or_sell')
     or coalesce(v_listing.sale_price_cents, 0) < 100
  then
    raise exception using errcode = 'P0001', message = 'LISTING_UNAVAILABLE';
  end if;

  if v_listing.user_id is null or v_listing.user_id::text = p_buyer_user_id then
    raise exception using errcode = 'P0001', message = 'LISTING_UNAVAILABLE';
  end if;

  select * into v_existing
  from public.sale_orders
  where listing_id = p_listing_id
    and order_status in (
      'checkout_started', 'payment_received', 'waiting_for_seller_shipment',
      'received_by_pulltheory', 'authentication_in_progress',
      'authentication_passed', 'shipped_to_buyer'
    )
  order by id desc
  limit 1
  for update;

  if found then
    if v_existing.buyer_user_id = p_buyer_user_id
       and v_existing.order_status = 'checkout_started'
       and v_existing.payment_status = 'pending'
    then
      return v_existing;
    end if;
    raise exception using errcode = 'P0001', message = 'LISTING_CHECKOUT_IN_PROGRESS';
  end if;

  insert into public.sale_orders (
    listing_id, seller_user_id, buyer_user_id, currency,
    item_amount_cents, platform_fee_cents, platform_fee_bps,
    seller_plan, seller_payout_cents, payment_status,
    authentication_status, order_status
  ) values (
    v_listing.id, v_listing.user_id::text, p_buyer_user_id, coalesce(v_listing.currency, 'usd'),
    v_listing.sale_price_cents, p_platform_fee_cents, p_platform_fee_bps,
    p_seller_plan, greatest(0, v_listing.sale_price_cents - p_platform_fee_cents),
    'pending', 'not_started', 'checkout_started'
  ) returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.reserve_marketplace_sale_order(bigint, text, integer, integer, text) from public, anon, authenticated;
grant execute on function public.reserve_marketplace_sale_order(bigint, text, integer, integer, text) to service_role;

-- Keep a payout from ever being followed by a normal refund path. The
-- application also enforces this transition guard, but this constraint makes
-- the invariant explicit in the database.
alter table public.sale_orders
  drop constraint if exists sale_orders_payout_refund_guard;

alter table public.sale_orders
  add constraint sale_orders_payout_refund_guard
  check (stripe_transfer_id is null or stripe_refund_id is null);
