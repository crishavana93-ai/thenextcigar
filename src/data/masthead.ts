/**
 * Masthead config — controls what Volume/Issue/Date appears across
 * every newspaper-styled page (NewspaperMasthead component).
 *
 * Bump these manually when you release a new issue. All pages update.
 *
 * Convention:
 *   Volume · roughly a year of issues (Vol I = 2025, Vol II = 2026...)
 *   Issue  · sequential release number within that volume
 *   Date   · month + year of this issue (what the paper is "dated")
 *   Cover  · optional short kicker for what the flagship story is
 */

export const MASTHEAD = {
  volume: "Vol. II",
  issue: "Issue 08",
  date: "August 2026",
  cover: "The price of a Cohiba, 1998 to 2026",
} as const;
