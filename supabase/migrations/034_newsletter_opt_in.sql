-- ─────────────────────────────────────────────────────────────
-- Migration 034 · newsletter consent on the profile
-- The Lounge signup never asked about the newsletter, so a Lounge member
-- is not a newsletter subscriber and cannot be mailed one (GDPR art. 6,
-- marknadsföringslagen 19 §). Now the signup form has an unchecked box;
-- a tick is carried in the auth metadata and lands here with a timestamp.
-- Existing members stay NULL until they say yes themselves.
-- ─────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists newsletter_opt_in_at timestamptz;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, joined_at, last_active_at, newsletter_opt_in_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'New Member'),
    now(), now(),
    case when coalesce(new.raw_user_meta_data->>'newsletter', '') in ('1', 'true', 'yes') then now() else null end
  );
  return new;
end;
$$;

-- The list you may mail from the Lounge side — run in the SQL editor, export CSV, import to MailerLite:
--   select u.email, p.display_name, p.newsletter_opt_in_at
--   from public.profiles p join auth.users u on u.id = p.id
--   where p.newsletter_opt_in_at is not null order by p.newsletter_opt_in_at;
