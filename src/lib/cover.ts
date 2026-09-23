/**
 * One helper for every cover image, hosted or remote.
 *
 * Hosted covers (src/assets/blog/…) used to be printed as `cover.src`: the
 * original file, often a 1–2 MB PNG, in a 600px column. That was the whole
 * mobile LCP problem on the front page (4.9 s, Sept 2026). They now go
 * through Astro's image pipeline: WebP at the widths the slot needs, with a
 * srcset. Remote covers (Unsplash, Pexels) keep the URL-resize trick from
 * img.ts. Either way the page gets {src, srcset} and picks a `sizes`.
 */
import { getImage } from "astro:assets";
import { srcFor, srcsetFor } from "./img";

export interface CoverSet { src: string; srcset?: string; width?: number; height?: number }

const DEFAULT_WIDTHS = [480, 768, 1024, 1440];

export async function coverSet(cover: unknown, widths: number[] = DEFAULT_WIDTHS, fallbackWidth = 1024): Promise<CoverSet | undefined> {
  if (!cover) return undefined;
  if (typeof cover === "string") {
    const src = srcFor(cover, fallbackWidth);
    return src ? { src, srcset: srcsetFor(cover, widths) } : undefined;
  }
  const meta = cover as { src: string; width?: number; height?: number; format?: string };
  if (!meta.src) return undefined;
  try {
    const ws = widths.filter((w) => !meta.width || w <= meta.width);
    if (meta.width && !ws.includes(meta.width) && ws.length < widths.length) ws.push(meta.width);
    const img = await getImage({ src: meta as any, widths: ws.length ? ws : undefined, width: Math.min(fallbackWidth, meta.width ?? fallbackWidth), format: "webp", quality: 78 });
    return { src: img.src, srcset: img.srcSet?.attribute || undefined, width: img.attributes.width, height: img.attributes.height };
  } catch {
    return { src: meta.src };
  }
}
