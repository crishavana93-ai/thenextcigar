-- ============================================================================
-- The Lounge — community-submitted cigar shops (migration 018)
-- ============================================================================
-- Lets any signed-in member submit a cigar shop that's missing from the map.
-- Cris reviews submissions in the admin Submissions tab and converts the good
-- ones into real partner_lounges entries.
--
-- Why: in countries like Germany, Spain, and Italy, cigar shops have weak
-- Google presence and don't surface via the API seed. Crowd-sourced
-- contributions fill the long tail.
-- ============================================================================

create table if not exists public.community_submissions (
  id uuid primary key default gen_random_uuid(),

  -- The submission itself
  shop_name      text        not null,
  address        text,
  city           text        not null,
  country        text        not null,
  can_smoke      text        not null check (can_smoke in ('yes','no','outside','unknown')),
  notes          text,

  -- Who submitted (nullable so we can take submissions even from
  -- not-yet-fully-onboarded users if we open a public endpoint later).
  submitted_by   uuid        references auth.users(id) on delete set null,
  submitter_email text,
  submitter_name  text,

  -- Review state
  status         text        not null default 'pending'
                             check (status in ('pending','approved','rejected','converted')),
  reviewed_at    timestamptz,
  reviewed_by    uuid        references auth.users(id),
  reviewer_note  text,
  converted_to_lounge_id uuid references public.partner_lounges(id),

  created_at     timestamptz not null default now()
);

create index if not exists idx_community_submissions_status
  on public.community_submissions(status, created_at desc);
create index if not exists idx_community_submissions_country
  on public.community_submissions(country, city);

alter table public.community_submissions enable row level security;

-- INSERT: any signed-in user can submit
drop policy if exists community_submissions_insert on public.community_submissions;
create policy community_submissions_insert
  on public.community_submissions
  for insert
  to authenticated
  with check (
    -- submitted_by must match the caller if set, or be null
    submitted_by is null or submitted_by = auth.uid()
  );

-- SELECT: submitter sees their own; admins see everything
drop policy if exists community_submissions_select on public.community_submissions;
create policy community_submissions_select
  on public.community_submissions
  for select
  to authenticated
  using (
    submitted_by = auth.uid()
    or public.is_admin()
  );

-- UPDATE / DELETE: admins only
drop policy if exists community_submissions_admin_update on public.community_submissions;
create policy community_submissions_admin_update
  on public.community_submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists community_submissions_admin_delete on public.community_submissions;
create policy community_submissions_admin_delete
  on public.community_submissions
  for delete
  to authenticated
  using (public.is_admin());

-- ── Email notification when a submission lands ──────────────────────────
-- Sends to contact@thenextcigar.com (Cris) so he can review in admin.

create or replace function public.notify_new_community_submission()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  body_html text;
  smoke_label text;
begin
  smoke_label := case NEW.can_smoke
    when 'yes'     then 'Yes — you can smoke on-site'
    when 'outside' then 'Outside / terrace only'
    when 'no'      then 'No — retail only'
    else                'Unknown / not specified'
  end;

  body_html :=
    '<p>A member just submitted a cigar shop to add to the map:</p>' ||
    '<table style="border-collapse:collapse;margin:18px 0;font-family:Georgia,serif;">' ||
      '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;">Shop</td>' ||
      '<td style="padding:6px 0;"><strong>' || coalesce(NEW.shop_name, '—') || '</strong></td></tr>' ||
      '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;">City</td>' ||
      '<td style="padding:6px 0;">' || coalesce(NEW.city, '—') || ', ' || coalesce(NEW.country, '—') || '</td></tr>' ||
      case when NEW.address is not null and NEW.address <> '' then
        '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;">Address</td>' ||
        '<td style="padding:6px 0;">' || NEW.address || '</td></tr>'
      else '' end ||
      '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;">Smoking</td>' ||
      '<td style="padding:6px 0;">' || smoke_label || '</td></tr>' ||
      case when NEW.notes is not null and NEW.notes <> '' then
        '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;vertical-align:top;">Notes</td>' ||
        '<td style="padding:6px 0;font-style:italic;color:#444;">' || NEW.notes || '</td></tr>'
      else '' end ||
      case when NEW.submitter_email is not null and NEW.submitter_email <> '' then
        '<tr><td style="padding:6px 14px 6px 0;color:#6b6663;font-size:13px;">From</td>' ||
        '<td style="padding:6px 0;">' || coalesce(NEW.submitter_name, NEW.submitter_email) || ' &lt;' || NEW.submitter_email || '&gt;</td></tr>'
      else '' end ||
    '</table>' ||
    '<p style="color:#555;font-size:14px;">Review and approve/reject in the admin Submissions tab. A quick verify-on-Google pass usually takes 60 seconds before publishing.</p>';

  perform public.send_lounge_email(
    'contact@thenextcigar.com',
    '🆕 Cigar shop submission: ' || NEW.shop_name || ' (' || NEW.city || ')',
    public.lounge_email_layout(
      'New community submission',
      'Hey Cris,',
      body_html,
      'Open admin queue',
      'https://lounge.thenextcigar.com/lounge/app/admin/?tab=submissions'
    )
  );
  return NEW;
exception when others then
  raise warning '[notify_new_community_submission] failed: %', SQLERRM;
  return NEW;
end;
$$;

drop trigger if exists notify_new_community_submission_trigger on public.community_submissions;
create trigger notify_new_community_submission_trigger
  after insert on public.community_submissions
  for each row execute function public.notify_new_community_submission();

-- ── Helper: convert an approved submission to a real partner_lounge ────
-- Slug auto-generated from shop_name + city. lat/lng default to NULL — admin
-- can fill them in later via the existing Venue admin edit flow.

create or replace function public.convert_submission_to_lounge(submission_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  s record;
  base_slug text;
  final_slug text;
  attempt int := 0;
  new_lounge_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can convert submissions';
  end if;

  select * into s from public.community_submissions where id = submission_id;
  if s.id is null then
    raise exception 'Submission not found';
  end if;
  if s.status = 'converted' then
    raise exception 'Already converted';
  end if;

  base_slug := lower(regexp_replace(
    s.city || '-' || s.shop_name,
    '[^a-z0-9]+', '-', 'g'
  ));
  base_slug := trim(both '-' from base_slug);
  base_slug := substring(base_slug from 1 for 70);
  final_slug := base_slug;

  -- Ensure slug uniqueness
  while exists (select 1 from public.partner_lounges where slug = final_slug) loop
    attempt := attempt + 1;
    final_slug := base_slug || '-' || attempt::text;
  end loop;

  insert into public.partner_lounges (
    slug, name, city, country, address, type, perks, verified_at
  ) values (
    final_slug,
    s.shop_name,
    s.city,
    s.country,
    s.address,
    'retailer',  -- safe default; admin can edit type later
    case
      when s.notes is not null and s.notes <> ''
        then s.notes
      else null
    end,
    null         -- not verified until lat/lng filled in
  )
  returning id into new_lounge_id;

  update public.community_submissions
     set status = 'converted',
         reviewed_at = now(),
         reviewed_by = auth.uid(),
         converted_to_lounge_id = new_lounge_id
   where id = submission_id;

  return new_lounge_id;
end;
$$;

grant execute on function public.convert_submission_to_lounge(uuid) to authenticated;

-- ── Thank-you email when a submission goes live ─────────────────────────
-- Fires when status transitions to 'converted'. Closes the loop with the
-- contributor — turns a one-time submitter into a recurring one.

create or replace function public.notify_submission_converted()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  body_html text;
  greeting text;
  map_city text;
  cta_url text;
begin
  -- Only fire on transition INTO 'converted'
  if NEW.status <> 'converted' then return NEW; end if;
  if TG_OP = 'UPDATE' and OLD.status = 'converted' then return NEW; end if;

  -- No email if we have no address to send to
  if NEW.submitter_email is null or NEW.submitter_email = '' then
    return NEW;
  end if;

  greeting := 'Hey ' || coalesce(NEW.submitter_name, 'there') || ',';
  map_city := coalesce(NEW.city, '');
  cta_url := 'https://lounge.thenextcigar.com/lounge/app/map/'
             || case when map_city <> '' then '?city=' || replace(map_city, ' ', '%20') else '' end;

  body_html :=
    '<p>Quick thank-you — <strong>' || NEW.shop_name || '</strong> is now live on The Lounge map. ' ||
    'Your submission made it real for every member who travels through ' || coalesce(NEW.city, 'town') || '.</p>' ||

    '<p style="margin-top:18px;">This is exactly the kind of contribution that''s hard to fake. ' ||
    'Most cigar shops outside the US — and a lot inside it — are invisible on Google. ' ||
    'Members like you are how the map gets honest.</p>' ||

    '<p style="margin-top:18px;color:#555;font-size:0.95em;">If you know more shops worth adding ' ||
    '(in your city, or anywhere you''ve traveled), the submit form lives at ' ||
    '<a href="https://lounge.thenextcigar.com/lounge/app/submit-shop/" style="color:#c9a961;">' ||
    'lounge.thenextcigar.com/lounge/app/submit-shop</a>. Takes 30 seconds each.</p>' ||

    '<p style="margin-top:18px;color:#555;font-size:0.9em;">— Cris<br/>Founder, The Next Cigar</p>';

  perform public.send_lounge_email(
    NEW.submitter_email,
    NEW.shop_name || ' is live on The Lounge — thanks',
    public.lounge_email_layout(
      'Your submission is live',
      greeting,
      body_html,
      'See it on the map',
      cta_url
    )
  );
  return NEW;
exception when others then
  raise warning '[notify_submission_converted] failed: %', SQLERRM;
  return NEW;
end;
$$;

drop trigger if exists notify_submission_converted_trigger on public.community_submissions;
create trigger notify_submission_converted_trigger
  after update of status on public.community_submissions
  for each row execute function public.notify_submission_converted();
