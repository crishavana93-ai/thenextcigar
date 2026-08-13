-- ─────────────────────────────────────────────────────────────
-- Migration 027 · shop_orders
-- Drop-ship order pipeline: customer buys via Stripe on TNC, we
-- forward the shipping address to the Alibaba/CJ supplier by hand,
-- track fulfilment status here.
--
-- Auth: RLS on. Only service_role can insert (Cloudflare Worker).
-- Reads: only Cris via authenticated role + admin claim.
-- ─────────────────────────────────────────────────────────────

create table if not exists shop_orders (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,

  -- What was bought
  product_slug      text not null,
  product_name      text not null,
  product_sku       text,
  quantity          int not null default 1,
  supplier          text,       -- "CJ Dropshipping", "Alibaba: XYZ Factory"
  supplier_url      text,       -- direct product URL at the supplier (from mdx frontmatter)

  -- Money
  amount            numeric(10, 2) not null,
  currency          text not null default 'USD',

  -- Customer
  customer_email    text not null,
  customer_name     text,

  -- Shipping (populated from Stripe checkout session)
  shipping_name     text,
  shipping_line1    text,
  shipping_line2    text,
  shipping_city     text,
  shipping_state    text,
  shipping_postal   text,
  shipping_country  text,
  shipping_phone    text,

  -- Fulfilment status — Cris updates by hand as he forwards orders
  status            text not null default 'paid',
  -- Allowed values: 'paid' | 'forwarded_to_supplier' | 'shipped' | 'delivered' | 'refunded' | 'cancelled'
  tracking_number   text,
  tracking_carrier  text,
  forwarded_at      timestamptz,
  shipped_at        timestamptz,
  delivered_at      timestamptz,

  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Ordering
create index if not exists shop_orders_created_at_idx on shop_orders (created_at desc);
create index if not exists shop_orders_status_idx     on shop_orders (status);
create index if not exists shop_orders_slug_idx       on shop_orders (product_slug);

-- Keep updated_at fresh on any UPDATE
create or replace function shop_orders_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists shop_orders_touch on shop_orders;
create trigger shop_orders_touch
  before update on shop_orders
  for each row execute function shop_orders_touch_updated_at();

-- RLS: shut down direct client access. Only service_role writes; only Cris reads.
alter table shop_orders enable row level security;

-- Cris's admin read policy — matches how founder-member checks are done elsewhere
drop policy if exists shop_orders_admin_read on shop_orders;
create policy shop_orders_admin_read on shop_orders
  for select using (auth.jwt() ->> 'email' = 'guatabeycigars@gmail.com');

-- Grant service_role full access (bypasses RLS anyway, but explicit is nicer)
grant all on shop_orders to service_role;

comment on table shop_orders is 'Stripe → drop-ship pipeline. Customer pays TNC via Stripe; Cris forwards to Alibaba/CJ by hand. See functions/api/shop/webhook.ts.';
