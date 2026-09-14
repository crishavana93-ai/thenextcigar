-- ─────────────────────────────────────────────────────────────
-- Migration 032 · let the admin read retailer_clicks
-- 031 created the table with RLS and no policies: writes go through the
-- service-role RPC, reads were "the SQL editor". The Lounge admin now has a
-- Clicks tab, so the admin (is_admin(), migration 004) may select. Nobody
-- else can; anon and members still see nothing.
-- ─────────────────────────────────────────────────────────────
create policy "retailer_clicks select: admin"
  on public.retailer_clicks
  for select
  to authenticated
  using (public.is_admin());
