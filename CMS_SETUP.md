# CMS Setup — Decap CMS at /admin/

This is a one-time setup so you can write articles in a browser instead of editing MDX files locally.

After setup, the workflow is:
1. Visit https://thenextcigar.com/admin/
2. Log in with GitHub (one click)
3. Click "Articles" → "New Article"
4. Fill in title, body, cover image, category, etc.
5. Click "Publish"
6. Cloudflare auto-rebuilds in ~2 minutes
7. Article is live at https://thenextcigar.com/blog/<your-slug>/

---

## Step 1 — Create a GitHub OAuth App (5 min, one-time)

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** in the left sidebar → **New OAuth App** (top right)
3. Fill in:
   | Field | Value |
   |---|---|
   | **Application name** | `TNext Cigar CMS` |
   | **Homepage URL** | `https://thenextcigar.com` |
   | **Application description** | (optional) `Editor for thenextcigar.com` |
   | **Authorization callback URL** | `https://thenextcigar.com/api/callback` |
4. Leave "Enable Device Flow" **unchecked**
5. Click **Register application**

You'll land on the app's settings page. **Don't close this tab yet.**

---

## Step 2 — Generate a client secret

On the app settings page:
1. Note the **Client ID** at the top (long string starting with `Ov23` or `Iv1.`)
2. Click **Generate a new client secret**
3. GitHub shows the secret **once** — copy it now. (Looks like a 40-char hex string.)

You now have:
- `GITHUB_CLIENT_ID` (something like `Ov23liabc123...`)
- `GITHUB_CLIENT_SECRET` (something like `1a2b3c4d5e6f...`)

---

## Step 3 — Add them to Cloudflare Pages

1. Go to https://dash.cloudflare.com → **Workers & Pages** → click your `thenextcigar` Pages project
2. **Settings** tab → scroll down to **Environment variables** → **Production**
3. Click **Add variable** twice — once for each:
   | Variable name | Value | Type |
   |---|---|---|
   | `GITHUB_CLIENT_ID` | (paste from Step 2) | Plaintext |
   | `GITHUB_CLIENT_SECRET` | (paste from Step 2) | **Encrypted** ← important |
4. Click **Save**

---

## Step 4 — Push the CMS code

Already in your repo. Just push:

```bash
cd "/Users/cristianortizsuarez/Documents/Claude/Projects/Guatabey/thenextcigar"
git add -A
git commit -m "CMS: Decap admin at /admin/ + Cloudflare Pages OAuth functions"
git push
```

Wait ~2 min for Cloudflare to rebuild.

---

## Step 5 — Try logging in

1. Go to https://thenextcigar.com/admin/
2. You should see Decap CMS's login screen with a "Login with GitHub" button
3. Click it → GitHub asks you to authorize the OAuth app you just created → click **Authorize**
4. Decap loads with your existing 37 articles, 7 categories, and 1 author already there.

---

## Writing your first article

1. Click **Articles** → **New Article** (top right)
2. Fill in:
   - **Title** — your headline
   - **URL slug** — auto-fills from title; edit if you want
   - **Excerpt** — 1–2 sentence summary
   - **Publish date** — defaults to now
   - **Category** — pick from dropdown
   - **Author** — pick from dropdown
   - **Cover image** — drag/drop or click to upload. Goes into `/uploads/` automatically.
   - **Featured** — check if you want it on the homepage hero
   - **Members-only** — check for premium content (gets the lock badge)
   - **SEO (collapsed)** — expand to add meta-title, meta-description, focus keyword, OG image
   - **Article body** — full Markdown editor
3. Click **Publish** at the top right
4. Decap commits to GitHub → Cloudflare rebuilds → live in ~2 min

---

## Editing existing articles

Click any article in the **Articles** list → edit anything → **Publish**. Same auto-rebuild flow.

---

## Tips

- **Save Draft** — saves to GitHub but doesn't trigger a rebuild yet (saves as a separate branch). Useful for half-finished pieces.
- **Preview** — shows a live preview of your article as you type
- **Image uploads** — go to `public/uploads/`. Reference them as `/uploads/<filename>.jpg` in MDX.
- **Bulk edits** — if you need to change many articles at once, edit MDX files locally and commit via git; Decap respects whatever's in the repo.

---

## Troubleshooting

**"Login failed: Could not authenticate"**
The most common cause is a typo in the OAuth app's callback URL. Verify it's exactly `https://thenextcigar.com/api/callback` (no trailing slash, https not http).

**"Missing GITHUB_CLIENT_ID env var"**
You forgot Step 3 or didn't redeploy after adding the env var. In Cloudflare Pages → **Deployments** → **Retry deployment** on the latest commit.

**Editor loads but says "API rate limit exceeded"**
GitHub OAuth flow is occasionally rate-limited. Wait 60 seconds and try again.

**Edits don't appear on the live site**
Check **Cloudflare Pages → Deployments**. The latest deployment should show your CMS commit. If it failed, click the deployment to see the build log.

---

## Security

- The CMS at `/admin/` is **public** — anyone can visit, but only people with GitHub access to the `crishavana93-ai/thenextcigar` repo can actually log in and edit
- The OAuth flow uses HTTPS end-to-end
- The client secret is encrypted in Cloudflare's environment variables
- Decap's `noindex` meta tag prevents search engines from indexing `/admin/`
- If a token is ever leaked, just regenerate the GitHub OAuth client secret (Step 2) and update the env var
