-- ============================================================================
-- The Lounge — allow null coordinates on partner_lounges (migration 020)
-- ============================================================================
-- Bug fix: convert_submission_to_lounge() RPC inserts a partner_lounges row
-- with NULL lat/lng (the community submission contains only address, no
-- coordinates). The lat/lng columns were declared NOT NULL in the original
-- schema, so the insert fails with:
--   "null value in column 'lat' of relation 'partner_lounges' violates
--    not-null constraint"
--
-- Effect: admin can't approve community submissions, the whole feature dead.
--
-- Fix: drop NOT NULL on lat and lng. This is safe because:
--   1. The map markers code already filters out venues with null coords
--      (added in migration 008 / NaN-fix work)
--   2. The convert RPC marks new venues as unverified (verified_at = null),
--      so they don't render on the public map until admin geocodes them
--   3. The Venues admin tab edit form has lat/lng fields for adding coords
--      once the admin has copy-pasted them from Google Maps
-- ============================================================================

alter table public.partner_lounges
  alter column lat drop not null;

alter table public.partner_lounges
  alter column lng drop not null;

-- Optional: add a CHECK constraint that if EITHER lat or lng is set, BOTH
-- must be — prevents the half-coords state. Soft-enforced; rows with both
-- null are still allowed (the pending-geocode state).
alter table public.partner_lounges
  drop constraint if exists partner_lounges_coords_both_or_neither;

alter table public.partner_lounges
  add constraint partner_lounges_coords_both_or_neither
  check (
    (lat is null and lng is null)
    or (lat is not null and lng is not null)
  );
