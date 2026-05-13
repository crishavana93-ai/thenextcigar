# The Lounge — email notification setup

This wires three transactional emails + reliable magic-link auth through
**Resend**. Whole thing is database triggers + pg_net + a Resend account.
No Edge Functions, no CLI tooling, no separate deploy step.

Total time: ~20 minutes the first time, ~0 going forward (it just works).

---

## What you'll get

When live, members get an email automatically when:

1. **Someone requests an introduction to them.** Subject: "Mark P. would like an introduction." Body shows the sender's name + city + their note + a button to your inbox.
2. **Someone checks into the same lounge they're currently at.** Subject: "Lasse F. just joined you at Sautter." Useful nudge to look up.
3. **Someone declares a trip to their home city — and they've flagged themselves as a host.** Subject: "Patrick C. is heading to Stockholm." Only hosts get these (so non-hosts don't get spammed every time a member flies somewhere).

Plus, the magic-link signin email (already working today) gets routed through Resend's high-volume SMTP, so it stops hitting Supabase's free-tier rate limits when signups pick up.

---

## Step-by-step (one-time setup)

### 1 · Sign up for Resend (free)

- Go to <https://resend.com> → Sign up (use `guatabeycigars@gmail.com`).
- Free tier: 100 emails/day, 3,000/month. Enough for a 200-member cohort. Upgrade to the $20 Pro plan if/when daily volume crosses 100 (which won't happen until you're at ~500+ active members).

### 2 · Verify your sending domain

In the Resend dashboard → **Domains** → **Add domain** → enter `thenextcigar.com`.

Resend will give you a list of DNS records (TXT, MX, CNAME) to add. Copy them.

Then in **Cloudflare → DNS → thenextcigar.com**:
- Add each record exactly as Resend specifies.
- Important: turn the orange-cloud OFF on the MX records (they need to resolve directly, not proxy through Cloudflare).
- Wait 5–10 minutes for verification. Resend will email you when it's verified.

(If verification stalls, you can ship with `onboarding@resend.dev` as the from-address in dev — but for production you want the verified domain so emails land in inboxes, not spam.)

### 3 · Grab your Resend API key

In Resend → **API Keys** → **Create API key** → name it `lounge-prod`, give it **Sending access**. Copy the key (starts with `re_`).

### 4 · Save the key into Supabase Vault

In Supabase dashboard → **SQL Editor** → New query → run:

```sql
select vault.create_secret('re_paste_your_actual_key_here', 'resend_api_key');
```

(The vault is Supabase's encrypted secret store. Only `security definer` functions can decrypt it — the migration uses this access pattern.)

If you need to update the key later:

```sql
update vault.secrets
set secret = 'new_re_key_here'
where name = 'resend_api_key';
```

### 5 · Enable the pg_net extension

In Supabase dashboard → **Database → Extensions** → search for `pg_net` → **Enable**.

(The migration script attempts `create extension if not exists` for you, but enabling it via the UI is safer.)

### 6 · Run the email-notifications migration

In Supabase dashboard → **SQL Editor** → paste the contents of `supabase/migrations/003_email_notifications.sql` → **Run**.

If you get a "destructive operation" confirmation dialog, hit **Run this query** — the migration creates trigger functions and overrides any previous versions of those functions (the destructive bit it's flagging is `drop trigger if exists`).

You should see "Success. No rows returned."

### 7 · Configure Resend as your Supabase Auth SMTP provider

This routes magic-link emails through Resend (instead of Supabase's rate-limited default).

In Supabase dashboard → **Authentication → Emails → SMTP Settings** → toggle **Enable Custom SMTP** and enter:

| Field | Value |
|---|---|
| Sender email | `notifications@thenextcigar.com` |
| Sender name | `The Lounge` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | *your Resend API key from step 3* (the `re_…` string) |

Save. Done.

### 8 · Test the pipeline

Back in SQL Editor:

```sql
select public.test_lounge_email('you@example.com');
```

Replace with your own email address. Run it. Hit **Run this query** if Supabase asks. The function returns a pg_net request ID instantly — the actual email lands in your inbox within 5–30 seconds.

If it lands → you're done. If it doesn't:

- Check `select * from net._http_response order by created desc limit 5;` for the Resend API response. Most failures are domain-not-verified or wrong API key.
- Check your **spam** folder.
- Check Resend dashboard → **Logs** for any errors.

---

## Tweaks & maintenance

### Pause emails temporarily

```sql
-- Disable all three triggers
alter table public.introductions disable trigger trg_intro_email;
alter table public.checkins      disable trigger trg_checkin_email;
alter table public.travel_plans  disable trigger trg_trip_email;

-- Re-enable later
alter table public.introductions enable trigger trg_intro_email;
alter table public.checkins      enable trigger trg_checkin_email;
alter table public.travel_plans  enable trigger trg_trip_email;
```

### Change the from-address

Edit `public.send_lounge_email` — the `'from'` value in the JSONB body. Then re-run the function definition in SQL Editor.

### Audit recent sends

```sql
select created, url, status_code, content
from net._http_response
order by created desc
limit 20;
```

### Send a manual broadcast

You can send a custom email from SQL Editor whenever you want:

```sql
select public.send_lounge_email(
  'someone@example.com',
  'A custom subject line',
  public.lounge_email_layout(
    'Preheader text',
    'Greeting headline',
    '<p>Body HTML.</p>',
    'CTA button label',
    'https://lounge.thenextcigar.com/some/url/'
  )
);
```

Useful for sending hand-crafted Founding Member welcomes or partner-lounge launch announcements.

---

## When Resend bills you

| Tier | Cost | Volume |
|---|---|---|
| Free | $0 | 100/day, 3,000/month, 1 domain |
| Pro | $20/mo | 50,000/month, unlimited domains |
| Business | $90/mo | 100,000+ /month, dedicated IPs |

At 200 founding members you'd send roughly 20–60 emails/day (intros + occasional trips + check-ins). Comfortably under the free tier. Upgrade to Pro at ~500 active members.
