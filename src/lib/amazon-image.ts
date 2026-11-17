// Looks up the API-fetched Amazon image for an Amazon product URL.
// Data comes from scripts/amazon-images.mjs (rewritten on every build).
// `exp` is when the image must disappear (fetch time + 23 h), enforced in the
// browser by the inline script in the components (Associates policy (h)).
import data from "../data/amazon-images.json";

const MAX_AGE = 23 * 60 * 60 * 1000;
type Img = { url: string; w?: number; h?: number };
const items = (data as { fetchedAt: number; items: Record<string, Img> }).items || {};
const fetchedAt = (data as { fetchedAt: number }).fetchedAt || 0;

export function amzImage(url?: string): (Img & { exp: number }) | null {
  if (!url || !fetchedAt) return null;
  const m = url.match(/amazon\.com\/(?:[^\s"')]*\/)?dp\/([A-Z0-9]{10})/);
  const img = m ? items[m[1]] : undefined;
  return img ? { ...img, exp: fetchedAt + MAX_AGE } : null;
}

export const AMZ_EXPIRY_SCRIPT =
  "document.querySelectorAll('[data-amz-exp]').forEach(function(e){if(Date.now()>+e.getAttribute('data-amz-exp'))e.remove()})";
