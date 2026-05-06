#!/usr/bin/env node
/**
 * thenextcigar.com — Webflow JSON dump → Astro content collections
 *
 * Reads ./dump/*.json (produced by export.js) and writes:
 *   ../src/content/blog/<slug>.mdx        ← all blog posts (regular + premium merged, isPremium flag)
 *   ../src/content/categories/<slug>.json ← category metadata
 *   ../src/content/authors/<slug>.json    ← author metadata (just Cris)
 *   ../src/assets/blog/<slug>/<file>      ← post cover, thumbnail, body images (renamed cleanly)
 *   ../src/assets/authors/<slug>/<file>   ← avatar, portrait
 *   ../public/_redirects                  ← Cloudflare Pages redirect rules (keeps all /blog/<slug>)
 *
 * Zero dependencies — uses only the standard library. The HTML → Markdown converter is inlined
 * because Webflow's rich-text output is predictable enough that a small regex pass beats pulling in
 * turndown + cheerio for one-time work.
 *
 * Run:  node to-mdx.js
 */

import fs from "node:fs/promises";
import path from "node:path";

const DUMP = path.resolve("./dump");
const ASSETS_IN = path.join(DUMP, "_assets");
const ROOT = path.resolve("..");
const SRC = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");

const DIRS = {
  blogContent: path.join(SRC, "content", "blog"),
  categoryContent: path.join(SRC, "content", "categories"),
  authorContent: path.join(SRC, "content", "authors"),
  blogAssets: path.join(SRC, "assets", "blog"),
  authorAssets: path.join(SRC, "assets", "authors"),
  publicDir: PUBLIC_DIR,
};

// ---------------- utilities ----------------

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeFile(file, contents) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, contents, "utf8");
}

async function copyImage(srcUrl, destDir, baseName) {
  if (!srcUrl) return null;
  // Filename on disk (export.js used path.basename(u.pathname) — encoded form)
  let diskName;
  try {
    diskName = path.basename(new URL(srcUrl).pathname);
  } catch {
    return null;
  }
  const srcPath = path.join(ASSETS_IN, diskName);
  // Did the export actually grab it?
  try {
    await fs.access(srcPath);
  } catch {
    console.warn(`  ! missing on disk: ${diskName}`);
    return null;
  }
  // Clean output filename: <base>-<short hash from original>.<ext>
  const decoded = decodeURIComponent(diskName);
  const ext = path.extname(decoded).toLowerCase() || ".jpg";
  const stem = slugify(path.basename(decoded, path.extname(decoded))).slice(0, 60);
  const finalName = baseName ? `${baseName}-${stem}${ext}` : `${stem}${ext}`;
  await ensureDir(destDir);
  const destPath = path.join(destDir, finalName);
  await fs.copyFile(srcPath, destPath);
  return finalName;
}

function slugify(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function escYaml(s) {
  if (s === null || s === undefined) return "";
  const str = String(s);
  // Quote if contains anything YAML might mis-parse
  if (/^[\s'"]|[:#&*!|>%@`]|^[-?]\s|^(?:true|false|null|~|\d)$/i.test(str) || /\n/.test(str)) {
    return JSON.stringify(str);
  }
  return str;
}

function stripTags(s) {
  return String(s || "").replace(/<[^>]+>/g, "");
}

function decodeEntities(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”");
}

// ---------------- HTML → Markdown ----------------

function htmlToMarkdown(html, imageMap = new Map()) {
  if (!html) return "";
  let md = html;

  // Strip Webflow's empty id="" attributes everywhere — saves us downstream regex pain
  md = md.replace(/\s+id="[^"]*"/g, "");

  // Block elements first (outer to inner)
  // Headings (h6 → h1)
  for (let i = 6; i >= 1; i--) {
    const re = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)</h${i}>`, "gi");
    md = md.replace(re, (_, c) => `\n\n${"#".repeat(i)} ${stripTags(c).trim()}\n\n`);
  }

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => {
    const items = [];
    c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => {
      items.push(`- ${inlineHtmlToMd(li, imageMap).trim()}`);
      return "";
    });
    return "\n\n" + items.join("\n") + "\n\n";
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    const items = [];
    let n = 0;
    c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => {
      n++;
      items.push(`${n}. ${inlineHtmlToMd(li, imageMap).trim()}`);
      return "";
    });
    return "\n\n" + items.join("\n") + "\n\n";
  });

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => {
    const text = inlineHtmlToMd(c, imageMap).trim();
    return "\n\n" + text.split("\n").map((l) => `> ${l}`).join("\n") + "\n\n";
  });

  // Pre/code
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => `\n\n\`\`\`\n${stripTags(c)}\n\`\`\`\n\n`);

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");

  // BR
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Paragraphs (do last so block elements above are already extracted)
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => {
    const inner = inlineHtmlToMd(c, imageMap).trim();
    if (!inner) return "";
    return `\n\n${inner}\n\n`;
  });

  // Anything left that's still a tag — strip
  md = inlineHtmlToMd(md, imageMap);

  // Decode entities
  md = decodeEntities(md);

  // Remove ZWJ and stray nbsp leftovers
  md = md.replace(/‍/g, "").replace(/ /g, " ");

  // Collapse extra blank lines
  md = md.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  return md;
}

function inlineHtmlToMd(html, imageMap) {
  let s = String(html || "");
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  s = s.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "$1");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  // Links
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const text = stripTags(txt).trim() || href;
    return `[${text}](${href})`;
  });
  // Images (inline) — rewrite via imageMap if known
  s = s.replace(/<img[^>]*>/gi, (m) => {
    const src = (m.match(/src="([^"]+)"/) || [])[1] || "";
    const alt = (m.match(/alt="([^"]*)"/) || [])[1] || "";
    const newSrc = imageMap.get(src) || src;
    return `![${alt}](${newSrc})`;
  });
  // Strip any remaining tags
  s = s.replace(/<[^>]+>/g, "");
  return s;
}

// ---------------- main ----------------

async function main() {
  console.log("Loading dump…");
  const collections = await readJson(path.join(DUMP, "_collections.json"));
  const blogItems = await readJson(path.join(DUMP, "blog.items.json"));
  const premiumItems = await readJson(path.join(DUMP, "blog-posts-premium.items.json"));
  const categoryItems = await readJson(path.join(DUMP, "blog-post-categories.items.json"));
  const teamItems = await readJson(path.join(DUMP, "team.items.json"));

  console.log(`  ${blogItems.length} blog posts, ${premiumItems.length} premium posts`);
  console.log(`  ${categoryItems.length} categories, ${teamItems.length} authors`);

  // Build lookups by ID
  const categoryById = new Map();
  for (const c of categoryItems) categoryById.set(c.id, c.fieldData);
  const authorById = new Map();
  for (const a of teamItems) authorById.set(a.id, a.fieldData);

  // ---------- Categories ----------
  console.log("\nWriting categories…");
  for (const c of categoryItems) {
    const fd = c.fieldData;
    const slug = (fd.slug || slugify(fd.name)).trim();
    const name = (fd.name || slug).trim();
    const description = fd["blog-category-description"] || "";
    let thumb = null;
    if (fd["blog-post-thumbnail-image-photo"]?.url) {
      thumb = await copyImage(
        fd["blog-post-thumbnail-image-photo"].url,
        path.join(SRC, "assets", "categories", slug),
        "thumb"
      );
    }
    const obj = { slug, name, description, thumbnail: thumb };
    await writeFile(
      path.join(DIRS.categoryContent, `${slug}.json`),
      JSON.stringify(obj, null, 2) + "\n"
    );
    console.log(`  ✓ ${slug}`);
  }

  // ---------- Authors ----------
  console.log("\nWriting authors…");
  for (const a of teamItems) {
    const fd = a.fieldData;
    const slug = (fd.slug || slugify(fd.name)).trim();
    const name = (fd.name || slug).trim();
    let avatar = null, portrait = null;
    if (fd["team-member-avatar-picture"]?.url) {
      avatar = await copyImage(
        fd["team-member-avatar-picture"].url,
        path.join(DIRS.authorAssets, slug),
        "avatar"
      );
    }
    if (fd["team-member-portrait-picture"]?.url) {
      portrait = await copyImage(
        fd["team-member-portrait-picture"].url,
        path.join(DIRS.authorAssets, slug),
        "portrait"
      );
    }
    const obj = {
      slug,
      name,
      jobTitle: fd["team-member-job-title"] || null,
      excerpt: fd["team-member-excerpt"] || null,
      bio: htmlToMarkdown(fd["team-member-bio"] || ""),
      email: fd["team-member-email"] || null,
      website: fd["team-member-website"] || null,
      twitter: fd["team-member-twitter-link"] || null,
      facebook: fd["team-member-facebook-link"] || null,
      instagram: fd["team-member-instagram-link"] || null,
      linkedin: fd["team-member-linkedin-link"] || null,
      avatar,
      portrait,
    };
    await writeFile(
      path.join(DIRS.authorContent, `${slug}.json`),
      JSON.stringify(obj, null, 2) + "\n"
    );
    console.log(`  ✓ ${slug}`);
  }

  // ---------- Blog posts (regular + premium merged) ----------
  console.log("\nWriting blog posts…");
  const allPosts = [
    ...blogItems.map((p) => ({ ...p, _isPremium: false })),
    ...premiumItems.map((p) => ({ ...p, _isPremium: true })),
  ].filter((p) => !p.isArchived && !p.isDraft);

  // Sort newest first by lastPublished (or createdOn fallback)
  allPosts.sort((a, b) => {
    const ad = new Date(a.lastPublished || a.createdOn || 0).getTime();
    const bd = new Date(b.lastPublished || b.createdOn || 0).getTime();
    return bd - ad;
  });

  for (const p of allPosts) {
    const fd = p.fieldData;
    const slug = (fd.slug || slugify(fd.name)).trim();
    const title = (fd.name || slug).trim();
    const excerpt = (fd["blog-post-excerpt"] || "").trim();

    // Cover & thumbnail
    const slugAssets = path.join(DIRS.blogAssets, slug);
    let cover = null, thumb = null;
    if (fd["blog-post-featured-image-photo"]?.url) {
      cover = await copyImage(fd["blog-post-featured-image-photo"].url, slugAssets, "cover");
    }
    if (fd["blog-post-thumbnail-image-photo"]?.url) {
      thumb = await copyImage(fd["blog-post-thumbnail-image-photo"].url, slugAssets, "thumb");
    }

    // Body — handle both the typo'd field (regular collection) and the correct one (premium)
    const bodyHtml = fd["blog-post-richt-text"] || fd["blog-post-rich-text"] || "";

    // Walk the body for inline image URLs, copy each one, build URL→localPath map
    const inlineUrls = [...bodyHtml.matchAll(/<img[^>]*src="([^"]+)"/gi)].map((m) => m[1]);
    const imageMap = new Map();
    let inlineIdx = 0;
    for (const url of inlineUrls) {
      inlineIdx++;
      const local = await copyImage(url, slugAssets, `inline-${inlineIdx}`);
      if (local) imageMap.set(url, `../../assets/blog/${slug}/${local}`);
    }

    let bodyMd = htmlToMarkdown(bodyHtml, imageMap);

    // Strip a leading duplicate-of-title heading at the top of the body (Webflow authors
    // often opened the rich-text with the post title repeated as an H1/H2/H3).
    {
      const titleNorm = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const lines = bodyMd.split("\n");
      // Skip leading blank lines
      let i = 0;
      while (i < lines.length && lines[i].trim() === "") i++;
      if (i < lines.length) {
        const m = lines[i].match(/^#{1,6}\s+(.+)$/);
        if (m) {
          const head = m[1].toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
          if (head === titleNorm || titleNorm.startsWith(head) || head.startsWith(titleNorm)) {
            lines.splice(0, i + 1);
            // also drop one trailing blank line if present
            if (lines[0]?.trim() === "") lines.shift();
            bodyMd = lines.join("\n");
          }
        }
      }
    }

    // Resolve refs
    const catRef = fd["blog-post-category"];
    const catSlug = catRef && categoryById.get(catRef)?.slug?.trim() || null;
    const authorRef = fd["blog-post-author"];
    const authorSlug = authorRef && authorById.get(authorRef)?.slug?.trim() || null;

    // Frontmatter
    // Astro's image() schema resolves relative paths from the MDX file's location:
    //   src/content/blog/<slug>.mdx  →  ../../assets/blog/<slug>/<file>  =  src/assets/blog/<slug>/<file>
    const assetRel = `../../assets/blog/${slug}`;
    const fm = {
      title,
      slug,
      excerpt,
      publishedAt: p.lastPublished || p.createdOn || null,
      updatedAt: p.lastUpdated || null,
      category: catSlug,
      author: authorSlug,
      cover: cover ? `${assetRel}/${cover}` : null,
      thumbnail: thumb ? `${assetRel}/${thumb}` : null,
      featured: !!fd["blog-post-is-featured"],
      sidebarFeatured: !!fd["blog-post-is-sidebar-featured"],
      isPremium: p._isPremium,
      sourceId: p.id,
    };

    const yaml = Object.entries(fm)
      .map(([k, v]) => {
        if (v === null || v === undefined) return `${k}: ~`;
        if (typeof v === "boolean") return `${k}: ${v}`;
        return `${k}: ${escYaml(v)}`;
      })
      .join("\n");

    const mdx = `---\n${yaml}\n---\n\n${bodyMd}\n`;
    await writeFile(path.join(DIRS.blogContent, `${slug}.mdx`), mdx);
    console.log(`  ✓ ${slug}${p._isPremium ? "  [premium]" : ""}`);
  }

  // ---------- Redirects ----------
  // Webflow URLs we want to preserve identically:
  //   /blog/<slug>                                 → keep
  //   /blog-post-categories/<slug>                 → /category/<slug>  (cleaner URL on the new site)
  //   /home-premium, /access-denied, /sign-up, /log-in, /reset-password, /subscribe → handled later
  // Cloudflare Pages reads public/_redirects at build time. Format: `/source /destination 301`
  console.log("\nWriting _redirects…");
  const redirectLines = [
    "# Auto-generated by migration/to-mdx.js",
    "# Old Webflow URLs → new Astro URLs",
    "",
    "# Category pages: /blog-post-categories/<slug> → /category/<slug>",
  ];
  for (const c of categoryItems) {
    const slug = c.fieldData.slug?.trim();
    if (slug) redirectLines.push(`/blog-post-categories/${slug} /category/${slug} 301`);
  }
  redirectLines.push(
    "",
    "# Webflow membership pages — point at the new newsletter subscribe page until member area is rebuilt",
    "/home-premium /subscribe 302",
    "/access-denied /subscribe 302",
    "/sign-up /subscribe 302",
    "/log-in /subscribe 302",
    "/reset-password /subscribe 302",
    "",
    "# Webflow template pages — drop them",
    "/template-pages/start-here / 301",
    "/template-pages/style-guide / 301",
    ""
  );
  await writeFile(path.join(DIRS.publicDir, "_redirects"), redirectLines.join("\n"));
  console.log(`  ✓ public/_redirects`);

  // ---------- Summary ----------
  console.log("\n✓ Conversion complete.");
  console.log(`  Wrote ${allPosts.length} blog posts to ${DIRS.blogContent}`);
  console.log(`  Wrote ${categoryItems.length} categories to ${DIRS.categoryContent}`);
  console.log(`  Wrote ${teamItems.length} authors to ${DIRS.authorContent}`);
  console.log(`  Wrote redirects to ${path.join(DIRS.publicDir, "_redirects")}`);
  console.log("\nNext: I'll scaffold the Astro site around this content. Tell me to proceed.");
}

main().catch((err) => {
  console.error("\n✗ Conversion failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
