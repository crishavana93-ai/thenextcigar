# How to use the CMS — Pages CMS at app.pagescms.org

This is your editor. You log in via GitHub, write articles, save, and the live site rebuilds in ~2 minutes.

## Daily workflow

1. Open https://app.pagescms.org/crishavana93-ai/thenextcigar/main/
2. (If logged out, click **Sign in with GitHub** and authorize.)
3. Click **Articles** in the sidebar
4. Either:
   - **Click an existing article** to edit it, OR
   - **Click "+ New" (top right)** to write a new one

## What each field does

| Field | What it controls |
|---|---|
| **Title** | The headline — appears at the top of the article and in cards. 50–70 chars optimal for SEO. |
| **URL slug** | The URL path. Becomes `https://thenextcigar.com/blog/<slug>/`. Auto-fills from title; edit to override. |
| **Excerpt** | 1–2 sentence summary. Used on cards, in the latest-news grid, and as the default meta description. |
| **Publish date** | When the article goes live. Articles dated in the future will still build but display with that date. |
| **Last updated** | Optional. Set when you do a significant edit. Shown subtly under the byline. |
| **Category** | Pick from your 7 categories. Drives the "WHAT'S HOT IN [Category]" sections. |
| **Author** | Pick from authors. Drives the byline + the `/author/<slug>/` profile page. |
| **Cover image** | The big hero image at the top of the article AND the main card image. Drag/drop or click to upload. Goes into `/uploads/`. 1600×900 recommended. |
| **Thumbnail** | Optional — only used in compact card views. Defaults to cover. |
| **Featured** | Show this article as the home page hero ("HIGHLIGHT NEWS"). Only the most recent featured post is used; older featured ones move to the grid. |
| **Sidebar featured** | Reserved for future "trending sidebar" widget. |
| **Members-only** | Premium content. Adds the lock badge ("MEMBER ONLY") and routes through the paywall. Free posts still appear in the grid; premium posts show the lock overlay. |
| **SEO panel** | Optional overrides. If blank, meta-title falls back to title, meta-description to excerpt, OG image to cover. |
| **Article body** | Full content. Markdown supported — headings (## ##), **bold**, *italic*, lists, links, images, blockquotes. Drag images directly into the editor. |

## Saving

- Click **Save** (top right)
- This commits your edits to GitHub via a **pull request** (or direct commit if you switched the setting in `.pages.yml`)
- Cloudflare Pages auto-rebuilds on every commit to `main`
- Live site updates in ~2 minutes

## When something doesn't show up

- **The article isn't on the home page** — check it's not marked `noIndex`, the publish date isn't in the future, and Cloudflare's deploy succeeded (https://dash.cloudflare.com → Workers & Pages → thenextcigar → Deployments)
- **Image doesn't display** — Pages CMS commits images to `public/uploads/`. Make sure the path in the cover field starts with `/uploads/<filename>`. If you uploaded but the path looks weird, click the cover field and re-pick the image.
- **Category dropdown is empty** — refresh the page; Pages CMS caches the categories list

## Style conventions for cigar editorial

- Lead with a hook in the first paragraph; the drop cap on the first letter is automatic
- Use **bold** for product/brand names on first mention (e.g. **Punch Princesas**, **Habanos S.A.**)
- Use blockquotes for pull-quotes from interview subjects
- Embed YouTube videos with the `<YouTubeEmbed>` MDX component (paste the video ID, no need to write the iframe yourself):
  ```
  <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Optional caption" />
  ```
- For non-YouTube videos (Cigar Aficionado's site player, etc.) use `<VideoCard>`:
  ```
  <VideoCard
    href="https://www.cigaraficionado.com/article/some-video"
    thumbnail="https://path-to-thumb.jpg"
    title="Some video title"
    source="Cigar Aficionado"
    duration="12:34"
  />
  ```

## Adding a new author or category

1. **Categories** in the sidebar → **+ New**
2. Fill in slug (lowercase, hyphens) and display name
3. Save
4. New category is now available in the article editor's Category dropdown

Same for authors.

## When you want to do bulk edits

Pages CMS is great for one-at-a-time editing. For find-and-replace across all 37 articles or programmatic changes, edit the `.mdx` files locally and `git push` — Pages CMS respects whatever's in the repo.

## Don't lose work

- Pages CMS auto-saves drafts every few seconds while you're typing
- The "**Save**" button commits to GitHub — that's the durable save
- If you close the tab without clicking Save, the auto-saved draft survives a refresh but isn't on GitHub yet

## Switching back to direct-to-main commits (optional)

The `.pages.yml` file has `style: pull-request` — every save creates a PR you can review and merge. If you want saves to skip the PR step and commit straight to main, edit `.pages.yml` → change `pull-request` to `direct` → push.
