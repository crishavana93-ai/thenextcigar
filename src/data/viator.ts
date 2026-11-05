/** Viator Partner Program. Fill VIATOR_PID (e.g. "P00123456") and VIATOR_MCID
 *  from the Viator partner dashboard to switch the "Things to do" box on the
 *  lounge city pages on. While empty, nothing renders.
 *  Terms seen 5 Nov 2026: 8% commission on bookings within 30 days of the click
 *  (partnerresources.viator.com). Links go to general city experiences only,
 *  never tobacco tours, to stay clear of tobacco-marketing rules. */
export const VIATOR_PID = "";
export const VIATOR_MCID = "42383";

export function viatorSearch(text: string): string {
  const u = new URL("https://www.viator.com/searchResults/all");
  u.searchParams.set("text", text);
  u.searchParams.set("pid", VIATOR_PID);
  u.searchParams.set("mcid", VIATOR_MCID);
  u.searchParams.set("medium", "link");
  return u.toString();
}
