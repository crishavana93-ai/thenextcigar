-- 035 · "Light up": a check-in says what you are smoking, not only where.
-- Free text so a member can name anything (a Regional, a non-Cuban, a
-- cigar we don't track); the app offers the board's 52 vitolas and the
-- member's own humidor as suggestions. Drink is optional and also free text.
alter table public.checkins
  add column if not exists cigar text check (char_length(cigar) <= 80),
  add column if not exists drink text check (char_length(drink) <= 60);

comment on column public.checkins.cigar is 'What the member is lighting — free text, ≤80 chars (Light up, Sep 2026).';
comment on column public.checkins.drink is 'Optional pairing — free text, ≤60 chars.';
