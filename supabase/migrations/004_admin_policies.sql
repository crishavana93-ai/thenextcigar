-- ============================================================================
-- The Lounge — admin policies (Phase 3)
-- ============================================================================
-- Adds a single is_admin() helper and a set of policies that allow Cris (the
-- founder) to update any profile (mark Founding, Host, etc.) and any partner
-- lounge (verify, edit) directly through the /lounge/app/admin/ page in the
-- browser. No service-role key in client code; everything stays under RLS.
--
-- Admin set is hard-coded to a small list of emails. If you bring on a
-- second admin later, edit the function and re-run.
-- ============================================================================

-- 1. Helper: is the calling user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (select email in ('guatabeycigars@gmail.com')
     from auth.users
     where id = auth.uid()),
    false
  );
$$;

-- 2. Allow admin to update any profile
--    (existing "profiles update: self only" stays; this is an additional policy)
drop policy if exists "profiles update: admin" on public.profiles;
create policy "profiles update: admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Allow admin to update any partner lounge (verify, edit perks, etc.)
drop policy if exists "partner_lounges update: admin" on public.partner_lounges;
create policy "partner_lounges update: admin"
  on public.partner_lounges for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Allow admin to insert new partner lounges (manual additions outside the seed)
drop policy if exists "partner_lounges insert: admin" on public.partner_lounges;
create policy "partner_lounges insert: admin"
  on public.partner_lounges for insert
  to authenticated
  with check (public.is_admin());

-- 5. Allow admin to delete any introduction (clean up spam / abusive requests)
drop policy if exists "introductions delete: admin" on public.introductions;
create policy "introductions delete: admin"
  on public.introductions for delete
  to authenticated
  using (public.is_admin());

-- 6. Allow admin to delete any check-in (clean up old / abusive ones)
drop policy if exists "checkins delete: admin" on public.checkins;
create policy "checkins delete: admin"
  on public.checkins for delete
  to authenticated
  using (public.is_admin());
