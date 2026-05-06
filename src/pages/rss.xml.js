import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
  );

  return rss({
    title: "The Next Cigar",
    description: "Modern stories for the cigar aficionado.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.publishedAt),
      description: post.data.excerpt || "",
      link: `/blog/${post.data.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
