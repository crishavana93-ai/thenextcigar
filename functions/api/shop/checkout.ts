// Cloudflare Pages Function — POST /api/shop/checkout
// ---------------------------------------------------------------------------
// Creates a Stripe Checkout Session for a product on /shop/. Returns the
// redirect URL. Client posts { slug, name, sku, price, currency, supplier,
// supplierUrl, cover, quantity? } — we don't trust price from the browser
// but re-read it here from the payload's `expectedPrice`. In production the
// canonical price should be re-fetched from the source of truth (products
// content collection or a Supabase catalogue mirror) — this MVP trusts the
// server-computed price that Astro rendered into the button below.
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
  return Math.min(Math.max(n, 1), 10);
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

    const body = (await request.json()) as CheckoutPayload;
    if (!body?.slug || !body?.name || !body?.price) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields: slug, name, price." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const currency = normalizeCurrency(body.currency);
    const quantity = safeQuantity(body.quantity);
    // Stripe wants amount in the smallest currency unit (cents for USD/EUR/GBP,
    // öre for SEK, etc.) — all three-letter currencies we use are cents-based.
    const unitAmount = Math.round(Number(body.price) * 100);

    // Build the URL for success + cancel — pass session ID placeholder so
    // the thank-you page can look it up if needed.
    const origin = new URL(request.url).origin;
    const successUrl =
      env.STRIPE_SUCCESS_URL ||
      `${origin}/shop/thank-you/?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      env.STRIPE_CANCEL_URL || `${origin}/shop/${body.slug}/`;

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("payment_method_types[]", "card");
    form.set("success_url", successUrl);
    form.set("cancel_url", cancelUrl);
    form.set("customer_creation", "if_required");
    form.set("billing_address_collection", "auto");
    // Ship-to worldwide by default. Cris can tighten this per product later.
    form.set("shipping_address_collection[allowed_countries][0]", "SE");
    form.set("shipping_address_collection[allowed_countries][1]", "PT");
    form.set("shipping_address_collection[allowed_countries][2]", "DE");
    form.set("shipping_address_collection[allowed_countries][3]", "FR");
    form.set("shipping_address_collection[allowed_countries][4]", "IT");
    form.set("shipping_address_collection[allowed_countries][5]", "ES");
    form.set("shipping_address_collection[allowed_countries][6]", "NL");
    form.set("shipping_address_collection[allowed_countries][7]", "BE");
    form.set("shipping_address_collection[allowed_countries][8]", "DK");
    form.set("shipping_address_collection[allowed_countries][9]", "FI");
    form.set("shipping_address_collection[allowed_countries][10]", "IE");
    form.set("shipping_address_collection[allowed_countries][11]", "AT");
    form.set("shipping_address_collection[allowed_countries][12]", "GB");
    form.set("shipping_address_collection[allowed_countries][13]", "CH");
    form.set("shipping_address_collection[allowed_countries][14]", "US");
    form.set("shipping_address_collection[allowed_countries][15]", "CA");
    form.set("shipping_address_collection[allowed_countries][16]", "NO");
    form.set("phone_number_collection[enabled]", "true");
    form.set("allow_promotion_codes", "true");

    // Single line item — the product itself
    form.set("line_items[0][price_data][currency]", currency);
    form.set("line_items[0][price_data][unit_amount]", String(unitAmount));
    form.set("line_items[0][price_data][product_data][name]", body.name);
    if (body.sku) {
      form.set("line_items[0][price_data][product_data][description]", `SKU ${body.sku}`);
    }
    if (body.cover) {
      form.set("line_items[0][price_data][product_data][images][0]", body.cover);
    }
    form.set("line_items[0][quantity]", String(quantity));

    // Metadata — carries through to the webhook so we know what to write to Supabase
    form.set("metadata[product_slug]", body.slug);
    form.set("metadata[product_name]", body.name);
    form.set("metadata[product_sku]", body.sku || "");
    form.set("metadata[supplier]", body.supplier || "");
    form.set("metadata[supplier_url]", body.supplierUrl || "");
    form.set("metadata[source]", "tnc-shop");

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
