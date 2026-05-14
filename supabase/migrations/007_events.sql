-- ============================================================================
-- The Lounge — events + RSVPs (Phase 3)
-- ============================================================================
-- Adds the cigar_events table, event_rsvps table, RLS policies, and a day-of
-- reminder email cron job. Members RSVP to events; the day each event starts,
-- a Postgres pg_cron job calls send_lounge_email() (defined in migration 003)
-- to notify everyone who marked "going".
-- ============================================================================

-- 1. cigar_events ------------------------------------------------------------
create table if not exists public.cigar_events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  venue_id        uuid references public.partner_lounges(id) on delete set null,
  city            text not null,
  country         text,
  start_at        timestamptz not null,
  end_at          timestamptz,
  cover_image_url text,
  host_member_id  uuid references public.profiles(id) on delete set null,
  max_attendees   int,
  external_url    text,
  is_official     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  verified_at     timestamptz                                   -- null until admin approves
);

comment on table public.cigar_events is
  'Cigar events: brand launches, lounge events, festivals, member-hosted smokes.';
comment on column public.cigar_events.verified_at is
  'Only events with verified_at set are visible to members. Admin-curated workflow.';

create index if not exists cigar_events_city_idx on public.cigar_events (city);
create index if not exists cigar_events_start_at_idx on public.cigar_events (start_at);
create index if not exists cigar_events_verified_idx on public.cigar_events (verified_at)
  where verified_at is not null;

-- Auto-update updated_at on changes
create or replace function public.touch_cigar_events_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists touch_cigar_events_updated_at on public.cigar_events;
create trigger touch_cigar_events_updated_at
  before update on public.cigar_events
  for each row execute function public.touch_cigar_events_updated_at();

-- RLS for cigar_events
alter table public.cigar_events enable row level security;

drop policy if exists "events read: members" on public.cigar_events;
create policy "events read: members"
  on public.cigar_events for select
  to authenticated
  using (verified_at is not null);

drop policy if exists "events all: admin" on public.cigar_events;
create policy "events all: admin"
  on public.cigar_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 2. event_rsvps -------------------------------------------------------------
create table if not exists public.event_rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.cigar_events(id) on delete cascade,
  member_id   uuid not null references public.profiles(id) on delete cascade,
  status      text not null check (status in ('going', 'maybe', 'not_going')),
  created_at  timestamptz not null default now(),
  unique (event_id, member_id)
);

create index if not exists event_rsvps_event_idx on public.event_rsvps (event_id);
create index if not exists event_rsvps_member_idx on public.event_rsvps (member_id);

alter table public.event_rsvps enable row level security;

-- Members can read RSVPs (so we can show attendee count + "you're going")
drop policy if exists "rsvps read: members" on public.event_rsvps;
create policy "rsvps read: members"
  on public.event_rsvps for select
  to authenticated
  using (true);

-- Members can insert their own RSVP
drop policy if exists "rsvps insert: self" on public.event_rsvps;
create policy "rsvps insert: self"
  on public.event_rsvps for insert
  to authenticated
  with check (member_id = auth.uid());

-- Members can update their own RSVP
drop policy if exists "rsvps update: self" on public.event_rsvps;
create policy "rsvps update: self"
  on public.event_rsvps for update
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- Members can delete their own RSVP
drop policy if exists "rsvps delete: self" on public.event_rsvps;
create policy "rsvps delete: self"
  on public.event_rsvps for delete
  to authenticated
  using (member_id = auth.uid());

-- Admin can do anything with RSVPs (clean up bad data, etc.)
drop policy if exists "rsvps all: admin" on public.event_rsvps;
create policy "rsvps all: admin"
  on public.event_rsvps for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Day-of reminder email --------------------------------------------------
-- For each member who marked "going" on an event starting today, send a
-- branded reminder. Runs daily at 09:00 UTC via pg_cron.

create or replace function public.send_event_day_reminders()
returns int
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  reminder_count int := 0;
  ev record;
  rsvp record;
  venue_name text;
  subject text;
  html_body text;
begin
  for ev in
    select e.*, l.name as venue_name_resolved
    from public.cigar_events e
    left join public.partner_lounges l on l.id = e.venue_id
    where e.verified_at is not null
      and e.start_at >= date_trunc('day', now() at time zone 'UTC')
      and e.start_at <  date_trunc('day', now() at time zone 'UTC') + interval '1 day'
  loop
    venue_name := coalesce(ev.venue_name_resolved, ev.city);
    subject := 'Tonight at the Lounge: ' || ev.title;

    for rsvp in
      select r.member_id, p.display_name, u.email
      from public.event_rsvps r
      join public.profiles p on p.id = r.member_id
      join auth.users u on u.id = r.member_id
      where r.event_id = ev.id
        and r.status = 'going'
        and u.email is not null
    loop
      html_body := public.lounge_email_layout(
        'Tonight at the Lounge',
        '<p>Hey ' || coalesce(rsvp.display_name, 'there') || ',</p>' ||
        '<p>Just a reminder — <strong>' || ev.title || '</strong> is happening tonight at <strong>' ||
        venue_name || '</strong>, ' || to_char(ev.start_at, 'HH24:MI') || '.</p>' ||
        case
          when ev.description is not null and ev.description <> ''
            then '<p>' || ev.description || '</p>'
          else ''
        end ||
        '<p><a href="https://lounge.thenextcigar.com/lounge/app/events/?id=' || ev.id::text ||
        '" style="background:#c9a961;color:#1a1d2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;">View event</a></p>'
      );
      perform public.send_lounge_email(rsvp.email, subject, html_body);
      reminder_count := reminder_count + 1;
    end loop;
  end loop;

  return reminder_count;
end;
$$;

-- Schedule the reminder — daily at 09:00 UTC. Wrapped in a DO block so the
-- whole migration succeeds even if pg_cron isn't enabled yet. If pg_cron is
-- present, the schedule is registered (idempotent). If not, the function still
-- gets created and can be triggered manually or by a Cloudflare scheduled
-- worker. Enable pg_cron via Supabase → Database → Extensions to activate.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Drop any existing schedule so this is re-runnable.
    begin
      perform cron.unschedule('lounge-event-day-reminders');
    exception when others then
      -- Job doesn't exist yet — fine.
      null;
    end;
    perform cron.schedule(
      'lounge-event-day-reminders',
      '0 9 * * *',                          -- daily at 09:00 UTC
      $job$ select public.send_event_day_reminders(); $job$
    );
    raise notice 'pg_cron job lounge-event-day-reminders scheduled (09:00 UTC daily)';
  else
    raise notice 'pg_cron extension not enabled — reminders must be triggered manually. Enable via Supabase → Database → Extensions → pg_cron, then re-run this migration.';
  end if;
end $$;

-- 4. New-event email (city match) -------------------------------------------
-- When an event is verified (admin approves), notify all members in that city.

create or replace function public.notify_new_event()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  member record;
  venue_name text;
  subject text;
  html_body text;
begin
  -- Only fire when transitioning from unverified to verified, not on every update
  if NEW.verified_at is null then return NEW; end if;
  if TG_OP = 'UPDATE' and OLD.verified_at is not null then return NEW; end if;

  select name into venue_name from public.partner_lounges where id = NEW.venue_id;

  subject := 'New in ' || NEW.city || ': ' || NEW.title;

  for member in
    select p.id, p.display_name, u.email
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(p.city) = lower(NEW.city)
      and u.email is not null
    limit 100
  loop
    html_body := public.lounge_email_layout(
      'New event in ' || NEW.city,
      '<p>Hey ' || coalesce(member.display_name, 'there') || ',</p>' ||
      '<p>A new event in your city: <strong>' || NEW.title || '</strong>' ||
      case when venue_name is not null then ' at <strong>' || venue_name || '</strong>' else '' end ||
      ', ' || to_char(NEW.start_at, 'Mon DD, HH24:MI') || '.</p>' ||
      case when NEW.description is not null and NEW.description <> ''
        then '<p>' || NEW.description || '</p>' else '' end ||
      '<p><a href="https://lounge.thenextcigar.com/lounge/app/events/?id=' || NEW.id::text ||
      '" style="background:#c9a961;color:#1a1d2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;">RSVP / details</a></p>'
    );
    perform public.send_lounge_email(member.email, subject, html_body);
  end loop;

  return NEW;
end;
$$;

drop trigger if exists notify_new_event_trigger on public.cigar_events;
create trigger notify_new_event_trigger
  after insert or update of verified_at on public.cigar_events
  for each row execute function public.notify_new_event();
