# Writing a shop article — the mechanics

Everything the plan in `seo-content-plan-2026-09-17.md` needs from the repo, in one page.

## The product box

Import once at the top of the `.mdx`, after the frontmatter:

```
import ProductBox from "../../components/shop/ProductBox.astro";
```

Answer box, right after the paragraph that solves the problem:

```
<ProductBox slug="cigarloong-3-jet-windproof-lighter" note="The one we lit in the wind test." />
```

End box, every product used, as a row:

```
<ProductBox slugs={["cigar-needle-and-rest-tool","double-blade-cigar-cutter-tnc"]} title="What we used in this article" />
```

Name, photo and price come from the product entry at build time; Add to cart works in place and records which article it came from. A product that is archived or not in stock shows "See the product" instead of a button, so an old article never sells something we no longer carry.

## The FAQ

End the article with a section headed `## Questions` and two to five `### question` sub-headings, one paragraph each. The build turns that into FAQPage structured data automatically (fixed 17 Sept 2026; it had never fired before). Write the questions the way people type them.

## The rest

- 900–1,400 words. Answer the query in the first 150 words, then explain.
- `excerpt` is the meta description: one sentence, the answer, under 160 characters.
- `relatedSkus` in the frontmatter still drives the "related cigars" sidebar for cigar articles; leave it empty on accessory pieces.
- Photos we took: `src/assets/blog/<slug>/` and reference them relatively. The maker's photos stay on the product page, not in the article.
- Nothing publishes about a product before the sample has been held.

## Merchant Center

Feeds: `/shop/feed/se.xml` (SEK), `/shop/feed/de.xml` (EUR), `/shop/feed/gb.xml` (GBP), `/shop/feed/us.xml` (USD). Prices are the charged amounts from `functions/api/shop/pricing.ts`, the same figures shown on the product page under the price and in its structured data, so Google's price check passes. In Merchant Center: Products → Add products → Add products from a file → scheduled fetch, one feed per target country, daily. Shipping: free, 7–14 days; returns: 14 days, linked to /shipping-and-returns/.
