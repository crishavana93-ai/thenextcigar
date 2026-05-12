# Supabase setup for The Lounge

What Cris needs to do **once**, in order, before the app will work.

## 1. Create the project (5 min)

1. Go to [supabase.com](https://supabase.com), sign up with **guatabeycigars@gmail.com**
2. Create a new project named **`tnc-lounge`**, region **`eu-central-1` (Frankfurt)** — closest to Sweden audience
3. Pick a strong DB password and save it somewhere (Supabase doesn't show it again)
4. Wait ~2 minutes for provisioning

## 2. Run the schema migration (2 min)

1. In the Supabase dashboard, go to **SQL Editor → New Query**
2. Open `supabase/migrations/001_initial_schema.sql` from this repo
3. Paste the entire file into the SQL Editor
4. Click **Run** (bottom-right)
5. Should see "Success. No rows returned." or similar

This creates: `profiles`, `partner_lounges`, `checkins`, `travel_plans`, `introductions`, `direct_messages` — all with row-level security policies + the trigger that auto-creates a profile when someone signs up.

## 3. Create the avatars storage bucket (1 min)

1. Go to **Storage → Create new bucket**
2. Name it **`avatars`**, mark as **Public**
3. Then click on the bucket → **Policies** tab
4. Add policy: **Allow authenticated users to upload to their own folder**
   - Policy name: `authenticated upload to own folder`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - USING expression: `auth.uid()::text = (storage.foldername(name))[1]`
5. Add policy: **Allow public read**
   - Policy name: `public read`
   - Allowed operation: `SELECT`
   - Target roles: `anon, authenticated`
   - USING expression: `bucket_id = 'avatars'`

## 4. Configure Supabase Auth (2 min)

1. Go to **Authentication → Providers**
2. **Email** provider is on by default — keep it on
3. Enable **Confirm email** (so people verify before logging in)
4. Set **Site URL** to `https://thenextcigar.com`
5. Add to **Redirect URLs**:
   - `https://thenextcigar.com/lounge/app/`
   - `https://thenextcigar.com/lounge/login/`
   - `http://localhost:4321/lounge/app/` (for local dev)

## 5. Grab the API credentials (1 min)

1. Go to **Settings → API**
2. Copy the **Project URL** — looks like `https://abcdefghij.supabase.co`
3. Copy the **anon / public** key (the long JWT under "Project API keys")
4. **Don't share** the `service_role` key — that's server-only, you don't need it for client-side auth

## 6. Paste those into `.env` (1 min)

Create a `.env` file at the repo root (it's already in `.gitignore`):

```env
PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

The `PUBLIC_` prefix is required for Astro to expose these to the browser — they're meant to be public (the anon key is rate-limited and protected by RLS).

## 7. Add the same env vars to Cloudflare Pages (1 min)

1. Cloudflare Pages dashboard → your `thenextcigar` project → **Settings → Environment variables**
2. Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` for **Production**
3. Save. Next deploy picks them up automatically.

## 8. Install the Supabase JS client (1 min)

In the repo root:

```bash
npm install @supabase/supabase-js
```

That adds it to `package.json` so Cloudflare builds with it. **Don't push without this step or the build will fail.**

## 9. (Optional) Seed partner lounges from the existing Atlas

Once everything's working, run this in the SQL Editor to seed the partner lounges table from your existing `cigar-places.ts` dataset — saves manual entry:

```sql
-- Paste your partner-lounge data here as insert statements
-- Example for one row:
insert into public.partner_lounges (slug, name, city, country, address, lat, lng, type, verified_at, website)
values ('sautter-mayfair', 'Sautter of Mayfair', 'London', 'United Kingdom',
        '106 Mount Street, Mayfair, London W1K 2TW', 51.5095, -0.1530,
        'retailer', now(), 'https://www.sautter.com/');
-- Repeat for all 22 places from src/data/cigar-places.ts
```

I'll generate the full seed SQL when we get to Week 3.

---

## Done — you should be able to

- Visit `/lounge/signup/` → enter email → receive magic link → land on `/lounge/app/`
- Visit `/lounge/login/` → log back in with same email
- Visit `/lounge/app/profile/` → edit your display name, city, bio, avatar
- All without writing another line of code.

Week 2 adds the member directory. Week 3 adds check-ins. Week 4 adds travel mode + DMs.

If anything in step 1–8 fails, ping me with the exact error and I'll debug.
