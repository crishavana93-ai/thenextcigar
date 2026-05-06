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
      cover: image().optional().nullable(),
      thumbnail: image().optional().nullable(),
      featured: z.boolean().default(false),
      sidebarFeatured: z.boolean().default(false),
      isPremium: z.boolean().default(false),
      sourceId: z.string().optional(),
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

export const collections = { blog, categories, authors };
