-- ============================================================================
-- The Lounge — venue photos (migration 011)
-- ============================================================================
-- Adds photo_url to partner_lounges so map pins can render a circular venue
-- photo instead of the generic type glyph. Falls back to the glyph when null.
-- Photo URLs can be:
--   • a venue's own hero image scraped/manually-curated
--   • Google Maps Static Streetview link (paid API, future)
--   • a stock cigar image for venues without a photo (avoid — looks generic)
--
-- Seeding: do this incrementally for the top ~50 venues you care about. The
-- rest gracefully fall back to the glyph pin.
-- ============================================================================

alter table public.partner_lounges
  add column if not exists photo_url text;

comment on column public.partner_lounges.photo_url is
  'Optional square venue photo (recommend 200x200 webp/jpg). Null = use type glyph.';

-- Optional: pre-seed photo URLs for a handful of marquee venues. These point at
-- publicly-hosted images. If any 404 later, the pin falls back to the glyph.
update public.partner_lounges set photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=200&h=200&fit=crop' where slug = 'lcdh-london' and photo_url is null;
update public.partner_lounges set photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=200&h=200&fit=crop' where slug = 'sautter-cigars-london' and photo_url is null;
update public.partner_lounges set photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=200&h=200&fit=crop' where slug = 'davidoff-madison' and photo_url is null;
update public.partner_lounges set photo_url = 'https://images.unsplash.com/photo-1606140755127-09d8d7b8efa2?w=200&h=200&fit=crop' where slug = 'el-floridita-havana' and photo_url is null;
update public.partner_lounges set photo_url = 'https://images.unsplash.com/photo-1554587297-c30e3e6bd2c1?w=200&h=200&fit=crop' where slug = 'iwan-ries' and photo_url is null;
