-- ============================================================================
-- The Lounge — flavor profile fields (Phase 3)
-- ============================================================================
-- Adds three structured fields to public.profiles so members can declare what
-- they actually smoke. Used by the member detail page to compute "flavor
-- overlap" signal strip lozenges (e.g. "You both love Davidoff", "You both
-- prefer full-bodied Cubans with leather notes").
--
-- Why arrays instead of a junction table? Cardinality is tiny — a member
-- typically picks 3–6 favorite brands and 3–5 flavor notes. Postgres text[]
-- with GIN indexes is faster + simpler than two extra tables + joins.
-- ============================================================================

alter table public.profiles
  add column if not exists favorite_brands text[] default '{}'::text[],
  add column if not exists flavor_notes text[] default '{}'::text[],
  add column if not exists strength_preference text check (
    strength_preference in ('mild', 'medium', 'full', 'extra_full') or strength_preference is null
  );

-- GIN indexes so array-overlap operators (`&&`) stay fast as the cohort grows.
create index if not exists profiles_favorite_brands_idx
  on public.profiles using gin (favorite_brands);
create index if not exists profiles_flavor_notes_idx
  on public.profiles using gin (flavor_notes);

comment on column public.profiles.favorite_brands is
  'Multi-select from a curated brand list. Empty array = unspecified.';
comment on column public.profiles.flavor_notes is
  'Multi-select flavor descriptors (earthy, creamy, spicy, etc.). Empty array = unspecified.';
comment on column public.profiles.strength_preference is
  'Single value: mild | medium | full | extra_full. NULL = unspecified.';
