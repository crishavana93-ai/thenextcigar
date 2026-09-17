// Cloudflare Pages Function — POST /api/shop/orders
// Returns recent shop_orders rows for the admin panel. Body: { token, limit? }
interface Env { SHOP_ADMIN_TOKEN?: string; PUBLIC_SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const b = (await request.json()) as any;
    if (!env.SHOP_ADMIN_TOKEN) return json({ ok: false, error: "SHOP_ADMIN_TOKEN is not set in Cloudflare." }, 500);
    if (!b?.token || b.token !== env.SHOP_ADMIN_TOKEN) return json({ ok: false, error: "Wrong token." }, 401);
    const limit = Math.min(Math.max(Number(b.limit) || 200, 1), 1000);
    const cols = "id,created_at,stripe_session_id,stripe_payment_intent,product_slug,product_name,product_sku,quantity,lines,amount,currency,customer_email,customer_name,shipping_name,shipping_line1,shipping_line2,shipping_city,shipping_state,shipping_postal,shipping_country,shipping_phone,status,tracking_number,tracking_url,carrier,shipped_at";
    const r = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/shop_orders?select=${cols}&order=created_at.desc&limit=${limit}`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } });
    if (!r.ok) return json({ ok: false, error: `Supabase ${r.status}: ${await r.text()}` }, 500);
    return json({ ok: true, orders: await r.json() });
  } catch (e) { return json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, 500); }
};
