-- Migration 037 · shop_orders: shipping fields for the "shipped" email
-- Run in the Supabase SQL editor.
alter table shop_orders
  add column if not exists tracking_number text,
  add column if not exists tracking_url    text,
  add column if not exists carrier         text,
  add column if not exists shipped_at      timestamptz,
  add column if not exists lines           jsonb;   -- [{name, qty, amount}] from Stripe
