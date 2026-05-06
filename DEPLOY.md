# Deploy thenextcigar.com → Cloudflare Pages

End-to-end. From local repo to a live site at `https://thenextcigar.com`. ~30 minutes total. Webflow gets cancelled at the end.

---

## Phase 1 — Local sanity check (5 min)

In Terminal, from the `thenextcigar/` folder:

```bash
cd "/Users/cristianortizsuarez/Documents/Claude/Projects/Guatabey/thenextcigar"

# If dev server is running, stop it (Ctrl+C in that terminal). Then:
rm -rf .astro node_modules/.astro 2>/dev/null   # clear stale Astro caches
npm run build                                    # full production build
```

Expected outcome: a successful build, output written to `dist/`. If errors, paste the error and I'll fix.

Optional preview of the production build:
```bash
npm run preview
# open http://localhost:4321
```

---

## Phase 2 — Initialize git and push to GitHub (10 min)

### 2.1 — Initialize the local repo

```bash
cd "/Users/cristianortizsuarez/Documents/Claude/Projects/Guatabey/thenextcigar"
git init
git add .
git status                                       # double-check what's being committed
git commit -m "Initial commit: Astro rebuild of thenextcigar.com"
```

The `.gitignore` already excludes `node_modules/`, `dist/`, `.astro/`, `migration/.env`, and `migration/dump/` — none of those should appear in `git status`.

### 2.2 — Create the GitHub repo

Easiest way: install `gh` (GitHub's CLI) if you haven't:
```bash
brew install gh
gh auth login                                    # follow prompts (browser-based login)
```

Then create + push in one line:
```bash
gh repo create thenextcigar --private --source=. --push
```

(If you don't want to install `gh`, do it via the web: go to https://github.com/new → name it `thenextcigar` → Private → Create. Then back in Terminal:)
```bash
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/thenextcigar.git
git branch -M main
git push -u origin main
```

You should see "Branch 'main' set up to track 'origin/main'." — that means the code is on GitHub.

---

## Phase 3 — Connect Cloudflare Pages (10 min)

### 3.1 — Create the Cloudflare Pages project

1. Sign in at https://dash.cloudflare.com (create a free account if you don't have one — Cloudflare Pages is free with no credit card).
2. Left sidebar: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare to access your GitHub account. You can scope it to just the `thenextcigar` repo for safety.
4. Pick the `thenextcigar` repo → **Begin setup**.

### 3.2 — Build settings

Cloudflare auto-detects Astro. Verify these match:

| Field | Value |
|---|---|
| Project name | `thenextcigar` |
| Production branch | `main` |
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (leave blank) |
| Environment variable: `NODE_VERSION` | `20` |

Click **Save and Deploy**. The first build takes ~2–3 minutes.

You'll get a URL like `https://thenextcigar.pages.dev` — verify the site loads. Click around: home, a post, a category, subscribe, 404. Confirm it looks right.

### 3.3 — Attach your custom domain

Once the `pages.dev` URL works:

1. In the Pages project: **Custom domains** → **Set up a custom domain**.
2. Enter `thenextcigar.com` → Continue.
3. Cloudflare will tell you what DNS record to set.

#### If your domain is already on Cloudflare DNS

It auto-configures. Done in 60 seconds.

#### If your domain is on another registrar (GoDaddy, Namecheap, Google Domains, etc.)

Two options:

**(A) Move DNS to Cloudflare (recommended — gives you all of Cloudflare's free CDN/SSL)**

1. In Cloudflare: **Add a Site** → enter `thenextcigar.com` → free plan.
2. Cloudflare scans your existing DNS records.
3. Copy the two Cloudflare nameservers it gives you (looks like `xxx.ns.cloudflare.com`).
4. At your current registrar, update the domain's nameservers to those two.
5. Wait 5–60 minutes for propagation.
6. Once propagated, repeat step 1 above and the custom domain attaches.

**(B) Stay on your current registrar, just point a CNAME**

1. In your registrar's DNS settings, add:
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Value: `thenextcigar.pages.dev`
2. Wait 5–30 minutes.
3. Cloudflare auto-issues a free SSL certificate.

### 3.4 — Verify HTTPS + redirects

After ~2 minutes:
- `https://thenextcigar.com` → loads the new site
- `https://thenextcigar.com/blog/punch-princesas-celebrating-185-years-of-british-wit-and-cuban-craft` → loads the post
- `https://thenextcigar.com/blog-post-categories/cubans` → 301 redirects to `/category/cubans` (the `_redirects` file handles this automatically)
- `https://thenextcigar.com/sign-up` → 302 redirects to `/subscribe`

If any of those don't work, ping me with the URL and what you see.

---

## Phase 4 — Cancel Webflow (the satisfying part)

Only do this once you've verified for **at least 24 hours** that the new site is up, indexed, and getting traffic without errors. That's a safety buffer in case anything's wrong.

1. Sign in to https://webflow.com.
2. Workspace → Plans / Billing.
3. Cancel the paid Webflow plan. (Don't delete the Workspace yet — keep the source data accessible for a month in case you need to refer to anything.)
4. Verify next month's bill is **$0**.
5. After 30 days, if you've never gone back to Webflow for anything, delete the Workspace entirely.

**You just saved $360/year.**

---

## Common fixes

**`npm run build` fails with "Cannot find module"**
Probably forgot `npm install`. From the `thenextcigar/` folder run `npm install` again.

**Cloudflare build fails with "Cannot find package 'astro'"**
The `NODE_VERSION` env var is missing or wrong. Set it to `20` in the Pages project settings → Environment variables.

**Custom domain stuck on "Verifying"**
Wait 30 minutes. If still stuck, the DNS hasn't propagated. Run `dig thenextcigar.com` in Terminal to check.

**Post images don't load on the live site**
The MDX `cover:` and `thumbnail:` paths must be relative — check `src/content/blog/<any>.mdx` and confirm they start with `../../assets/blog/...`. If they don't, re-run `cd migration && node to-mdx.js` and push the new content.

**View transitions don't fade between pages**
Check that `<ClientRouter />` is in `BaseLayout.astro` (it is, but worth verifying). Also: View Transitions only work in Chromium-based browsers (Chrome, Edge, Brave) and Safari 18+. Firefox falls back gracefully to instant transitions.

---

## What's next after deploy

Once you're live:

1. **Submit `https://thenextcigar.com/sitemap-index.xml` to Google Search Console.** Free, takes 2 minutes, gets you indexed faster.
2. **Sign up for Ezoic or Google AdSense.** AdSense is instant approval; Ezoic needs ~1k/month visitors. Replace the `<AdSlot />` placeholders with their code once approved.
3. **Apply to cigar retailer affiliate programs** (Famous Smoke, JR Cigar, Cigars International) and add the affiliate disclosure block to relevant posts.
4. **Set up Beehiiv** at https://www.beehiiv.com → free tier → publication name "The Next Cigar" → replace the placeholder embed URL in `src/components/Newsletter.astro` and `src/pages/subscribe.astro`.
5. **Apply for IMPI Class 41** (online publication) trademark if you want long-term protection of "The Next Cigar" — separate from GUANABEY.
