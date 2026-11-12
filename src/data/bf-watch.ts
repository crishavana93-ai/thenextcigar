// Black Friday price watch: the state shown in <BfWatch /> on accessory guides.
// Update at every price check, together with the table on
// /blog/black-friday-cigar-accessory-deals-2026/.
// A product goes in `deals` only when Amazon's price is at least 5% below the
// price we recorded on 8 November 2026 (read from the product page, US dollars).
export interface BfDeal { name: string; url: string; before: string; now: string }
export const BF_WATCH: { checked: string; summary: string; deals: BfDeal[] } = {
  checked: "12 November 2026",
  summary:
    "no real Black Friday deals yet. Of the 22 accessories we recorded before the sale, 2 are a few cents cheaper, 2 cost more and 18 haven't moved. Black Friday is 27 November; we check again from 20 November.",
  deals: [],
};
