// Cloudflare Pages Function — /finder/unsubscribe?email=…
// ---------------------------------------------------------------------------
// Every Finder email links here. GET shows a one-button page (so a mail
// client pre-fetching the link cannot unsubscribe anyone by accident); POST
// stops all Finder email for that address. Email-only, no token: the
// existing emails carry only the address, and being able to stop mail to an
// address you know is the lesser risk.
interface Env { PUBLIC_SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }
const page = (title: string, body: string) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · The Next Cigar</title><style>body{margin:0;background:#F2F0EA;color:#151412;font-family:Georgia,serif}main{max-width:520px;margin:12vh auto;padding:0 20px}p.k{font:600 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7B2622}h1{font-size:32px;margin:8px 0 12px;letter-spacing:-.02em}button{background:#151412;color:#F2F0EA;border:0;font:600 12px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:14px 20px;cursor:pointer}a{color:#151412}</style></head><body><main><p class="k">The Next Cigar · Finder</p>${body}</main></body></html>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
const valid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const email = (new URL(request.url).searchParams.get("email") || "").trim().toLowerCase();
  if (!valid(email)) return page("Unsubscribe", `<h1>Which address?</h1><p>This link is missing the email address. Reply to any Finder email with "unsubscribe" and we'll do it by hand.</p>`);
  return page("Unsubscribe", `<h1>Stop Finder emails?</h1><p>Price alerts, restock alerts and release watches for <b>${esc(email)}</b> will stop. The magazine newsletter, if you get it, is separate.</p><form method="post"><input type="hidden" name="email" value="${esc(email)}"><button type="submit">Unsubscribe ${esc(email)}</button></form><p style="margin-top:24px"><a href="https://thenextcigar.com/finder/">Back to Markets</a></p>`);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") || "").trim().toLowerCase();
  if (!valid(email)) return page("Unsubscribe", `<h1>Which address?</h1><p>No valid email address was sent.</p>`);
  const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json", Prefer: "return=minimal" };
  const r = await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_email_subscribers?email=eq.${encodeURIComponent(email)}`, { method: "PATCH", headers: H, body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }) });
  if (!r.ok) return page("Unsubscribe", `<h1>That didn't work.</h1><p>Write to <a href="mailto:contact@thenextcigar.com">contact@thenextcigar.com</a> and we'll do it by hand.</p>`);
  return page("Unsubscribed", `<h1>Done.</h1><p>No more Finder emails to <b>${esc(email)}</b>. If you change your mind, save any alert again.</p>`);
};
