/**
 * Public snapshot of the Lounge map — every venue in `partner_lounges`
 * (exported 15 Sep 2026) merged with the curated list in cigar-places.ts.
 * Read-only: the public /lounge/map/ page and the counts on /lounge/ and
 * /lounge/download/ come from here, so a stranger sees the same map a
 * member does, minus the members. Re-export the JSON when venues change.
 */
import raw from "./lounge-venues.json";
import { places as curated } from "./cigar-places";

export interface Venue {
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  lat: number;
  lng: number;
  type: "lounge" | "retailer" | "house" | "casadelhabano" | "pub" | "club";
  website: string | null;
}

const bySlug = new Map<string, Venue>();
for (const v of raw as Venue[]) {
  if (typeof v.lat !== "number" || typeof v.lng !== "number") continue;
  bySlug.set(v.slug, v);
}
for (const p of curated) {
  if (bySlug.has(p.slug)) continue;
  if (typeof (p as any).lat !== "number" || typeof (p as any).lng !== "number") continue;
  bySlug.set(p.slug, {
    slug: p.slug, name: p.name, city: p.city, country: p.country,
    address: (p as any).address ?? null, lat: (p as any).lat, lng: (p as any).lng,
    type: p.type as Venue["type"], website: (p as any).website ?? null,
  });
}

export const VENUES: Venue[] = [...bySlug.values()].sort(
  (a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
);
export const VENUE_CITIES = [...new Set(VENUES.map((v) => v.city))].sort();
export const VENUE_COUNTRIES = [...new Set(VENUES.map((v) => v.country))].sort();
export const TYPE_LABEL: Record<Venue["type"], string> = {
  casadelhabano: "Casa del Habano", lounge: "Lounge", retailer: "Shop", house: "Brand house", club: "Private club", pub: "Cigar-friendly bar",
};
