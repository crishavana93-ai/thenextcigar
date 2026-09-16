-- 036 · Passport stamps: every check-in stamps its city on the member's
-- passport. A separate table because checkins are readable only while
-- active (policy "checkins read: active only"), and a passport is the
-- history. Filled by trigger; readable by every member; never written by
-- the client.
create table if not exists public.passport_stamps (
  member_id  uuid not null references public.profiles(id) on delete cascade,
  city       text not null,
  country    text not null default '',
  first_at   timestamptz not null default now(),
  last_at    timestamptz not null default now(),
  checkins   integer not null default 1,
  primary key (member_id, city, country)
);
alter table public.passport_stamps enable row level security;
drop policy if exists "stamps read: members" on public.passport_stamps;
create policy "stamps read: members" on public.passport_stamps for select to authenticated using (true);

create or replace function public.stamp_passport()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_city text; v_country text;
begin
  select city, country into v_city, v_country from public.partner_lounges where id = new.lounge_id;
  if v_city is null then return new; end if;
  insert into public.passport_stamps (member_id, city, country, first_at, last_at, checkins)
  values (new.member_id, v_city, coalesce(v_country, ''), coalesce(new.checked_in_at, now()), coalesce(new.checked_in_at, now()), 1)
  on conflict (member_id, city, country)
  do update set last_at = excluded.last_at, checkins = public.passport_stamps.checkins + 1;
  return new;
end $$;

drop trigger if exists checkins_stamp_passport on public.checkins;
create trigger checkins_stamp_passport after insert on public.checkins
  for each row execute function public.stamp_passport();

-- Backfill from the check-ins still in the table.
insert into public.passport_stamps (member_id, city, country, first_at, last_at, checkins)
select c.member_id, l.city, coalesce(l.country, ''), min(c.checked_in_at), max(c.checked_in_at), count(*)
from public.checkins c join public.partner_lounges l on l.id = c.lounge_id
group by c.member_id, l.city, l.country
on conflict (member_id, city, country) do nothing;
