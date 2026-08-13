// Cloudflare Pages Function — POST /api/shop/webhook
// ---------------------------------------------------------------------------
// Receives Stripe webhook events (checkout.session.completed) and:
//   1. Verifies the signature against STRIPE_WEBHOOK_SECRET
//   2. Retrieves the full session (with shipping_details) from Stripe
//   3. Writes a shop_orders row via Supabase service_role
//   4. Emails Cris the order + shipping address (to forward to supplier)
//   5. Emails the customer a confirmation ("order received")
//
// Configure in Stripe Dashboard → Developers → Webhooks:
//   Endpoint URL   https://thenextcigar.com/api/shop/webhook
//   Events         checkout.session.completed
//   Copy the "Signing secret" (whsec_...) into Cloudflare env as STRIPE_WEBHOOK_SECRET
//
// Env vars required:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY
//   ORDER_NOTIFY_EMAIL           (defaults to guatabeycigars@gmail.com)
//   ALERT_FROM_EMAIL             (from-address, defaults to orders@thenextcigar.com)

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  ORDER_NOTIFY_EMAIL?: string;
  ALERT_FROM_EMAIL?: string;
}

// ── Stripe signature verification (native crypto, no library) ──
// Stripe signs the raw request body with HMAC-SHA256 using the endpoint
// secret. We recompute the HMAC and compare in constant time.
async function verifyStripeSig(
  payload: string,
  header: string,
  secret: string
): Promise<boolean> {
  const parts = header.split(",").reduce<Record<string, string>>((acc, seg) => {
    const [k, v] = seg.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const ts = parts["t"];
  const sig = parts["v1"];
  if (!ts || !sig) return false;

  const signedPayload = `${ts}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expected = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}

// ── Small helpers ──
async function stripeGet(env: Env, path: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const data = (await res.json()) as any;
  if (!res.ok) throw new Error(`Stripe GET ${path}: ${data?.error?.message || res.status}`);
  return data;
}

async function supaInsert(env: Env, table: string, row: Record<string, any>) {
  const res = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase insert ${table}: ${res.status} ${t}`);
  }
  return res.json();
}

async function sendEmail(env: Env, to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY) return;
  const from = env.ALERT_FROM_EMAIL || "The Next Cigar Orders <orders@thenextcigar.com>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  }).catch(() => {}); // best-effort — order write already succeeded
}

// ── Handler ──
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sigHeader = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!sigHeader || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or secret", { status: 400 });
  }

  const valid = await verifyStripeSig(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // We only act on completed checkout sessions. Ignore everything else.
  if (event.type !== "checkout.session.completed") {
    return new Response("Ignored", { status: 200 });
  }

  try {
    const session = event.data.object;
    // Re-fetch with expand to be sure we have shipping_details + line items
    const full = await stripeGet(
      env,
      `checkout/sessions/${session.id}?expand[]=line_items&expand[]=customer_details&expand[]=shipping_details`
    );

    const meta = full.metadata || {};
    const shipping = full.shipping_details || full.customer_details || {};
    const address = shipping.address || {};
    const customer = full.customer_details || {};

    const row = {
      stripe_session_id:    full.id,
      stripe_payment_intent: full.payment_intent || null,
      product_slug:         meta.product_slug || "unknown",
      product_name:         meta.product_name || full.line_items?.data?.[0]?.description || "Unknown product",
      product_sku:          meta.product_sku || null,
      quantity:             full.line_items?.data?.[0]?.quantity || 1,
      supplier:             meta.supplier || null,
      supplier_url:         meta.supplier_url || null,
      amount:               (full.amount_total || 0) / 100,
      currency:             (full.currency || "usd").toUpperCase(),
      customer_email:       customer.email || full.customer_email || "unknown",
      customer_name:        customer.name || shipping.name || null,
      shipping_name:        shipping.name || null,
      shipping_line1:       address.line1 || null,
      shipping_line2:       address.line2 || null,
      shipping_city:        address.city || null,
      shipping_state:       address.state || null,
      shipping_postal:      address.postal_code || null,
      shipping_country:     address.country || null,
      shipping_phone:       customer.phone || null,
      status:               "paid",
    };

    await supaInsert(env, "shop_orders", row);

    // ── Notify Cris to forward the order ──
    const notifyTo = env.ORDER_NOTIFY_EMAIL || "guatabeycigars@gmail.com";
    const orderSummary = `
      <h2>New order — ${row.product_name}</h2>
      <p><strong>Amount:</strong> ${row.amount.toFixed(2)} ${row.currency}<br/>
      <strong>Quantity:</strong> ${row.quantity}<br/>
      <strong>SKU:</strong> ${row.product_sku || "—"}<br/>
      <strong>Supplier:</strong> ${row.supplier || "—"}<br/>
      ${row.supplier_url ? `<strong>Supplier URL:</strong> <a href="${row.supplier_url}">${row.supplier_url}</a><br/>` : ""}
      </p>
      <h3>Ship to</h3>
      <p>
        ${row.shipping_name || row.customer_name || ""}<br/>
        ${row.shipping_line1 || ""}<br/>
        ${row.shipping_line2 ? row.shipping_line2 + "<br/>" : ""}
        ${row.shipping_postal || ""} ${row.shipping_city || ""}<br/>
        ${row.shipping_state ? row.shipping_state + "<br/>" : ""}
        ${row.shipping_country || ""}
      </p>
      <p><strong>Customer:</strong> ${row.customer_email}${row.shipping_phone ? " · " + row.shipping_phone : ""}</p>
      <hr/>
      <p style="color:#666;font-size:12px;">Session ${row.stripe_session_id} · <a href="https://dashboard.stripe.com/payments/${row.stripe_payment_intent}">Open in Stripe</a></p>
      <p style="color:#666;font-size:12px;">Forward this address to the supplier${row.supplier_url ? ` at ${row.supplier_url}` : ""}. Update the order row in Supabase → shop_orders → status='forwarded_to_supplier' + tracking_number when the supplier confirms.</p>
    `;
    await sendEmail(env, notifyTo, `[TNC Shop] New order · ${row.product_name} · ${row.amount.toFixed(2)} ${row.currency}`, orderSummary);

    // ── Confirmation to customer ──
    if (row.customer_email && row.customer_email !== "unknown") {
      const customerHtml = `
        <div style="font-family:Georgia,serif;max-width:520px;color:#1a120a;">
          <h2 style="font-weight:500;letter-spacing:-0.02em;">Order received. Thank you.</h2>
          <p>We got your order for <strong>${row.product_name}</strong> — ${row.amount.toFixed(2)} ${row.currency}. It's forwarded to our supplier in the next 24 hours; you'll get a shipping confirmation once the tracking number is live (usually 2–4 days).</p>
          <p>If you need to change the shipping address or cancel, reply to this email within 24 hours and we'll sort it before the supplier ships.</p>
          <p style="margin-top:32px;">— The Next Cigar<br/><a href="https://thenextcigar.com/">thenextcigar.com</a></p>
        </div>
      `;
      await sendEmail(
        env,
        row.customer_email,
        `Your Next Cigar order — ${row.product_name}`,
        customerHtml
      );
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    // Log to Cloudflare console. Return 500 so Stripe retries.
    console.error("[shop/webhook] error", err);
    return new Response(err instanceof Error ? err.message : "error", { status: 500 });
  }
};
