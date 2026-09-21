-- Shop welcome code: one 10%-off promotion code per email, issued by
-- /api/shop/welcome and redeemed at Stripe Checkout. Apply in the SQL editor.
create table if not exists public.shop_welcome (
  email       text primary key,
  code        text not null,
  promo_id    text not null,
  source      text,
  created_at  timestamptz not null default now()
);
alter table public.shop_welcome enable row level security;
-- Service role only; no anon policies on purpose.
