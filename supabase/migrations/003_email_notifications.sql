-- ============================================================================
-- The Lounge — email notifications (Phase 3)
-- ============================================================================
-- Three transactional emails sent via Resend + pg_net:
--   1. intro request received          → trigger on introductions insert
--   2. someone joined you at a lounge  → trigger on checkins insert
--   3. someone is travelling to you    → trigger on travel_plans insert
--
-- Architecture: each row insert fires a trigger that calls
-- public.send_lounge_email(), which reads the Resend API key from
-- vault.decrypted_secrets and POSTs to https://api.resend.com/emails via
-- net.http_post (pg_net). All fire-and-forget; failures are logged but
-- don't block the original INSERT.
--
-- PREREQUISITES (one-time admin in Supabase dashboard before running this
-- migration — see supabase/EMAIL_SETUP.md):
--   1. Enable the `pg_net` extension
--   2. Verify the domain `thenextcigar.com` (or just guatabeycigars@gmail.com
--      as the verified-sender for testing) in your Resend account
--   3. Insert your Resend API key:
--        select vault.create_secret('re_your_key_here', 'resend_api_key');
--   4. Configure Resend as SMTP in Supabase Auth → URL Configuration → SMTP
--      so magic-link emails also route through Resend (no extra code).
-- ============================================================================

-- 1. Enable pg_net if it isn't yet (idempotent)
create extension if not exists pg_net with schema extensions;

-- 2. Helper: read the Resend API key from the encrypted vault
create or replace function public.get_resend_api_key()
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  k text;
begin
  select decrypted_secret into k
  from vault.decrypted_secrets
  where name = 'resend_api_key'
  limit 1;
  return k;
end;
$$;

-- 3. Universal Lounge email sender
--    Returns the pg_net request id (async). Email is sent shortly after.
create or replace function public.send_lounge_email(
  to_email text,
  subject text,
  html_body text
) returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  request_id bigint;
  api_key text;
begin
  api_key := public.get_resend_api_key();
  if api_key is null then
    raise warning '[lounge-email] Resend API key not found in vault. Email skipped: %', subject;
    return null;
  end if;

  if to_email is null or to_email = '' then
    raise warning '[lounge-email] No recipient email. Subject was: %', subject;
    return null;
  end if;

  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    ),
    body := jsonb_build_object(
      'from', 'The Lounge <notifications@thenextcigar.com>',
      'to', to_email,
      'subject', subject,
      'html', html_body,
      'reply_to', 'guatabeycigars@gmail.com'
    )
  ) into request_id;

  return request_id;
end;
$$;

-- 4. Shared HTML email layout
--    Burgundy header bar, cream body, gold accent, CIGARS sans serif.
create or replace function public.lounge_email_layout(
  preheader text,
  greeting text,
  body_html text,
  cta_label text,
  cta_url text
) returns text
language plpgsql
immutable
as $$
declare
  html text;
begin
  html := $HTML$
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>The Lounge</title>
  </head>
  <body style="margin:0;padding:0;background:#1a1d2e;font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;">
    <!-- Preheader (hidden) -->
    <div style="display:none;font-size:1px;color:#1a1d2e;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">$PREHEADER$</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1d2e;">
      <tr><td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#f5efe0;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr><td style="background:#6e2620;padding:18px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:#f5efe0;font-family:'Helvetica Neue','Inter',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">THE LOUNGE</td>
                <td align="right" style="color:#c9a961;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;font-family:'Helvetica Neue','Inter',Arial,sans-serif;">TNext Cigars</td>
              </tr>
            </table>
          </td></tr>

          <!-- Greeting -->
          <tr><td style="padding:32px 28px 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1a1d2e;line-height:1.3;">$GREETING$</td></tr>

          <!-- Body -->
          <tr><td style="padding:0 28px 24px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1d2e;">$BODY$</td></tr>

          <!-- CTA -->
          <tr><td align="center" style="padding:8px 28px 32px;">
            <a href="$CTA_URL$" style="display:inline-block;background:#c9a961;color:#1a1d2e;text-decoration:none;padding:14px 28px;border-radius:6px;font-family:'Helvetica Neue','Inter',Arial,sans-serif;font-size:14px;font-weight:700;">$CTA_LABEL$</a>
          </td></tr>

          <!-- Footer hairline -->
          <tr><td style="padding:0 28px;"><div style="height:1px;background:rgba(201,169,97,0.3);"></div></td></tr>

          <!-- Footer -->
          <tr><td style="padding:18px 28px 26px;font-family:'Helvetica Neue','Inter',Arial,sans-serif;font-size:11px;color:#6b6663;line-height:1.6;">
            You're receiving this because you're a member of The Lounge. Manage notifications in your
            <a href="https://lounge.thenextcigar.com/lounge/app/profile/" style="color:#6e2620;text-decoration:underline;">profile</a>.
            <br/>The Next Cigar · Stockholm · <a href="mailto:guatabeycigars@gmail.com" style="color:#6e2620;">guatabeycigars@gmail.com</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
$HTML$;

  html := replace(html, '$PREHEADER$', coalesce(preheader, ''));
  html := replace(html, '$GREETING$', coalesce(greeting, ''));
  html := replace(html, '$BODY$', coalesce(body_html, ''));
  html := replace(html, '$CTA_LABEL$', coalesce(cta_label, 'Open The Lounge'));
  html := replace(html, '$CTA_URL$', coalesce(cta_url, 'https://lounge.thenextcigar.com/lounge/app/'));
  return html;
end;
$$;

-- ============================================================================
-- TRIGGER 1 — Intro request received
-- ============================================================================
create or replace function public.notify_intro_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  recipient_email text;
  sender_name text;
  sender_city text;
  subject text;
  greeting text;
  body text;
  preheader text;
begin
  -- Look up the recipient's email + sender's profile
  select email into recipient_email
  from auth.users where id = NEW.to_member_id;

  select display_name, city
  into sender_name, sender_city
  from public.profiles where id = NEW.from_member_id;

  if recipient_email is null then return NEW; end if;

  subject  := coalesce(sender_name, 'A member') || ' would like an introduction';
  preheader := coalesce(sender_name, 'A member') || ' sent you a note in The Lounge';
  greeting := 'An introduction request.';
  body :=
    '<p style="margin:0 0 12px 0;"><strong>' || coalesce(sender_name, 'A member') ||
    case when sender_city is not null and sender_city <> '' then ' · ' || sender_city else '' end ||
    '</strong> would like to be introduced.</p>' ||
    '<blockquote style="margin:18px 0;padding:14px 18px;background:#fff;border-left:3px solid #c9a961;font-style:italic;color:#1a1d2e;">' ||
      replace(coalesce(NEW.intro_message, ''), E'\n', '<br/>') ||
    '</blockquote>' ||
    '<p style="margin:14px 0 0 0;font-size:13px;color:#6b6663;">Accept to unlock direct messages, or decline if it''s not the right fit.</p>';

  perform public.send_lounge_email(
    recipient_email,
    subject,
    public.lounge_email_layout(
      preheader, greeting, body,
      'Open inbox',
      'https://lounge.thenextcigar.com/lounge/app/inbox/'
    )
  );
  return NEW;
exception when others then
  raise warning '[notify_intro_request] failed: %', SQLERRM;
  return NEW;
end;
$$;

drop trigger if exists trg_intro_email on public.introductions;
create trigger trg_intro_email
  after insert on public.introductions
  for each row execute function public.notify_intro_request();

-- ============================================================================
-- TRIGGER 2 — Someone joined you at a lounge
-- ============================================================================
create or replace function public.notify_checkin_at_same_venue()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  joiner_name text;
  venue_name text;
  venue_city text;
  rec record;
  subject text;
  greeting text;
  body text;
  notified_count int := 0;
begin
  -- Joiner + venue context
  select display_name into joiner_name
  from public.profiles where id = NEW.member_id;
  select name, city into venue_name, venue_city
  from public.partner_lounges where id = NEW.lounge_id;

  -- For each OTHER member currently checked in at the same lounge (cap at 20)
  for rec in
    select c.member_id, u.email
    from public.checkins c
    join auth.users u on u.id = c.member_id
    where c.lounge_id = NEW.lounge_id
      and c.member_id <> NEW.member_id
      and c.expires_at > now()
    limit 20
  loop
    if rec.email is null then continue; end if;
    subject := coalesce(joiner_name, 'A member') || ' just joined you at ' || coalesce(venue_name, 'the lounge');
    greeting := 'Someone just joined you.';
    body :=
      '<p style="margin:0 0 12px 0;"><strong>' || coalesce(joiner_name, 'A member') ||
      '</strong> just checked in at <strong>' || coalesce(venue_name, 'this lounge') ||
      case when venue_city is not null and venue_city <> '' then ' (' || venue_city || ')' else '' end ||
      '</strong>.</p>' ||
      case when NEW.message is not null and NEW.message <> '' then
        '<blockquote style="margin:14px 0;padding:12px 16px;background:#fff;border-left:3px solid #c9a961;font-style:italic;color:#1a1d2e;">' ||
        replace(NEW.message, E'\n', '<br/>') || '</blockquote>'
      else '' end ||
      '<p style="margin:14px 0 0 0;font-size:13px;color:#6b6663;">Open the map and say hi.</p>';

    perform public.send_lounge_email(
      rec.email,
      subject,
      public.lounge_email_layout(
        coalesce(joiner_name, 'A member') || ' is at ' || coalesce(venue_name, 'the lounge') || ' with you',
        greeting, body,
        'Open the map',
        'https://lounge.thenextcigar.com/lounge/app/map/'
      )
    );
    notified_count := notified_count + 1;
  end loop;

  return NEW;
exception when others then
  raise warning '[notify_checkin] failed: %', SQLERRM;
  return NEW;
end;
$$;

drop trigger if exists trg_checkin_email on public.checkins;
create trigger trg_checkin_email
  after insert on public.checkins
  for each row execute function public.notify_checkin_at_same_venue();

-- ============================================================================
-- TRIGGER 3 — Someone is travelling to your city (hosts only)
-- ============================================================================
-- To avoid blasting an entire city on every new trip, we only notify members
-- who have explicitly opted to host (is_host = true) AND whose profile.city
-- matches the trip destination. Capped at 20 recipients per trip.
create or replace function public.notify_trip_to_city()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  traveler_name text;
  traveler_city text;
  rec record;
  subject text;
  greeting text;
  body text;
  dates_label text;
begin
  select display_name, city into traveler_name, traveler_city
  from public.profiles where id = NEW.member_id;

  dates_label := to_char(NEW.arrive_date, 'Mon DD') || ' – ' || to_char(NEW.depart_date, 'Mon DD, YYYY');

  for rec in
    select p.id, u.email
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(p.city) = lower(NEW.city)
      and p.is_host = true
      and p.id <> NEW.member_id
    limit 20
  loop
    if rec.email is null then continue; end if;
    subject := coalesce(traveler_name, 'A member') || ' is heading to ' || NEW.city;
    greeting := 'A guest is on the way.';
    body :=
      '<p style="margin:0 0 12px 0;"><strong>' || coalesce(traveler_name, 'A member') ||
      case when traveler_city is not null and traveler_city <> '' then ' · ' || traveler_city else '' end ||
      '</strong> is travelling to <strong>' || NEW.city || '</strong> on <strong>' || dates_label || '</strong>.</p>' ||
      case when NEW.notes is not null and NEW.notes <> '' then
        '<blockquote style="margin:14px 0;padding:12px 16px;background:#fff;border-left:3px solid #c9a961;font-style:italic;color:#1a1d2e;">' ||
        replace(NEW.notes, E'\n', '<br/>') || '</blockquote>'
      else '' end ||
      '<p style="margin:14px 0 0 0;font-size:13px;color:#6b6663;">You flagged yourself as open to host. Ping them with a quick intro if you''d like.</p>';

    perform public.send_lounge_email(
      rec.email,
      subject,
      public.lounge_email_layout(
        coalesce(traveler_name, 'A member') || ' is coming to ' || NEW.city || ' ' || dates_label,
        greeting, body,
        'View their profile',
        'https://lounge.thenextcigar.com/lounge/app/member/?id=' || NEW.member_id
      )
    );
  end loop;

  return NEW;
exception when others then
  raise warning '[notify_trip] failed: %', SQLERRM;
  return NEW;
end;
$$;

drop trigger if exists trg_trip_email on public.travel_plans;
create trigger trg_trip_email
  after insert on public.travel_plans
  for each row execute function public.notify_trip_to_city();

-- ============================================================================
-- Admin diagnostics — test-send + recent-sends view
-- ============================================================================

-- Send a test email (use from SQL Editor to confirm Resend is wired):
--   select public.test_lounge_email('you@example.com');
create or replace function public.test_lounge_email(to_email text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.send_lounge_email(
    to_email,
    'The Lounge — test email',
    public.lounge_email_layout(
      'A test from The Lounge',
      'You wired the email pipeline.',
      '<p style="margin:0;">If you''re reading this in your inbox, the Lounge email pipeline (Resend + pg_net + Supabase triggers) is fully operational. Live ones — intro requests, check-ins, and travel pings — will arrive whenever a member triggers them.</p>',
      'Open The Lounge',
      'https://lounge.thenextcigar.com/lounge/app/'
    )
  );
end;
$$;

-- Inspect recent pg_net requests (useful while debugging):
--   select * from net._http_response order by created desc limit 10;
