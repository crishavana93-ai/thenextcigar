// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import { readdirSync, readFileSync } from "node:fs";

// slug → ISO date, read from the blog frontmatter at config time.
const BLOG_DATES = new Map();
try {
  for (const f of readdirSync("src/content/blog")) {
    if (!/\.mdx?$/.test(f)) continue;
    const fm = readFileSync(`src/content/blog/${f}`, "utf8").split(/^---\s*$/m)[1] || "";
    const slug = fm.match(/^slug:\s*["']?([^"'\n]+)/m)?.[1]?.trim() || f.replace(/\.mdx?$/, "");
    const date = fm.match(/^updatedAt:\s*["']?([^"'\n]+)/m)?.[1] || fm.match(/^publishedAt:\s*["']?([^"'\n]+)/m)?.[1];
    const t = date ? Date.parse(date.trim()) : NaN;
    if (!isNaN(t)) BLOG_DATES.set(slug, new Date(t).toISOString());
  }
} catch {}

// https://astro.build/config
export default defineConfig({
  site: "https://thenextcigar.com",
  trailingSlash: "always",
  // React integration enables React islands inside .astro pages — used for
  // the magazine redesign + interactive Lounge surfaces (Framer Motion,
  // shadcn/ui, 21st.dev components). Static SEO pages stay pure Astro;
  // React is only loaded where islands are explicitly mounted with
  // <Component client:load /> or client:visible / client:idle.
  integrations: [
    mdx(),
    sitemap({
      // Private, gated or transactional pages never belong in the sitemap.
      // Anything here is also noindex on the page and disallowed in robots.txt.
      filter: (page) => !/\/(admin|api|lounge\/(app|login|signup|reset-password)|shop\/(thank-you|cart))\/?/.test(page),
      // lastmod for articles from their frontmatter (updatedAt, else
      // publishedAt), so Google can tell a rewrite from a reprint. Other
      // pages carry no lastmod rather than a fake one.
      serialize: (item) => {
        const m = item.url.match(/\/blog\/([^/]+)\/$/);
        if (m) {
          const d = BLOG_DATES.get(m[1]);
          if (d) item.lastmod = d;
        }
        return item;
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Allow remote optimization for Unsplash (free-license editorial covers)
    // and Amazon CDN (product thumbnails in gear roundups).
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      // Alibaba CDN — wholesale supplier product photos used on /shop/
      { protocol: "https", hostname: "s.alicdn.com" },
      { protocol: "https", hostname: "sc04.alicdn.com" },
      { protocol: "https", hostname: "img.alicdn.com" },
    ],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
