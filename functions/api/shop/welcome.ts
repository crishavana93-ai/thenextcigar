/**
 * POST /api/shop/welcome  { email, source? }
 * Issues one 10%-off-first-order promotion code per email address, stores it
 * in shop_welcome, and emails it. Idempotent: the same email gets the same
 * code back. The coupon (tnc-welcome-10) is created once in Stripe by id.
 * Env: STRIPE_SECRET_KEY, PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * RESEND_API_KEY, ALERT_FROM_EMAIL (optional).
 */
interface Env {
  STRIPE_SECRET_KEY: string;
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  ALERT_FROM_EMAIL?: string;
}
const COUPON = "tnc-welcome-10";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function stripe(env: Env, method: "GET" | "POST", path: string, form?: URLSearchParams) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method, headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) }, body: form?.toString(),
  });
  const d = (await r.json()) as any;
  return { ok: r.ok, d };
}
const sb = (env: Env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: any = {};
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  if (body.website) return json({ ok: true, code: null }); // honeypot
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return json({ ok: false, error: "That address does not look right." }, 400);
  const source = String(body.source || "").slice(0, 120);

  // Already issued? Return the same code.
  const ex = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/shop_welcome?email=eq.${encodeURIComponent(email)}&select=code`, { headers: sb(env) });
  if (ex.ok) { const rows = (await ex.json()) as { code: string }[]; if (rows[0]) return json({ ok: true, code: rows[0].code, again: true }); }

  // Coupon once, by id (Stripe returns resource_already_exists afterwards).
  const c = await stripe(env, "POST", "coupons", new URLSearchParams({ id: COUPON, percent_off: "10", duration: "once", name: "Welcome · 10% off your first piece" }));
  if (!c.ok && c.d?.error?.code !== "resource_already_exists") return json({ ok: false, error: "Could not create the code." }, 502);

  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(3))).map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
  const code = `WELCOME-${suffix}`;
  const p = await stripe(env, "POST", "promotion_codes", new URLSearchParams({
    coupon: COUPON, code, max_redemptions: "1", "restrictions[first_time_transaction]": "true", "metadata[email]": email, "metadata[source]": source,
  }));
  if (!p.ok) return json({ ok: false, error: "Could not create the code." }, 502);

  const ins = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/shop_welcome`, { method: "POST", headers: { ...sb(env), Prefer: "return=minimal" }, body: JSON.stringify({ email, code, promo_id: p.d.id, source }) });
  if (!ins.ok) console.error("[welcome] supabase", ins.status, await ins.text());

  if (env.RESEND_API_KEY) {
    const from = env.ALERT_FROM_EMAIL || "The Next Cigar <orders@thenextcigar.com>";
    const html = `<div style="font-family:Georgia,serif;font-size:17px;line-height:1.5;color:#151412;max-width:520px">
<p>Your code for the shop:</p>
<p style="font-size:28px;letter-spacing:.06em;font-family:Menlo,monospace;border:1px solid #151412;display:inline-block;padding:10px 16px">${code}</p>
<p>10% off your first piece. Type it in the promotion-code box at checkout. It works once, on one order, and does not combine with the two-piece discount — for two or more pieces the shop already takes 10 to 15% off the total.</p>
<p>Tracked post, duties and VAT paid, nothing at the door.</p>
<p><a href="https://thenextcigar.com/shop/" style="color:#7B2622">The shop →</a></p>
<p style="font-size:13px;color:#6A665E">You asked for this code on thenextcigar.com. No newsletter follows unless you join the Lounge.</p></div>`;
    fetch("https://api.resend.com/emails", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${env.RESEND_API_KEY}` }, body: JSON.stringify({ from, to: email, subject: `${code} — 10% off your first piece`, html }) })
      .then(async (r) => { if (!r.ok) console.error("[welcome] resend", r.status, await r.text()); }).catch((e) => console.error("[welcome] resend threw", String(e)));
  }
  return json({ ok: true, code });
};
