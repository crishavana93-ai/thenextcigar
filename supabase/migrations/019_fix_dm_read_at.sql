-- ============================================================================
-- The Lounge — fix DM read_at not updating (migration 019)
-- ============================================================================
-- Bug: the home page shows "1 unread message" even after the user opens the
-- thread and reads everything. Root cause: direct_messages has SELECT and
-- INSERT RLS policies but no UPDATE policy. When /messages/?with=<userId>
-- tries to set read_at on incoming messages, RLS silently rejects the update
-- (Supabase returns no error but 0 rows are modified), so read_at stays NULL
-- forever and the home page badge never clears.
--
-- Fix: add a narrow UPDATE policy that lets the recipient mark their own
-- received messages as read. Plus a SECURITY DEFINER helper so the client
-- can call a tight RPC instead of a direct UPDATE — the RPC only ever
-- touches read_at, never body or sender_id.
-- ============================================================================

-- ── 1. UPDATE policy ───────────────────────────────────────────────────
-- Recipients can update their own messages. (Senders cannot.) This unblocks
-- the .update({ read_at }) call the thread page already makes.

drop policy if exists "direct_messages update: recipient can mark read"
  on public.direct_messages;

create policy "direct_messages update: recipient can mark read"
  on public.direct_messages
  for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- ── 2. Tight RPC the client can prefer over a direct UPDATE ────────────
-- Only touches read_at, defends against any future RLS slip-ups, and keeps
-- the surface area for "recipient modifying message body" closed by design.

create or replace function public.mark_messages_read(message_ids uuid[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_updated int;
begin
  if message_ids is null or array_length(message_ids, 1) is null then
    return 0;
  end if;

  update public.direct_messages
     set read_at = now()
   where id = any(message_ids)
     and recipient_id = auth.uid()
     and read_at is null;

  get diagnostics rows_updated = row_count;
  return rows_updated;
end;
$$;

grant execute on function public.mark_messages_read(uuid[]) to authenticated;
