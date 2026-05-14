-- ============================================================================
-- The Lounge — event RSVP chat thread (migration 015)
-- ============================================================================
-- A per-event chat that only members who RSVP'd "going" can see and post in.
-- Auto-archives at the application layer 48h after the event ends (UI hides
-- old messages; data is preserved for audit).
--
-- Why per-event instead of per-city?
--   • Avoids the ghost-town problem of always-on city chats.
--   • Has a natural beginning and end — pressure to engage, then it's over.
--   • Only people with skin in the game (RSVP'd) can talk.
-- ============================================================================

create table if not exists public.event_chat_messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.cigar_events(id) on delete cascade,
  member_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) <= 1500),
  created_at  timestamptz not null default now()
);

create index if not exists event_chat_messages_event_idx
  on public.event_chat_messages (event_id, created_at);
create index if not exists event_chat_messages_member_idx
  on public.event_chat_messages (member_id);

-- RLS
alter table public.event_chat_messages enable row level security;

-- Read: a member can read messages for an event ONLY if they have an
-- active RSVP (going OR maybe). Admin reads everything.
drop policy if exists "event_chat read: rsvp'd or admin" on public.event_chat_messages;
create policy "event_chat read: rsvp'd or admin"
  on public.event_chat_messages for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.event_rsvps r
      where r.event_id = event_chat_messages.event_id
        and r.member_id = auth.uid()
        and r.status in ('going', 'maybe')
    )
  );

-- Write: a member can post ONLY if they have an active RSVP and the event
-- hasn't ended more than 48h ago.
drop policy if exists "event_chat insert: rsvp'd within window" on public.event_chat_messages;
create policy "event_chat insert: rsvp'd within window"
  on public.event_chat_messages for insert
  to authenticated
  with check (
    member_id = auth.uid()
    and exists (
      select 1 from public.event_rsvps r
      where r.event_id = event_chat_messages.event_id
        and r.member_id = auth.uid()
        and r.status in ('going', 'maybe')
    )
    and exists (
      select 1 from public.cigar_events e
      where e.id = event_chat_messages.event_id
        and (e.end_at is null
             or e.end_at > (now() - interval '48 hours')
             or e.start_at > (now() - interval '48 hours'))
    )
  );

-- A member can delete their own message (within 5 min) — basic edit-by-delete UX
drop policy if exists "event_chat delete: own recent" on public.event_chat_messages;
create policy "event_chat delete: own recent"
  on public.event_chat_messages for delete
  to authenticated
  using (
    member_id = auth.uid()
    and created_at > (now() - interval '5 minutes')
  );

-- Admin can delete any message (moderation)
drop policy if exists "event_chat delete: admin" on public.event_chat_messages;
create policy "event_chat delete: admin"
  on public.event_chat_messages for delete
  to authenticated
  using (public.is_admin());
