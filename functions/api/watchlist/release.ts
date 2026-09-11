// Cloudflare Pages Function — POST /api/watchlist/release
// ---------------------------------------------------------------------------
// "Tell me when something new is listed." Upserts the subscriber (the click
// is the consent, same as /api/watchlist/save) and inserts a release
// watchlist scoped to an optional country and optional brand. Emails are
// sent by /api/scraper/listings after each crawl.
interface Env { PUBLIC_SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; RESEND_API_KEY?: string; ALERT_FROM_EMAIL?: string }
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const COUNTRIES = new Set(["de", "ch", "it", "es", "se", "uk", "nl", "be", "at", "dk", "no", "fi", "pt", "cz", "ie", "gr", "fr", "lu"]);
const hits = new Map<string, { n: number; t: number }>();

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get("cf-connecting-ip") || "?";
  const h = hits.get(ip); const now = Date.now();
  if (h && h.t > now - 60_000 && h.n >= 6) return json({ ok: false, error: "too many requests" }, 429);
  hits.set(ip, { n: h && h.t > now - 60_000 ? h.n + 1 : 1, t: now });

  let body: any; try { body = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return json({ ok: false, error: "enter a valid email" }, 400);
  const country = String(body.country || "").toLowerCase();
  const brand = String(body.brand || "").trim().slice(0, 40);
  if (country && !COUNTRIES.has(country)) return json({ ok: false, error: "unknown country" }, 400);
  const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" };
  const nowIso = new Date().toISOString();

  const sub = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_email_subscribers?on_conflict=email`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ email, source: "release_watch", last_seen_at: nowIso, confirmed_at: nowIso, ip_country: request.headers.get("cf-ipcountry") || null }]) });
  if (!sub.ok) return json({ ok: false, error: "could not save" }, 500);
  const s = ((await sub.json()) as any[])[0];

  // One active release watch per subscriber; a new request replaces its scope.
  await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_release_watchlists?subscriber_id=eq.${s.id}&archived_at=is.null`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify({ archived_at: nowIso }) });
  const ins = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_release_watchlists`, { method: "POST", headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ subscriber_id: s.id, country_scope: country ? [country] : null, brand_filter: brand ? [brand] : null }) });
  if (!ins.ok) return json({ ok: false, error: "could not save the watch" }, 500);

  if (env.RESEND_API_KEY) {
    const from = env.ALERT_FROM_EMAIL || "alerts@thenextcigar.com";
    const scope = `${country ? `retailers in ${country.toUpperCase()}` : "every retailer we track"}${brand ? `, ${brand} only` : ""}`;
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: `The Next Cigar Finder <${from}>`, to: [email], subject: "Release watch saved", tags: [{ name: "category", value: "finder_release" }],
        text: `You'll get one email when a new Cuban listing appears at ${scope}. We crawl four times a day. Unsubscribe any time: https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(email)}`,
        html: `<div style="font-family:Georgia,serif;max-width:560px;color:#151412"><p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7B2622">The Next Cigar · release watch</p><h1 style="font-size:24px;margin:0 0 12px">Saved.</h1><p>You'll get one email when a new Cuban listing appears at ${scope}. We crawl four times a day and say only what we saw: a product page that wasn't there before.</p><p style="font-size:12px;color:#7a6f60"><a href="https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(email)}" style="color:#7a6f60">Unsubscribe</a></p></div>` }) }).catch(() => {});
  }
  return json({ ok: true, message: "Saved. One email when something new is listed." });
};
