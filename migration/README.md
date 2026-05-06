# thenextcigar — Migration tooling

This folder contains one-time scripts for moving thenextcigar.com off Webflow and onto Astro. Once the migration is complete, this whole folder can be archived.

## Day 1 — Export (this is what you run first)

### 1. Get a Webflow API token

1. Sign in to Webflow.
2. Go to **Account → Integrations → API access** (or directly: https://webflow.com/dashboard/account/integrations).
3. Click **Generate API token**.
4. Give it a name like `thenextcigar-migration`.
5. Scopes — at minimum: **Sites: read**, **CMS: read**, **Assets: read**. (Read-only is enough; the script never writes back to Webflow.)
6. Copy the token. You will not be able to see it again.

### 2. Set up local env

```bash
cd migration
cp .env.example .env
# open .env in your editor and paste the token after WEBFLOW_API_TOKEN=
# leave WEBFLOW_SITE_ID blank for now — the script will auto-detect
```

### 3. Run the export

You need Node 18 or newer (`node --version` to check). No `npm install` needed — the script uses only the standard library.

```bash
node --env-file=.env export.js
```

You'll see something like:

```
Auto-selected site: thenextcigar (abc123…)

Found 5 collection(s):
  • Blog Posts                 slug=blog-posts        id=…
  • Blog Post Categories       slug=blog-post-…       id=…
  • Authors                    slug=authors           id=…
  ...

→ Blog Posts
  18 item(s) saved
→ Blog Post Categories
  7 item(s) saved
...

Downloading 142 image(s)…
  25/142
  50/142
  ...

✓ Done. Dump written to /Users/.../migration/dump
```

### 4. What you get

```
migration/dump/
├── _site.json                      ← site metadata
├── _collections.json               ← list of all CMS collections
├── _manifest.json                  ← summary of the export
├── _assets/                        ← every image referenced in CMS items
│   └── (lots of .jpg / .png / .webp)
├── blog-posts.schema.json          ← collection field definitions
├── blog-posts.items.json           ← every blog post
├── blog-post-categories.schema.json
├── blog-post-categories.items.json
└── ...
```

### 5. Tell me you're done

Once the dump finishes, send me the contents of `_collections.json` and `*.schema.json` (just the schemas, not the full items). I'll use those to write a tailored `to-mdx.js` that maps your exact collection structure into Astro content collections without guesswork.

You can paste the JSON inline in the chat — it's all schema metadata, no secrets. The token stays on your machine.

---

## Day 2-3 — Convert (next, once we have the dump schema)

Once the converter is ready it'll be in this folder as `to-mdx.js`. It will:

- Read `dump/blog-posts.items.json` and write one `.mdx` file per post into `../src/content/blog/`.
- Read `dump/blog-post-categories.items.json` and write category metadata.
- Convert Webflow rich-text HTML → MDX (using a lightweight HTML→Markdown step).
- Move images from `dump/_assets/` → `../src/assets/blog/<slug>/` and rewrite all image paths.
- Generate a Cloudflare Pages `_redirects` file for any URL that has to change (default: keep all `/blog/<slug>` URLs identical so SEO is preserved).

---

## Troubleshooting

**"Missing WEBFLOW_API_TOKEN"** — your `.env` is missing or empty. Check the file is named `.env` exactly (not `.env.txt`) and there are no quotes around the value.

**`401 Unauthorized`** — token is wrong or expired. Regenerate.

**`403 Forbidden` on a specific collection** — the token doesn't have CMS read scope. Regenerate with the right scopes.

**Multiple sites visible** — the script will print all of them and exit. Copy the right site ID into `.env` as `WEBFLOW_SITE_ID=…` and rerun.

**"node: bad option: --env-file"** — your Node is older than 20. Either upgrade Node, or run `WEBFLOW_API_TOKEN=xxx node export.js` (loading the env var inline) instead.

**Some images failed to download** — that's logged but non-fatal. The JSON still has the original URLs, so the converter can retry or fall back to remote URLs. Ping me with the warnings if there are more than a handful.
