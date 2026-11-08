// Gift-season window for the Amazon Prime free-trial note on buying guides.
// Judged at build time: the first build after PRIME_UNTIL drops the note.
export const PRIME_FROM = new Date("2026-11-01T00:00:00Z");
export const PRIME_UNTIL = new Date("2026-12-20T00:00:00Z");
export const isPrimeSeason = (now = Date.now()) => now >= PRIME_FROM.getTime() && now < PRIME_UNTIL.getTime();
