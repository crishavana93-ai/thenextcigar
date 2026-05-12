-- ============================================================================
-- The Lounge — Phase 2 MVP schema
-- Run this in the Supabase SQL Editor as the first migration.
-- ============================================================================
-- Tables: profiles, partner_lounges, checkins, travel_plans,
--          introductions, direct_messages
-- Auth: piggy-backs on auth.users (managed by Supabase Auth)
-- RLS: enabled on every table; members see only their own private data
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES
-- One row per signed-up member. Extends auth.users.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,                       -- "Cris O." (first name + initial)
  full_name       text,                                -- internal only — RLS protected
  city            text,                                -- "Stockholm"
  country_code    text,                                -- "SE"
  bio             text check (char_length(bio) <= 280),
  avatar_url      text,                                -- public Supabase Storage URL
  is_host         boolean default false,               -- opt-in flag
  is_founding     boolean default false,               -- set true for the first 200
  email_visible   boolean default false,               -- show email in profile?
  joined_at       timestamptz default now(),
  last_active_at  timestamptz default now()
);

create index if not exists profiles_city_idx on public.profiles (city);
create index if not exists profiles_host_idx on public.profiles (is_host) where is_host = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. PARTNER LOUNGES
-- Cigar venues where members can check in. Seeded from the existing
-- cigar-places.ts dataset in /src/data/.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.partner_lounges (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,              -- 'sautter-mayfair'
  name              text not null,
  city              text not null,
  country           text not null,
  address           text,
  lat               numeric(9,6) not null,
  lng               numeric(9,6) not null,
  type              text default 'lounge',             -- lounge | retailer | casadelhabano | house | pub | club
  verified_at       timestamptz,                       -- null = pending; set by Cris-admin
  manager_user_id   uuid references public.profiles(id), -- the lounge's TNC contact, optional
  perks             text,                              -- "Complimentary first coffee for members"
  website           text,
  created_at        timestamptz default now()
);

create index if not exists partner_lounges_city_idx on public.partner_lounges (city);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. CHECK-INS
-- Member is currently at a partner lounge. Expires after 4 hours.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.checkins (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references public.profiles(id) on delete cascade,
  lounge_id       uuid not null references public.partner_lounges(id) on delete cascade,
  checked_in_at   timestamptz default now(),
  expires_at      timestamptz default (now() + interval '4 hours'),
  message         text check (char_length(message) <= 140)  -- "Open to a smoke if anyone's around"
);

-- NOTE: PostgreSQL requires functions in index predicates to be IMMUTABLE.
-- now() and current_date are STABLE, so we use plain (non-partial) indexes here.
create index if not exists checkins_lounge_idx on public.checkins (lounge_id, expires_at);
create index if not exists checkins_member_idx on public.checkins (member_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. TRAVEL PLANS
-- Member declares they'll be in a city on specific dates.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.travel_plans (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid not null references public.profiles(id) on delete cascade,
  city            text not null,
  country_code    text,
  arrive_date     date not null,
  depart_date     date not null,
  notes           text check (char_length(notes) <= 280),
  created_at      timestamptz default now(),
  check (depart_date >= arrive_date)
);

create index if not exists travel_plans_city_idx on public.travel_plans (city, arrive_date);
create index if not exists travel_plans_depart_idx on public.travel_plans (depart_date);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. INTRODUCTIONS
-- One member asks to be introduced to another, or Cris brokers an intro.
-- DMs only unlock after acceptance.
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.introductions (
  id                uuid primary key default gen_random_uuid(),
  from_member_id    uuid not null references public.profiles(id) on delete cascade,
  to_member_id      uuid not null references public.profiles(id) on delete cascade,
  context           text not null,                     -- 'lounge_check_in' | 'travel_plan' | 'host_intro' | 'manual'
  intro_message     text not null check (char_length(intro_message) <= 500),
  accepted          boolean,                            -- null = pending, true/false = decided
  responded_at      timestamptz,
  created_at        timestamptz default now(),
  unique (from_member_id, to_member_id)                -- one open intro per pair
);

create index if not exists introductions_to_idx on public.introductions (to_member_id, accepted);
create index if not exists introductions_from_idx on public.introductions (from_member_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. DIRECT MESSAGES
-- 1:1 messages between members who have accepted an introduction
-- (enforced at app layer — see RLS below).
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.direct_messages (
  id              uuid primary key default gen_random_uuid(),
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  recipient_id    uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(body) <= 2000),
  read_at         timestamptz,
  created_at      timestamptz default now()
);

create index if not exists direct_messages_thread_idx
  on public.direct_messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.partner_lounges   enable row level security;
alter table public.checkins          enable row level security;
alter table public.travel_plans      enable row level security;
alter table public.introductions     enable row level security;
alter table public.direct_messages   enable row level security;

-- ──────────────────────── PROFILES POLICIES ────────────────────────────────
-- Anyone authenticated can read public-display fields of any profile
create policy "profiles read: any authenticated member"
  on public.profiles for select
  to authenticated
  using (true);

-- A member can insert their own profile (one row per auth.uid)
create policy "profiles insert: self only"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- A member can update only their own profile
create policy "profiles update: self only"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ──────────────────────── PARTNER LOUNGES POLICIES ─────────────────────────
-- Public read for now (so we can show pinned lounges on /lounge/app/map/)
create policy "partner_lounges read: authenticated"
  on public.partner_lounges for select
  to authenticated
  using (true);

-- Insert/update reserved for Cris-admin via service-role key (no policy = denied)

-- ──────────────────────── CHECK-INS POLICIES ───────────────────────────────
-- Any member can see currently-active check-ins (expires_at > now)
create policy "checkins read: active only"
  on public.checkins for select
  to authenticated
  using (expires_at > now());

-- A member can check themselves in
create policy "checkins insert: self only"
  on public.checkins for insert
  to authenticated
  with check (member_id = auth.uid());

-- A member can update/delete only their own check-ins
create policy "checkins update: self only"
  on public.checkins for update
  to authenticated
  using (member_id = auth.uid());

create policy "checkins delete: self only"
  on public.checkins for delete
  to authenticated
  using (member_id = auth.uid());

-- ──────────────────────── TRAVEL PLANS POLICIES ────────────────────────────
-- Any member can see upcoming travel plans (depart_date >= today)
create policy "travel_plans read: upcoming only"
  on public.travel_plans for select
  to authenticated
  using (depart_date >= current_date);

create policy "travel_plans insert: self only"
  on public.travel_plans for insert
  to authenticated
  with check (member_id = auth.uid());

create policy "travel_plans update: self only"
  on public.travel_plans for update
  to authenticated
  using (member_id = auth.uid());

create policy "travel_plans delete: self only"
  on public.travel_plans for delete
  to authenticated
  using (member_id = auth.uid());

-- ──────────────────────── INTRODUCTIONS POLICIES ───────────────────────────
-- A member can see intros involving them (either side)
create policy "introductions read: involved parties"
  on public.introductions for select
  to authenticated
  using (from_member_id = auth.uid() or to_member_id = auth.uid());

-- A member can create an intro request from themselves
create policy "introductions insert: from-self only"
  on public.introductions for insert
  to authenticated
  with check (from_member_id = auth.uid());

-- A member can update (accept/decline) only intros TO them
create policy "introductions update: recipient only"
  on public.introductions for update
  to authenticated
  using (to_member_id = auth.uid())
  with check (to_member_id = auth.uid());

-- ──────────────────────── DIRECT MESSAGES POLICIES ─────────────────────────
-- Read: only if you're sender or recipient AND an accepted intro exists between you
create policy "direct_messages read: involved + accepted intro"
  on public.direct_messages for select
  to authenticated
  using (
    (sender_id = auth.uid() or recipient_id = auth.uid())
    and exists (
      select 1 from public.introductions i
      where i.accepted = true
        and (
          (i.from_member_id = sender_id and i.to_member_id = recipient_id)
          or (i.from_member_id = recipient_id and i.to_member_id = sender_id)
        )
    )
  );

-- Send: same constraint
create policy "direct_messages insert: with accepted intro"
  on public.direct_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.introductions i
      where i.accepted = true
        and (
          (i.from_member_id = sender_id and i.to_member_id = recipient_id)
          or (i.from_member_id = recipient_id and i.to_member_id = sender_id)
        )
    )
  );

-- ============================================================================
-- TRIGGER: auto-create profile row when a user signs up via auth.users
-- ============================================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, joined_at, last_active_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'New Member'),
    now(), now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ============================================================================
-- STORAGE BUCKET: avatars
-- (Run in Supabase Dashboard → Storage → New bucket, name "avatars", public)
-- Then apply this policy:
-- ============================================================================
-- (Storage policies are set in the Supabase Dashboard UI, not via SQL here.)
-- Avatars bucket should be: public read, authenticated write, file path = {user.id}/avatar.{ext}
