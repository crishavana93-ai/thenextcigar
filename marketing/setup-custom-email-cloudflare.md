# Setting up `cris@thenextcigar.com` via Cloudflare Email Routing

Right now `cris@thenextcigar.com` doesn't exist — emails to it bounce with `550 5.1.1 Address does not exist`. Every reference across the site has been swapped to `guatabeycigars@gmail.com` so nothing bounces in the meantime.

If you want the custom-domain address back (and you should — reply rates from custom domains are roughly 2–3× a gmail when pitching cigar press), the cheapest, fastest path is **Cloudflare Email Routing**. It's free, it forwards to your existing gmail, and you can set it up in under 10 minutes.

This guide assumes your domain `thenextcigar.com` is already on Cloudflare (it is — that's how the Pages site runs).

## Step 1 — Open Email Routing

1. Log in to https://dash.cloudflare.com
2. Pick the `thenextcigar.com` zone from the home dashboard
3. Left sidebar → **Email** → **Email Routing**
4. Click **Get started** if you haven't enabled it before

Cloudflare will detect that your domain has existing DNS records and offer to add the email-routing records (an MX record + an SPF/TXT record). Click **Add records and enable** — it does it for you, no manual DNS editing.

Wait ~5 minutes for DNS propagation. The status pill should turn green.

## Step 2 — Create the routing rule

1. **Routing rules** tab
2. **Create address**
3. Custom address: `cris@thenextcigar.com`
4. Action: **Send to an email**
5. Destination address: `guatabeycigars@gmail.com`
6. Click **Save**

Cloudflare will send a verification email to `guatabeycigars@gmail.com`. Click the link inside. The destination becomes "verified" — that's required before forwarding will work.

## Step 3 — Test inbound

From any other email account (or use https://mail.tm for a throwaway), send a one-line message to `cris@thenextcigar.com`. It should land in your `guatabeycigars@gmail.com` inbox within 30 seconds, with the original sender visible and "via thenextcigar.com" in the headers.

If nothing arrives in 2 minutes:
- Check the **Activity log** in Email Routing for the message — it shows accepted / rejected / failed.
- Re-check that the destination verification link was clicked.
- Confirm SPF (TXT) record propagated: `dig TXT thenextcigar.com +short` should include `v=spf1 include:_spf.mx.cloudflare.net ~all`.

## Step 4 — Send AS `cris@thenextcigar.com` from Gmail

Inbound forwarding alone isn't enough — you also want replies to look like they're from `cris@thenextcigar.com`, not your gmail. For that:

### Option A — quickest (free): Gmail "Send mail as"

Cloudflare Email Routing doesn't support outbound SMTP directly, so for sending you use Gmail's built-in "Send mail as" feature with a separate SMTP relay. The cleanest free option is **Resend's** outbound API (you're already paying nothing for it; the Finder uses it for transactional alerts).

1. Resend dashboard → **Domains** → confirm `thenextcigar.com` is verified (it is, the alerts engine uses it).
2. **API Keys** → create a new key, scoped to `Sending access` only, name it `gmail-send-as`. Copy the key.
3. Gmail (web) → **Settings** (gear icon) → **See all settings** → **Accounts and Import** tab → **Send mail as** → **Add another email address**.
4. Name: `Cris Ortiz Suarez`. Email: `cris@thenextcigar.com`. Untick "Treat as alias". **Next step**.
5. SMTP Server: `smtp.resend.com`. Port: `587`. Username: `resend`. Password: paste the Resend API key from step 2. TLS. **Add Account**.
6. Resend will send a confirmation code to `cris@thenextcigar.com` — which Cloudflare forwards to your gmail. Click the verification link OR paste the code in Gmail's prompt.
7. **Make default**: in the Send mail as table, click "make default" next to `cris@thenextcigar.com`. Future compose windows default to that address.

Cost: $0/month for Resend's free tier (3,000 emails/month — plenty for outreach).

### Option B — paid: Google Workspace

If you'd rather have a proper mailbox: $7/user/month gets you a real Workspace inbox at `cris@thenextcigar.com`. Replaces both inbound and outbound. Same DNS Cloudflare just set up needs adjusting — Workspace's setup wizard walks through it. Not worth the cost unless you grow past 1 person handling email.

## Step 5 — Update site references back

Once `cris@thenextcigar.com` works again, you can sweep these back:

```bash
cd ~/Documents/thenextcigar
# Replace guatabeycigars references that were previously cris@
# (do it manually in the files listed below — the *.md outreach copy
#  should keep gmail as a fallback hint; only the public-facing pages
#  should switch back)
```

Files to revisit:

- `src/pages/lounge/app/events/index.astro` — 2 references (empty-state + data-source footer). Swap back to `cris@thenextcigar.com?subject=Event%20submission`.
- `marketing/founder-member-announcement-email.md` — 2 references in the email body. Swap back so the OG Member announcement reads more personal.
- `marketing/backlink-outreach-templates.md` — the opening line about "send from `cris@thenextcigar.com`" is already correctly conditional, no change needed.

Don't swap back until inbound forwarding tests cleanly and you've verified you can reply from gmail as `cris@`.

## Step 6 — While you're at it: claim a few more

Useful aliases that all forward to the same gmail. Each takes 30 seconds in Email Routing:

- `hello@thenextcigar.com` → general inquiries
- `press@thenextcigar.com` → for blogger outreach replies; looks more legit than personal address
- `events@thenextcigar.com` → swap the events-page mailto here once you have it
- `partners@thenextcigar.com` → for retailer + lounge partnerships
- `alerts@thenextcigar.com` → already in use by the Finder's transactional emails; verify it forwards somewhere readable

Doing all five takes 5 minutes total once Step 1 is done.

## Why this matters

Cigar editors and forum moderators trash mail from `@gmail.com` addresses at roughly 2× the rate of `@yourdomain.com`. It's not rational — it's a pattern-match they've learned. The custom domain doesn't make your pitch better; it just stops it from getting filtered out before they read the first sentence.

The Email Routing setup is $0 and ~10 minutes. Skip the outbound SMTP step if you don't care about sending — Cloudflare forwarding alone solves the bounce problem and means people can actually reach you at the address you've been advertising.

## One more thing — fix any places that still say cris@

Run this from the repo root to confirm every reference is dealt with:

```bash
grep -rn "cris@thenextcigar" . | grep -v node_modules | grep -v .git
```

Should return zero results (or only this setup doc). If it doesn't, the swap missed somewhere.
