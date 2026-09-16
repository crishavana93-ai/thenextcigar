// Cloudflare Pages Function — POST /api/shop/checkout
// ---------------------------------------------------------------------------
// Creates a Stripe Checkout Session for a product on /shop/. Returns the
// redirect URL. Client posts { slug, quantity?, cover? } (older clients also
// send name/price/etc — ignored). Price, name, SKU, supplier and availability
// are read from catalogue.json, generated at build time from the products
// content collection by scripts/build-catalogue.mjs. Nothing money-related is
// trusted from the browser.
import { discountPct } from "./pricing";
import catalogue from "./catalogue.json";
//
// Env vars required in Cloudflare Pages → Settings → Environment variables:
//   STRIPE_SECRET_KEY              — sk_live_...  or  sk_test_...
//   STRIPE_SUCCESS_URL             — e.g. https://thenextcigar.com/shop/thank-you/
//   STRIPE_CANCEL_URL              — e.g. https://thenextcigar.com/shop/
//   (webhook secret is used in webhook.ts, not here)

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
}

interface CheckoutPayload {
  slug: string;
  name: string;
  sku?: string;
  price: number;
  currency?: string;
  supplier?: string;
  supplierUrl?: string;
  cover?: string;
  quantity?: number;
}

// Stripe currency codes are lowercase 3-letter ISO. USD → usd.
function normalizeCurrency(c?: string): string {
  return (c || "usd").toLowerCase().slice(0, 3);
}

// Minimum quantity for cigar accessories — most suppliers have MOQ of 1.
function safeQuantity(q?: number): number {
  const n = Math.floor(Number(q || 1));
  return Math.min(Math.max(n, 1), 6);
}

async function callStripe(env: Env, path: string, form: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = (await res.json()) as any;
  if (!res.ok) {
    throw new Error(`Stripe error: ${data?.error?.message || res.status}`);
  }
  return data;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: "Stripe not configured — missing STRIPE_SECRET_KEY env var." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const raw = (await request.json()) as any;
    // Accept a cart ({ items: [{ slug, quantity }] }) or the older single
    // product ({ slug, quantity }). Everything priced comes from the catalogue.
    const reqItems: { slug: string; quantity?: number }[] = Array.isArray(raw?.items) && raw.items.length
      ? raw.items.slice(0, 20)
      : raw?.slug ? [{ slug: raw.slug, quantity: raw.quantity }] : [];
    const cat = catalogue as Record<string, any>;
    const lines: { slug: string; item: any; qty: number }[] = [];
    for (const r of reqItems) {
      const item = r?.slug ? cat[r.slug] : undefined;
      if (!item) return new Response(JSON.stringify({ ok: false, error: "Unknown product." }), { status: 400, headers: { "content-type": "application/json" } });
      if (item.isArchived || item.comingSoon || !item.inStock) return new Response(JSON.stringify({ ok: false, error: `${item.name} is not available to order.` }), { status: 409, headers: { "content-type": "application/json" } });
      const existing = lines.find((l) => l.slug === r.slug);
      if (existing) existing.qty = Math.min(existing.qty + safeQuantity(r.quantity), 6); else lines.push({ slug: r.slug, item, qty: safeQuantity(r.quantity) });
    }
    if (!lines.length) return new Response(JSON.stringify({ ok: false, error: "Nothing to buy." }), { status: 400, headers: { "content-type": "application/json" } });

    const currency = normalizeCurrency(lines[0].item.currency);
    // Quantity discount (pricing.ts) on the number of pieces in the whole
    // order, applied to every line: two pieces of anything earn it.
    const pieces = lines.reduce((n, l) => n + l.qty, 0);
    const discount = discountPct(pieces);

    const origin = new URL(request.url).origin;
    const successUrl = env.STRIPE_SUCCESS_URL || `${origin}/shop/thank-you/?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = env.STRIPE_CANCEL_URL || (lines.length === 1 ? `${origin}/shop/${lines[0].slug}/` : `${origin}/shop/cart/`);

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("payment_method_types[]", "card");
    form.set("success_url", successUrl);
    form.set("cancel_url", cancelUrl);
    form.set("customer_creation", "if_required");
    form.set("billing_address_collection", "auto");
    ["SE","PT","DE","FR","IT","ES","NL","BE","DK","FI","IE","AT","GB","CH","US","CA","NO"].forEach((c, i) => form.set(`shipping_address_collection[allowed_countries][${i}]`, c));
    form.set("phone_number_collection[enabled]", "true");
    // Stripe refuses allow_promotion_codes together with discounts[], so the
    // promo-code box only appears on orders that carry no quantity discount.
    if (discount) {
      const coupon = await callStripe(env, "coupons", new URLSearchParams({ percent_off: String(discount), duration: "once", name: `${discount}% off for ${pieces} pieces` }));
      form.set("discounts[0][coupon]", coupon.id);
    } else {
      form.set("allow_promotion_codes", "true");
    }

    lines.forEach((l, i) => {
      form.set(`line_items[${i}][price_data][currency]`, currency);
      form.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(Number(l.item.price) * 100)));
      form.set(`line_items[${i}][price_data][product_data][name]`, l.item.name);
      if (l.item.sku) form.set(`line_items[${i}][price_data][product_data][description]`, `SKU ${l.item.sku}`);
      form.set(`line_items[${i}][quantity]`, String(l.qty));
    });

    // Metadata — carries through to the webhook so we know what to write to Supabase
    form.set("metadata[product_slug]", lines.map((l) => l.slug).join(","));
    form.set("metadata[product_name]", lines.map((l) => (l.qty > 1 ? `${l.qty}× ` : "") + l.item.name).join(" + ").slice(0, 500));
    form.set("metadata[product_sku]", lines.map((l) => l.item.sku || "").join(",").slice(0, 500));
    form.set("metadata[supplier]", String(lines[0].item.supplier || "").slice(0, 500));
    form.set("metadata[supplier_url]", String(lines[0].item.supplierUrl || "").slice(0, 500));
    form.set("metadata[source]", "tnc-shop");
    form.set("metadata[discount_pct]", String(discount));
    form.set("metadata[pieces]", String(pieces));

    const session = await callStripe(env, "checkout/sessions", form);

    return new Response(
      JSON.stringify({ ok: true, url: session.url, sessionId: session.id }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};
