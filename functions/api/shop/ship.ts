// Cloudflare Pages Function — POST /api/shop/ship
// ---------------------------------------------------------------------------
// Marks an order shipped and emails the customer the tracking number.
// Body: { token, session_id, tracking, carrier?, url? }
// Env:  SHOP_ADMIN_TOKEN (shared secret typed into /admin/ship/), plus the
//       Supabase + Resend vars the webhook already uses.
interface Env {
  SHOP_ADMIN_TOKEN?: string;
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY?: string;
  ALERT_FROM_EMAIL?: string;
}
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json" } });
const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const b = (await request.json()) as any;
    if (!env.SHOP_ADMIN_TOKEN) return json({ ok: false, error: "SHOP_ADMIN_TOKEN is not set in Cloudflare." }, 500);
    if (!b?.token || b.token !== env.SHOP_ADMIN_TOKEN) return json({ ok: false, error: "Wrong token." }, 401);
    const sid = String(b.session_id || "").trim(), tracking = String(b.tracking || "").trim();
    const carrier = String(b.carrier || "").trim().slice(0, 60), url = String(b.url || "").trim().slice(0, 300);
    if (!sid || !tracking) return json({ ok: false, error: "Order id and tracking number are required." }, 400);

    const h = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" };
    const q = `${env.PUBLIC_SUPABASE_URL}/rest/v1/shop_orders?stripe_session_id=eq.${encodeURIComponent(sid)}`;
    const rows = (await (await fetch(q + "&select=*", { headers: h })).json()) as any[];
    const row = rows?.[0];
    if (!row) return json({ ok: false, error: "No order with that id." }, 404);

    const upd = await fetch(q, { method: "PATCH", headers: { ...h, Prefer: "return=representation" }, body: JSON.stringify({ status: "shipped", tracking_number: tracking, carrier: carrier || null, tracking_url: url || null, shipped_at: new Date().toISOString() }) });
    if (!upd.ok) return json({ ok: false, error: `Supabase: ${upd.status} ${await upd.text()}` }, 500);

    let emailed = false;
    if (env.RESEND_API_KEY && row.customer_email && row.customer_email !== "unknown") {
      const from = env.ALERT_FROM_EMAIL || "The Next Cigar Orders <orders@thenextcigar.com>";
      const link = url ? `<a href="${esc(url)}">${esc(tracking)}</a>` : esc(tracking);
      const html = `
        <div style="font-family:Georgia,serif;max-width:520px;color:#1a120a;">
          <h2 style="font-weight:500;letter-spacing:-0.02em;">Your order is on its way.</h2>
          <p><strong>${esc(row.product_name)}</strong> has shipped${carrier ? ` with ${esc(carrier)}` : ""}. Tracking number: ${link}. The first scan usually appears within a day or two; delivery takes one to two weeks and there is nothing to pay at the door.</p>
          <p>While it travels: The Lounge is our members' room, free, with who is lighting up near you tonight, your humidor valued against today's board and 465 rooms in 212 cities. <a href="https://thenextcigar.com/lounge/download/?src=shipped">Open The Lounge</a>.</p>
          <p style="margin-top:32px;">— The Next Cigar<br/><a href="https://thenextcigar.com/">thenextcigar.com</a></p>
        </div>`;
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ from, to: row.customer_email, subject: `Shipped — your Next Cigar order`, html }) });
      emailed = r.ok;
    }
    return json({ ok: true, emailed, customer: row.customer_email, product: row.product_name });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
};
