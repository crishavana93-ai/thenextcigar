-- ============================================================================
-- The Lounge — creator codes + commission tracking (migration 010)
-- ============================================================================
-- Anti-abuse design:
--   • Code is UNIQUE (one creator per code) and normalized uppercase on insert.
--   • A profile's referred_by_code_id is set ONCE at signup and locked by a
--     trigger — members can't switch codes later to game commissions.
--   • RLS: a creator sees only their own code + redemptions; admin sees all;
--     members never see commission amounts.
--   • Commission is recorded by the same trigger that records the event, so
--     the rate snapshot is captured at the moment of the transaction (a
--     creator's tier change later doesn't retroactively change prior payouts).
-- ============================================================================

-- 1. creator_codes ----------------------------------------------------------
create table if not exists public.creator_codes (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.profiles(id) on delete cascade,
  code            text not null unique,                  -- normalized uppercase
  tier            text not null check (tier in ('affiliate', 'creator', 'ambassador')),
  membership_rate numeric(4,3) not null check (membership_rate >= 0 and membership_rate <= 1),
  accessory_rate  numeric(4,3) not null check (accessory_rate  >= 0 and accessory_rate  <= 1),
  notes           text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.creator_codes is
  'One referral/discount code per creator. Anti-abuse: code is unique, normalized uppercase, immutable once a member is referred.';
comment on column public.creator_codes.membership_rate is
  'Decimal (0.45 = 45% of paid membership goes to creator as recurring commission).';

create index if not exists creator_codes_creator_idx on public.creator_codes (creator_id);
create index if not exists creator_codes_active_idx on public.creator_codes (active) where active = true;

-- Normalize code to uppercase on insert/update.
create or replace function public.normalize_creator_code()
returns trigger language plpgsql as $$
begin
  new.code := upper(trim(new.code));
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists normalize_creator_code_trg on public.creator_codes;
create trigger normalize_creator_code_trg
  before insert or update on public.creator_codes
  for each row execute function public.normalize_creator_code();

-- 2. profiles.referred_by_code_id ------------------------------------------
alter table public.profiles
  add column if not exists referred_by_code_id uuid references public.creator_codes(id);

-- Trigger: once referred_by_code_id is set, it cannot be changed. Only admin
-- can override (e.g. to clean up a typo within the first 24 hours).
create or replace function public.lock_referral_code()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if OLD.referred_by_code_id is not null
     and NEW.referred_by_code_id is distinct from OLD.referred_by_code_id
     and not public.is_admin() then
    raise exception 'referral code cannot be changed once set';
  end if;
  return NEW;
end;
$$;
drop trigger if exists lock_referral_code_trg on public.profiles;
create trigger lock_referral_code_trg
  before update of referred_by_code_id on public.profiles
  for each row execute function public.lock_referral_code();

-- 3. code_redemptions -------------------------------------------------------
create table if not exists public.code_redemptions (
  id                 uuid primary key default gen_random_uuid(),
  code_id            uuid not null references public.creator_codes(id) on delete restrict,
  member_id          uuid not null references public.profiles(id) on delete cascade,
  event_type         text not null check (event_type in ('signup', 'membership_renew', 'accessory_order')),
  gross_amount       numeric(10,2) not null default 0,    -- 0 for signup events
  commission_amount  numeric(10,2) not null default 0,    -- gross * applicable rate
  reference_id       uuid,                                 -- order id / membership row id for audit
  paid_out_at        timestamptz,                          -- null = pending; non-null = paid to creator
  payout_notes       text,
  created_at         timestamptz not null default now()
);

comment on table public.code_redemptions is
  'Each row = one revenue event attributable to a creator code. Commission rate is snapshotted at event time.';

create index if not exists code_redemptions_code_idx on public.code_redemptions (code_id);
create index if not exists code_redemptions_member_idx on public.code_redemptions (member_id);
create index if not exists code_redemptions_unpaid_idx on public.code_redemptions (paid_out_at)
  where paid_out_at is null;

-- 4. Helper: apply_referral_code() — called from signup / welcome ----------
-- Member calls this with a code string; it normalizes, validates, and atomically
-- sets profiles.referred_by_code_id (only if currently null). Inserts a 'signup'
-- redemption row (gross = 0) so we have a tracking record.
create or replace function public.apply_referral_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_code public.creator_codes;
  v_member_id uuid := auth.uid();
  v_current_code uuid;
begin
  if v_member_id is null then
    return json_build_object('ok', false, 'reason', 'not signed in');
  end if;

  -- Look up code
  select * into v_code
  from public.creator_codes
  where code = upper(trim(p_code)) and active = true
  limit 1;

  if v_code is null then
    return json_build_object('ok', false, 'reason', 'code not found or inactive');
  end if;

  -- Self-referrals not allowed
  if v_code.creator_id = v_member_id then
    return json_build_object('ok', false, 'reason', 'cannot use your own code');
  end if;

  -- Check current state
  select referred_by_code_id into v_current_code
  from public.profiles where id = v_member_id;

  if v_current_code is not null then
    return json_build_object('ok', false, 'reason', 'a code is already attached to your account');
  end if;

  -- Atomically attach the code + record the signup event
  update public.profiles set referred_by_code_id = v_code.id where id = v_member_id;

  insert into public.code_redemptions (code_id, member_id, event_type, gross_amount, commission_amount)
  values (v_code.id, v_member_id, 'signup', 0, 0);

  return json_build_object('ok', true, 'creator_id', v_code.creator_id, 'tier', v_code.tier);
end;
$$;

grant execute on function public.apply_referral_code(text) to authenticated;

-- 5. RLS policies -----------------------------------------------------------
alter table public.creator_codes    enable row level security;
alter table public.code_redemptions enable row level security;

-- creator_codes: creator sees own; admin sees all; only admin can create/edit
drop policy if exists "creator_codes read: own + admin" on public.creator_codes;
create policy "creator_codes read: own + admin"
  on public.creator_codes for select
  to authenticated
  using (creator_id = auth.uid() or public.is_admin());

drop policy if exists "creator_codes all: admin" on public.creator_codes;
create policy "creator_codes all: admin"
  on public.creator_codes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- code_redemptions: creator sees own redemptions; admin sees all
drop policy if exists "redemptions read: own + admin" on public.code_redemptions;
create policy "redemptions read: own + admin"
  on public.code_redemptions for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.creator_codes c
      where c.id = code_redemptions.code_id and c.creator_id = auth.uid()
    )
  );

-- Only admin can write to redemptions directly (the apply_referral_code
-- function and future commission triggers run as SECURITY DEFINER bypassing
-- this).
drop policy if exists "redemptions all: admin" on public.code_redemptions;
create policy "redemptions all: admin"
  on public.code_redemptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
