# Shop Setup — Snipcart cart, 3 starter SKUs

The Astro side of the shop is done. To go live, you need a Snipcart account (free, no monthly fee, 2% per transaction) and product images.

---

## Step 1 — Sign up for Snipcart (3 min)

1. Go to **https://snipcart.com/** → click **Get started** (top right)
2. Sign up with `guatabeycigars@gmail.com`
3. Choose the **Free** plan during signup (it's just transaction fees, no monthly)
4. Verify your email

After signing up, you land in your Snipcart dashboard.

## Step 2 — Get your public API key (1 min)

1. In Snipcart dashboard → **Account** (top right) → **API Keys**
2. Copy the **Public API Key** (starts with `MTAyM...` or similar — it's a base64-encoded ID, safe to commit publicly)
3. Note: there's a **Secret API Key** too. **Don't expose that one** — it's not needed for the storefront.

## Step 3 — Add the API key to Cloudflare Pages env vars (2 min)

1. https://dash.cloudflare.com → **Workers & Pages** → click `thenextcigar`
2. **Settings** tab → scroll to **Environment variables** → **Production**
3. Click **Add variable**:
   - Variable name: `PUBLIC_SNIPCART_API_KEY`
   - Value: (paste your public key from Step 2)
   - Type: Plaintext
4. **Save** → trigger a redeploy from the Deployments tab so the env var is picked up

## Step 4 — Add product images

The 3 starter products reference these image paths in MDX:

```
src/content/products/images/
├── logo-tee-front.jpg                          (1000×1000 product photo)
├── logo-tee-back.jpg                           (1000×1000 product photo)
├── cuban-authentication-cover.jpg              (PDF cover, 800×1100)
├── cuban-authentication-spread-1.jpg           (PDF interior spread, 1600×1200)
├── cuban-authentication-spread-2.jpg           (PDF interior spread, 1600×1200)
├── stainless-cutter.jpg                        (cutter on neutral background, 1000×1000)
├── stainless-cutter-detail.jpg                 (close-up of blades, 1000×1000)
└── stainless-cutter-in-use.jpg                 (cutter cutting a cigar, 1000×1000)
```

**Sources:**

- **Logo tee** — Printful auto-generates mockup images when you upload your logo. Sign up at https://www.printful.com → upload logo.svg → pick the t-shirt blank you want → Printful gives you front/back mockups → save them with the filenames above into `src/content/products/images/`
- **Cuban PDF cover** — design in Canva or Figma, 8.5×11 PDF dimensions, save the cover image as a JPG. Spreads can be screenshots of two-page spreads from the PDF.
- **Cigar cutter** — get product photos from the supplier. Phillips & King provides product photography for accounts in good standing. Or buy one yourself, photograph it on a clean background, and use those.

If you don't have images ready, **leave the placeholder paths in MDX**. The page will show "image not found" warnings during dev but won't break — just commit the images later and they appear.

## Step 5 — Test cart locally

After steps 1-3, push:

```bash
cd "/Users/cristianortizsuarez/Documents/Claude/Projects/Guatabey/thenextcigar"
git add -A
git commit -m "Snipcart shop: BaseLayout integration, 3 starter SKUs, /shop, /shop/[slug]"
git push
```

After Cloudflare rebuilds (~2 min), test:

1. Open https://thenextcigar.com/shop/
2. Click **Stainless Steel Guillotine Cutter**
3. Click **Add to cart**
4. The Snipcart side panel slides in showing the cart
5. Click **Checkout** to see the full checkout experience
6. (Don't actually pay — just verify it works)

## Step 6 — Configure Snipcart settings

In Snipcart dashboard:

### Domains
- **Settings** → **Domains** → add `thenextcigar.com` (and `www.thenextcigar.com`)
- This whitelists your site so the cart can charge real cards

### Payment gateway
- **Settings** → **Payment gateways** → connect Stripe
- Stripe works for accessories and merch (non-tobacco). Apple Pay and Google Pay come along free
- Keep test mode ON until you've done end-to-end test orders, then flip live

### Shipping
- **Settings** → **Shipping** → set up the rules:
  - **Free shipping over $75** (good incentive for buying multiple items)
  - **US flat rate $6** (covers USPS Ground Advantage for accessories)
  - **International flat rate $20** (international customers happen)
  - **Digital products** — automatically skip shipping (we set `requiresShipping: false` in the MDX)
- Or for the cutter specifically, you can set per-product shipping rules later

### Taxes
- **Settings** → **Taxes** → enable automatic US sales tax via Stripe Tax (Stripe handles state-by-state tax compliance for $1/order)
- Or set a flat tax rate manually

### Notifications
- **Settings** → **Notifications** → set the from-name to "TNext Cigar Shop" and from-email to `contact@thenextcigar.com`

### Customer accounts
- **Settings** → **Customer accounts** → enable so buyers can re-download digital products
- This lets the Cuban PDF be re-downloaded without you doing customer support

## Step 7 — For the Cuban PDF specifically

Right now the MDX references `downloadUrl: https://thenextcigar.com/downloads/cuban-cigar-authentication-guide.pdf`. To make that work:

1. Once the PDF is written and exported, save it to `public/downloads/cuban-cigar-authentication-guide.pdf`
2. Snipcart's **Settings** → **Customer accounts** → **Digital products** — enable secure downloads (requires customer login)
3. In your product MDX, change `downloadUrl` to a Snipcart-protected URL — Snipcart docs walk through this

For launch, a simpler approach: just put the PDF on a private S3 / Cloudflare R2 bucket and email it manually for the first dozen sales. Automate later when volume justifies it.

## Step 8 — Adding more products

To add a new SKU:

1. Create `src/content/products/<slug>.mdx`
2. Use one of the 3 existing files as a template
3. Drop product images in `src/content/products/images/`
4. Push — auto-rebuilds, appears at `/shop/<slug>/` and on the `/shop` index

OR (after you've fully set up the CMS at app.pagescms.org):

1. In Pages CMS → **Configuration** → add a new collection for products
2. Edit `.pages.yml` to include the products schema (similar to how `blog` is set up)
3. Then you can create products in the Pages CMS UI like you create articles

## Common questions

**Why 2% Snipcart fee + Stripe's 2.9% + 30¢?**
That's still cheaper than Shopify Basic ($39/mo + 2.9% + 30¢) at any volume below ~30 orders/month. Once you cross that volume, switch to Shopify Lite ($5/mo) and use Buy Buttons or migrate fully.

**Can I sell cigars too?**
**No.** Snipcart uses Stripe under the hood, and Stripe prohibits tobacco. The shop is non-tobacco only. Cigars stay affiliate-only (Famous Smoke / JR Cigar / etc. — we link, you earn commission, they handle the regulated transaction).

**What if a product is out of stock?**
Edit the MDX, change `inStock: false`, push. The "Add to cart" button automatically becomes "Sold out" and is disabled.

**Refunds, customer support?**
Snipcart dashboard → **Orders** → click an order → **Refund**. For drop-shipped items (cutter), check your supplier's return policy first.

---

When you've done Steps 1-3 and have the API key plugged in, ping me and we'll test end-to-end. Then your three sales channels are LIVE in parallel:

1. **Newsletter** (Beehiiv) — capturing audience
2. **Affiliates** — when articles link to retailers, you earn commission
3. **Shop** — direct sales of accessories + merch + digital
