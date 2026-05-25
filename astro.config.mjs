// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://thenextcigar.com",
  trailingSlash: "always",
  // React integration enables React islands inside .astro pages — used for
  // the magazine redesign + interactive Lounge surfaces (Framer Motion,
  // shadcn/ui, 21st.dev components). Static SEO pages stay pure Astro;
  // React is only loaded where islands are explicitly mounted with
  // <Component client:load /> or client:visible / client:idle.
  integrations: [mdx(), sitemap(), react()],
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
