-- ─────────────────────────────────────────────────────────────
-- Migration 033 · delete_my_account()
-- A member can leave, taking their data with them. Deleting the auth user
-- cascades to profiles and from there to check-ins, messages, intros,
-- travel plans, RSVPs, humidor entries, code redemptions (all `on delete
-- cascade` since 001). Things that must not cascade are handled first:
-- their price-alert subscription (linked by profile_id set-null, so it
-- would otherwise survive as an orphan holding their email), and the
-- reviewed_by pointer on community submissions, which has no cascade.
-- Their shop submissions stay (submitted_by is set null) — a shop on the
-- map is a public fact, not personal data.
-- Runs as the caller only: auth.uid() is the only account it can delete.
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from public.finder_watchlists
    where subscriber_id in (select id from public.finder_email_subscribers where profile_id = uid);
  delete from public.finder_release_watchlists
    where subscriber_id in (select id from public.finder_email_subscribers where profile_id = uid);
  delete from public.finder_email_subscribers where profile_id = uid;
  update public.community_submissions set reviewed_by = null where reviewed_by = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
