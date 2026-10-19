/**
 * Masthead config — controls what Volume/Issue/Date appears across
 * every newspaper-styled page (NewspaperMasthead component).
 *
 * Computed from the build date (see below). All pages update.
 *
 * Convention:
 *   Volume · roughly a year of issues (Vol I = 2025, Vol II = 2026...)
 *   Issue  · sequential release number within that volume
 *   Date   · month + year of this issue (what the paper is "dated")
 *   Cover  · optional short kicker for what the flagship story is
 */

// Computed at build time so the masthead never goes stale between manual
// releases (it read "September 2026" well into October). Convention kept:
// Vol I = 2025, Vol II = 2026; issue = month number; date = month + year,
// in Stockholm time.
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const now = new Date();
const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", year: "numeric", month: "long" }).formatToParts(now);
const monthName = parts.find((p) => p.type === "month")?.value ?? "";
const year = Number(parts.find((p) => p.type === "year")?.value ?? now.getFullYear());
const monthNum = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Stockholm", month: "numeric" }).format(now));

export const MASTHEAD = {
  volume: `Vol. ${ROMAN[year - 2024] ?? String(year - 2024)}`,
  issue: `Issue ${String(monthNum).padStart(2, "0")}`,
  date: `${monthName} ${year}`,
  cover: "The price of a Cohiba, 1998 to 2026",
} as const;
