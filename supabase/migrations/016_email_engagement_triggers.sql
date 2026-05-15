-- ============================================================================
-- The Lounge — email engagement triggers (migration 016)
-- ============================================================================
-- Three triggers that close engagement gaps in the founding-cohort phase:
--
--   1. new_dm_received      — emails recipient when a direct message arrives
--   2. welcome_email_sent   — emails new members once their welcome flow finishes
--   3. weekly_city_digest   — Sunday 09:00 UTC summary of each city's week
--
-- All three reuse send_lounge_email() + lounge_email_layout() from migration
-- 003, so the brand voice and Resend wiring stay consistent.
-- ============================================================================

-- ── 1. New DM received ──────────────────────────────────────────────────
-- Fires once per inserted message. Coalesces if the sender hammers send by
-- only emailing if there's been no previous unread message from the same
-- sender in the last 30 min (avoids spam from a quick burst of messages).

create or replace function public.notify_new_dm()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  recipient_email text;
  recipient_name text;
  sender_name text;
  recent_count int;
  preview text;
  subject text;
  html_body text;
begin
  -- Skip self-sends defensively (RLS should already prevent these)
  if NEW.sender_id = NEW.recipient_id then return NEW; end if;

  -- Look up recipient email + display name
  select u.email, p.display_name into recipient_email, recipient_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = NEW.recipient_id;
  if recipient_email is null then return NEW; end if;

  -- Look up sender display name
  select p.display_name into sender_name from public.profiles p where p.id = NEW.sender_id;
  if sender_name is null then sender_name := 'Member'; end if;

  -- Coalesce: skip if there's already been a message from this sender in the
  -- last 30 minutes that hasn't been read yet. Avoids spamming the recipient
  -- when the sender writes 5 quick lines in a row.
  select count(*) into recent_count
  from public.direct_messages dm
  where dm.sender_id    = NEW.sender_id
    and dm.recipient_id = NEW.recipient_id
    and dm.read_at is null
    and dm.created_at > NEW.created_at - interval '30 minutes'
    and dm.id <> NEW.id;
  if recent_count > 0 then return NEW; end if;

  -- Preview the message (first 140 chars)
  preview := substring(NEW.body from 1 for 140);
  if char_length(NEW.body) > 140 then preview := preview || '…'; end if;

  subject := sender_name || ' sent you a note on The Lounge';

  html_body := public.lounge_email_layout(
    sender_name || ' sent you a note',
    '<p>Hey ' || coalesce(recipient_name, 'there') || ',</p>' ||
    '<p><strong>' || sender_name || '</strong> just sent you a message:</p>' ||
    '<blockquote style="border-left:3px solid #c9a961;padding-left:14px;margin:14px 0;color:#555;font-style:italic;">' ||
    preview || '</blockquote>' ||
    '<p><a href="https://lounge.thenextcigar.com/lounge/app/messages/?with=' || NEW.sender_id::text ||
    '" style="background:#c9a961;color:#1a1d2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;">Open thread</a></p>'
  );

  perform public.send_lounge_email(recipient_email, subject, html_body);
  return NEW;
end;
$$;

drop trigger if exists notify_new_dm_trigger on public.direct_messages;
create trigger notify_new_dm_trigger
  after insert on public.direct_messages
  for each row execute function public.notify_new_dm();

-- ── 2. Welcome email after onboarding ──────────────────────────────────
-- Fires when a profile's city transitions from null to a value, which is
-- our "completed the welcome flow" signal. One-shot — won't re-fire if the
-- member edits their city later.

create or replace function public.send_welcome_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_email text;
  display_name text;
  subject text;
  html_body text;
begin
  -- Only fire when city is being set for the first time
  if NEW.city is null or NEW.city = '' then return NEW; end if;
  if TG_OP = 'UPDATE' and OLD.city is not null and OLD.city <> '' then return NEW; end if;

  select email into user_email from auth.users where id = NEW.id;
  if user_email is null then return NEW; end if;

  display_name := coalesce(NEW.display_name, 'there');

  subject := 'Welcome to The Lounge';

  html_body := public.lounge_email_layout(
    'You''re in.',
    '<p>Hey ' || display_name || ',</p>' ||
    '<p>You just joined The Lounge from <strong>' || NEW.city || '</strong>. Here''s how to make this useful in the next 5 minutes:</p>' ||
    '<ol style="line-height:1.7;">' ||
    '<li><strong>Open the map</strong> — see who''s checked in nearby and what venues are vetted in your city.</li>' ||
    '<li><strong>Set your flavor profile</strong> — brands, notes, strength. Members with overlapping taste surface on your Discover tab.</li>' ||
    '<li><strong>Declare a trip</strong> — got travel coming up? Locals in that city get a quiet ping so introductions start before you land.</li>' ||
    '</ol>' ||
    '<p><a href="https://lounge.thenextcigar.com/lounge/app/" style="background:#c9a961;color:#1a1d2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;">Open The Lounge</a></p>' ||
    '<p style="margin-top:24px;color:#555;font-size:0.9em;">— Cris<br/>Founder, The Next Cigar</p>'
  );

  perform public.send_lounge_email(user_email, subject, html_body);
  return NEW;
end;
$$;

drop trigger if exists send_welcome_email_trigger on public.profiles;
create trigger send_welcome_email_trigger
  after insert or update of city on public.profiles
  for each row execute function public.send_welcome_email();

-- ── 3. Weekly city digest (Sunday 09:00 UTC) ───────────────────────────
-- For each city with active members, compose a one-shot summary of:
--   • New members this week
--   • Check-ins this week
--   • Upcoming events next week
-- And mail it to every member in that city.

create or replace function public.send_weekly_city_digests()
returns int
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total_sent int := 0;
  city_rec record;
  member_rec record;
  new_members_count int;
  checkin_count int;
  event_rec record;
  events_html text;
  subject text;
  html_body text;
begin
  -- For each city with at least one active member
  for city_rec in
    select distinct lower(p.city) as city_lower, p.city as city, p.country_code
    from public.profiles p
    where p.city is not null and p.city <> ''
  loop
    -- Count new members in this city this week
    select count(*) into new_members_count
    from public.profiles p
    where lower(p.city) = city_rec.city_lower
      and p.joined_at > now() - interval '7 days';

    -- Count check-ins this week at venues in this city
    select count(c.id) into checkin_count
    from public.checkins c
    join public.partner_lounges l on l.id = c.lounge_id
    where lower(l.city) = city_rec.city_lower
      and c.checked_in_at > now() - interval '7 days';

    -- Skip cities with no activity this week
    if new_members_count = 0 and checkin_count = 0 then continue; end if;

    -- Build the events list for next 14 days
    events_html := '';
    for event_rec in
      select e.id, e.title, e.start_at
      from public.cigar_events e
      where lower(e.city) = city_rec.city_lower
        and e.verified_at is not null
        and e.start_at > now()
        and e.start_at < now() + interval '14 days'
      order by e.start_at
      limit 5
    loop
      events_html := events_html ||
        '<li><a href="https://lounge.thenextcigar.com/lounge/app/events/?id=' || event_rec.id::text ||
        '" style="color:#c9a961;text-decoration:underline;">' || event_rec.title || '</a> — ' ||
        to_char(event_rec.start_at, 'Mon DD, HH24:MI') || '</li>';
    end loop;

    subject := 'This week in ' || city_rec.city || ' on The Lounge';

    -- For each member in this city, send the digest
    for member_rec in
      select p.id, p.display_name, u.email
      from public.profiles p
      join auth.users u on u.id = p.id
      where lower(p.city) = city_rec.city_lower
        and u.email is not null
    loop
      html_body := public.lounge_email_layout(
        'This week in ' || city_rec.city,
        '<p>Hey ' || coalesce(member_rec.display_name, 'there') || ',</p>' ||
        '<p>Quick digest of what happened in <strong>' || city_rec.city || '</strong> this week on The Lounge:</p>' ||
        '<ul style="line-height:1.7;">' ||
          case when new_members_count > 0
            then '<li><strong>' || new_members_count::text || ' new member' ||
                 case when new_members_count = 1 then '' else 's' end ||
                 '</strong> joined from ' || city_rec.city || '</li>'
            else '' end ||
          case when checkin_count > 0
            then '<li><strong>' || checkin_count::text || ' check-in' ||
                 case when checkin_count = 1 then '' else 's' end ||
                 '</strong> at local venues</li>'
            else '' end ||
        '</ul>' ||
        case when events_html <> '' then
          '<p style="margin-top:20px;"><strong>Upcoming next two weeks:</strong></p>' ||
          '<ul style="line-height:1.7;">' || events_html || '</ul>'
        else '' end ||
        '<p style="margin-top:24px;"><a href="https://lounge.thenextcigar.com/lounge/app/" style="background:#c9a961;color:#1a1d2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;">Open The Lounge</a></p>'
      );
      perform public.send_lounge_email(member_rec.email, subject, html_body);
      total_sent := total_sent + 1;
    end loop;
  end loop;

  return total_sent;
end;
$$;

-- Schedule the digest. Same defensive pattern as migration 007: wrap in a DO
-- block that no-ops cleanly if pg_cron isn't enabled.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    begin perform cron.unschedule('lounge-weekly-city-digest');
    exception when others then null; end;
    perform cron.schedule(
      'lounge-weekly-city-digest',
      '0 9 * * 0',                          -- every Sunday at 09:00 UTC
      $job$ select public.send_weekly_city_digests(); $job$
    );
    raise notice 'pg_cron job lounge-weekly-city-digest scheduled (Sundays 09:00 UTC)';
  else
    raise notice 'pg_cron not enabled — weekly digest must be triggered manually via send_weekly_city_digests()';
  end if;
end $$;
