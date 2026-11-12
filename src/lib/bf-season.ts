// Black Friday window for the price-watch box on accessory buying guides.
// Judged at build time: the first build after BF_UNTIL drops the box.
export const BF_FROM = new Date("2026-11-12T00:00:00Z");
export const BF_UNTIL = new Date("2026-12-02T00:00:00Z");
export const isBfSeason = (now = Date.now()) => now >= BF_FROM.getTime() && now < BF_UNTIL.getTime();
