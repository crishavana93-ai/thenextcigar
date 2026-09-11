/**
 * Remote cover images, at the size the slot actually needs.
 *
 * Most covers in the blog collection are Unsplash or Pexels URLs pinned at
 * w=1600. A 1600px file in a 592px column is roughly seven times the pixels
 * anybody sees, and on a phone it is the single slowest thing on the page —
 * it was costing the front page about twenty points of mobile performance.
 *
 * Both CDNs resize from a query parameter, so we can ask for the width we
 * want and hand the browser a srcset to choose from. Images we host go
 * through Astro's own pipeline and never reach these helpers.
 */

const WIDTHS = [480, 768, 1024, 1440];

function isRemote(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/** The same image at a given width, if the host understands the ask. */
export function sized(url: string, w: number): string {
  if (!isRemote(url)) return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("unsplash.com")) {
      u.searchParams.set("w", String(w));
      u.searchParams.set("auto", "format");
      u.searchParams.set("q", "78");
      return u.toString();
    }
    if (u.hostname.endsWith("pexels.com")) {
      u.searchParams.set("auto", "compress");
      u.searchParams.set("cs", "tinysrgb");
      u.searchParams.set("w", String(w));
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

/** A srcset across the usual breakpoints, or undefined for an image we host. */
export function srcsetFor(url: string | undefined, widths: number[] = WIDTHS): string | undefined {
  if (!url || !isRemote(url)) return undefined;
  const first = sized(url, widths[0]);
  if (first === url) return undefined;          // host we don't know how to resize
  return widths.map((w) => `${sized(url, w)} ${w}w`).join(", ");
}

/** The src to pair with a srcset: a middling width, never the 1600px original. */
export function srcFor(url: string | undefined, fallbackWidth = 1024): string | undefined {
  return url ? sized(url, fallbackWidth) : undefined;
}
