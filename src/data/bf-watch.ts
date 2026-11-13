// Black Friday price watch: the state shown in <BfWatch /> on accessory guides.
// Update at every price check, together with the table on
// /blog/black-friday-cigar-accessory-deals-2026/.
// No prices: Amazon's Associates policy allows only prices Amazon serves or that
// come live from its API, so `deals` stays empty.
export interface BfDeal { name: string; url: string; before: string; now: string }
export const BF_WATCH: { checked: string; summary: string; deals: BfDeal[] } = {
  checked: "12 November 2026",
  summary:
    "a crossed-out price on Amazon isn't always a real discount. Black Friday is 27 November: note the price in the week before, then compare on the day.",
  deals: [],
};
