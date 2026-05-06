import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      excerpt: z.string().optional().nullable().default(""),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      category: z.string().nullable().default(null),
      author: z.string().nullable().default(null),
      // image() resolves relative paths from the .mdx file (existing posts),
      // OR a string starting with "/" (absolute path for CMS-uploaded media)
      cover: z.union([image(), z.string()]).optional().nullable(),
      thumbnail: z.union([image(), z.string()]).optional().nullable(),
      featured: z.boolean().default(false),
      sidebarFeatured: z.boolean().default(false),
      isPremium: z.boolean().default(false),
      sourceId: z.string().optional(),
      // SEO fields (optional, populated by Decap CMS editor)
      seo: z
        .object({
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
          focusKeyword: z.string().optional().nullable(),
          ogImage: z.union([image(), z.string()]).optional().nullable(),
          canonicalUrl: z.string().optional().nullable(),
          noIndex: z.boolean().default(false).optional(),
        })
        .optional(),
    }),
});

const categories = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/categories" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string().optional().nullable().default(""),
    thumbnail: z.string().optional().nullable(),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/authors" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    jobTitle: z.string().optional().nullable(),
    excerpt: z.string().optional().nullable(),
    bio: z.string().optional().nullable().default(""),
    email: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    twitter: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    portrait: z.string().optional().nullable(),
  }),
});

// ─────────────────────────────────────────────────────────────────────
// PRODUCTS — non-tobacco only (accessories, branded merch, digital goods).
// Snipcart reads these via their HTML JSON crawler, so the schema must
// include Snipcart's required attributes when rendered.
// ─────────────────────────────────────────────────────────────────────
const products = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      // Identity
      name: z.string(),
      slug: z.string(),
      sku: z.string(),                    // Snipcart's data-item-id
      excerpt: z.string().optional().nullable(),
      // Pricing
      price: z.number(),                  // USD
      compareAtPrice: z.number().optional().nullable(),
      currency: z.string().default("USD"),
      // Type — drives fulfillment / shipping
      type: z.enum(["digital", "merch", "accessory"]).default("accessory"),
      // Imagery
      cover: z.union([image(), z.string()]),
      gallery: z.array(z.union([image(), z.string()])).optional(),
      // Categorization
      category: z.string().optional().nullable(),
      featured: z.boolean().default(false),
      // Inventory / shipping
      inStock: z.boolean().default(true),
      requiresShipping: z.boolean().default(true),
      weight: z.number().optional(),       // grams (for shipping calc)
      // Variants (e.g. tee size — Snipcart custom field)
      variants: z
        .array(
          z.object({
            name: z.string(),
            options: z.array(z.string()),
            priceModifiers: z.record(z.number()).optional(),
          })
        )
        .optional(),
      // Digital download (for type: digital)
      downloadUrl: z.string().optional().nullable(),
      // Affiliate / drop-ship metadata (internal — never shown publicly)
      supplier: z.string().optional().nullable(),
      supplierUrl: z.string().optional().nullable(),
      // Publication state
      publishedAt: z.coerce.date(),
      isArchived: z.boolean().default(false),
      // SEO
      seo: z
        .object({
          metaTitle: z.string().optional().nullable(),
          metaDescription: z.string().optional().nullable(),
        })
        .optional(),
    }),
});

export const collections = { blog, categories, authors, products };
