/** Viator Partner Program. Fill VIATOR_PID (e.g. "P00123456") and VIATOR_MCID
 *  from the Viator partner dashboard to switch the "Things to do" box on the
 *  lounge city pages on. While empty, nothing renders.
 *  Terms seen 5 Nov 2026: 8% commission on bookings within 30 days of the click
 *  (partnerresources.viator.com). Links go to general city experiences only,
 *  never tobacco tours, to stay clear of tobacco-marketing rules. */
/** Partner ID for thenextcigar.com (account created 6 Nov 2026, verification
 *  pending until Cris's residency card arrives). Flip VIATOR_ENABLED once verified. */
export const VIATOR_ENABLED = false;
const PARTNER_ID = "P00330244";
export const VIATOR_PID = VIATOR_ENABLED ? PARTNER_ID : "";
export const VIATOR_MCID = "42383";

export function viatorSearch(text: string): string {
  const u = new URL("https://www.viator.com/searchResults/all");
  u.searchParams.set("text", text);
  u.searchParams.set("pid", VIATOR_PID);
  u.searchParams.set("mcid", VIATOR_MCID);
  u.searchParams.set("medium", "link");
  return u.toString();
}
