// Cloudflare Pages Function — POST /api/finder/alerts/process
// ---------------------------------------------------------------------------
// Diffs the two most recent price snapshots per (sku, retailer, pack_size),
// detects price_drop and back_in_stock events, dedupes against the deliveries
// table, sends transactional emails via Resend, and writes the audit row.
//
// Auth: requires X-Scraper-Token header matching SCRAPER_ADMIN_TOKEN env var.
// The same GitHub Actions cron that triggers scrapes also calls this endpoint
// immediately after each retailer scrape completes.
//
// Detection rules:
//   PRICE DROP   — newest.price_eur < second_newest.price_eur AND
//                  newest.price_eur < watchlist.baseline_price_eur (if set)
//                  AND (target_price_eur is null OR newest.price_eur ≤ target)
//   BACK IN STOCK — newest.in_stock=true AND second_newest.in_stock=false
//
// Dedup: a watchlist gets at most one alert per snapshot (unique index in
// finder_alert_deliveries on (watchlist_id, snapshot_id)).

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SCRAPER_ADMIN_TOKEN: string;
  RESEND_API_KEY: string;
  // From-address must be a verified Resend domain. e.g. "alerts@thenextcigar.com".
  ALERT_FROM_EMAIL?: string;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// ─── Types ─────────────────────────────────────────────────────────────────
interface SnapshotRow {
  id: string;
  sku: string;
  retailer_id: string;
  pack_size: number;
  price: number;
  currency: string;
  price_eur: number;
  price_per_cigar_eur: number;
  in_stock: boolean;
  source_url: string;
  scraped_at: string;
}

interface WatchlistRow {
  watchlist_id: string;
  sku: string;
  target_price_eur: number | null;
  baseline_price_eur: number | null;
  last_alert_sent_at: string | null;
  subscriber_id: string;
  email: string;
}

interface AlertEvent {
  type: "price_drop" | "back_in_stock";
  watchlist: WatchlistRow;
  newest: SnapshotRow;
  previous: SnapshotRow | null;
  sku: string;
  retailerId: string;
  packSize: number;
  alertPriceEur: number;
}

// ─── Supabase REST helpers ─────────────────────────────────────────────────
async function supaSelect<T>(
  env: Env,
  path: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const u = new URL(`${env.PUBLIC_SUPABASE_URL}/rest/v1/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u.toString(), {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
  });
  if (!r.ok) throw new Error(`supabase ${r.status}: ${await r.text()}`);
  return (await r.json()) as T[];
}

async function supaInsert<T>(env: Env, table: string, row: T): Promise<Response> {
  return fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

async function supaUpdate(env: Env, table: string, filter: string, patch: unknown): Promise<Response> {
  return fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
}

// ─── Email rendering ───────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function fmtPrice(eur: number): string {
  return "€" + eur.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderEmail(event: AlertEvent): { subject: string; html: string; text: string } {
  const sku = event.sku;
  // Slug → "Cohiba Robustos" — capitalize each segment.
  const skuName = sku
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  const retailerName = event.retailerId
    .replace(/^[a-z]{2}-/, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  const skuUrl = `https://thenextcigar.com/finder/sku/${sku}/`;
  const packLabel = event.packSize === 1 ? "single cigar" : `${event.packSize}-pack`;

  let subject: string;
  let heading: string;
  let leadHtml: string;
  let leadText: string;

  if (event.type === "price_drop") {
    const oldP = event.previous?.price_eur ?? event.watchlist.baseline_price_eur ?? 0;
    const newP = event.newest.price_eur;
    const dropEur = Math.max(0, oldP - newP);
    const dropPct = oldP > 0 ? Math.round((dropEur / oldP) * 100) : 0;
    subject = `${skuName} dropped ${dropPct ? dropPct + "% " : ""}— ${fmtPrice(newP)} at ${retailerName}`;
    heading = "Price drop";
    leadHtml = `<strong>${escapeHtml(retailerName)}</strong> just dropped <strong>${escapeHtml(skuName)}</strong> (${packLabel}) to <strong>${fmtPrice(newP)}</strong>` +
      (oldP > 0 ? ` — down from ${fmtPrice(oldP)}` : "") +
      `.`;
    leadText = `${retailerName} dropped ${skuName} (${packLabel}) to ${fmtPrice(newP)}` +
      (oldP > 0 ? ` (was ${fmtPrice(oldP)})` : "") + ".";
  } else {
    subject = `${skuName} is back in stock at ${retailerName} — ${fmtPrice(event.newest.price_eur)}`;
    heading = "Back in stock";
    leadHtml = `<strong>${escapeHtml(skuName)}</strong> just came back in stock at <strong>${escapeHtml(retailerName)}</strong> (${packLabel}) for <strong>${fmtPrice(event.newest.price_eur)}</strong>.`;
    leadText = `${skuName} is back in stock at ${retailerName} (${packLabel}) for ${fmtPrice(event.newest.price_eur)}.`;
  }

  const perCigar = event.newest.price_per_cigar_eur;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2a2520;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f3ee;padding:28px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px 8px 32px;border-bottom:1px solid #eee;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#c9a961;font-weight:700;">${escapeHtml(heading)}</div>
          <h1 style="margin:6px 0 0 0;font-size:22px;line-height:1.3;color:#1a1612;">${escapeHtml(skuName)}</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 18px 0;font-size:15px;line-height:1.55;">${leadHtml}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6f60;width:50%;">Now</td>
              <td style="padding:10px 0;font-size:17px;font-weight:700;color:#1a1612;text-align:right;">${fmtPrice(event.newest.price_eur)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6f60;border-top:1px solid #f0ead8;">Per cigar</td>
              <td style="padding:10px 0;font-size:14px;color:#3a322a;text-align:right;border-top:1px solid #f0ead8;">${fmtPrice(perCigar)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6f60;border-top:1px solid #f0ead8;">Pack size</td>
              <td style="padding:10px 0;font-size:14px;color:#3a322a;text-align:right;border-top:1px solid #f0ead8;">${packLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6f60;border-top:1px solid #f0ead8;">Retailer</td>
              <td style="padding:10px 0;font-size:14px;color:#3a322a;text-align:right;border-top:1px solid #f0ead8;">${escapeHtml(retailerName)}</td>
            </tr>
          </table>
          <div style="margin:0 0 22px 0;">
            <a href="${escapeHtml(event.newest.source_url)}" style="display:inline-block;background:#c9a961;color:#1a1612;font-weight:700;font-size:14px;text-decoration:none;padding:13px 22px;border-radius:4px;">View at ${escapeHtml(retailerName)} →</a>
          </div>
          <p style="margin:0 0 4px 0;font-size:13px;color:#7a6f60;">Compare across all European retailers:</p>
          <p style="margin:0;font-size:13px;"><a href="${skuUrl}" style="color:#3a322a;">${skuUrl}</a></p>
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f9f6ef;border-top:1px solid #eee;font-size:11px;line-height:1.6;color:#7a6f60;">
          You're receiving this because you saved <strong>${escapeHtml(skuName)}</strong> to your Finder watchlist. Prices are scraped every 6 hours from public retailer pages; stock states and prices may shift before you reach the checkout. The Next Cigar earns nothing from these alerts — no affiliate links, no kickbacks.
          <br><br>
          <a href="https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(event.watchlist.email)}" style="color:#7a6f60;">Unsubscribe</a> ·
          <a href="https://thenextcigar.com/finder/" style="color:#7a6f60;">The Finder</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${heading.toUpperCase()} — ${skuName}

${leadText}

Now: ${fmtPrice(event.newest.price_eur)}
Per cigar: ${fmtPrice(perCigar)}
Pack: ${packLabel}
Retailer: ${retailerName}

Shop: ${event.newest.source_url}
Compare: ${skuUrl}

Unsubscribe: https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(event.watchlist.email)}
`;

  return { subject, html, text };
}

// ─── Resend transport ──────────────────────────────────────────────────────
async function sendEmail(
  env: Env,
  to: string,
  payload: { subject: string; html: string; text: string }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = env.ALERT_FROM_EMAIL || "alerts@thenextcigar.com";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: `The Next Cigar Finder <${from}>`,
      to: [to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      tags: [{ name: "category", value: "finder_alert" }],
    }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { ok: false, error: `resend ${r.status}: ${JSON.stringify(body)}` };
  }
  return { ok: true, id: (body as Record<string, string>).id };
}

// ─── Endpoint ──────────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { env, request } = ctx;

  const token = request.headers.get("x-scraper-token");
  if (!env.SCRAPER_ADMIN_TOKEN || token !== env.SCRAPER_ADMIN_TOKEN) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dry") === "1";
  const limitParam = parseInt(url.searchParams.get("limit") || "0", 10);
  const testEmail = url.searchParams.get("test"); // ?test=you@example.com → fire one sample email + return

  // ── TEST MODE: send a single hardcoded sample alert to verify Resend +
  // domain verification work end-to-end, without needing a real price diff.
  if (testEmail) {
    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: "RESEND_API_KEY not configured" }, 500);
    }
    const fakeEvent: AlertEvent = {
      type: "price_drop",
      watchlist: {
        watchlist_id: "test-watchlist",
        sku: "cohiba-robustos",
        target_price_eur: null,
        baseline_price_eur: 2050.0,
        last_alert_sent_at: null,
        subscriber_id: "test-subscriber",
        email: testEmail,
      },
      newest: {
        id: "test-snapshot",
        sku: "cohiba-robustos",
        retailer_id: "de-noblego",
        pack_size: 25,
        price: 1930.3,
        currency: "EUR",
        price_eur: 1930.3,
        price_per_cigar_eur: 77.21,
        in_stock: true,
        source_url: "https://www.noblego.de/cohiba-robusto-zigarre/",
        scraped_at: new Date().toISOString(),
      },
      previous: null,
      sku: "cohiba-robustos",
      retailerId: "de-noblego",
      packSize: 25,
      alertPriceEur: 1930.3,
    };
    const rendered = renderEmail(fakeEvent);
    // Override the lead so it's obvious this is a test, not a real alert.
    rendered.subject = "[TEST] " + rendered.subject;
    const sendRes = await sendEmail(env, testEmail, rendered);
    return json({
      ok: sendRes.ok,
      mode: "test",
      to: testEmail,
      from: env.ALERT_FROM_EMAIL || "alerts@thenextcigar.com",
      subject: rendered.subject,
      resendId: sendRes.id,
      error: sendRes.error,
    });
  }

  // ── 1. Load active watchlists (confirmed, not unsubscribed, not archived).
  const watchlists = await supaSelect<WatchlistRow>(env, "finder_active_watchlist_v", {
    select: "watchlist_id,sku,target_price_eur,baseline_price_eur,last_alert_sent_at,subscriber_id,email",
  });

  if (watchlists.length === 0) {
    return json({ ok: true, watchlistsScanned: 0, alertsFired: 0, note: "no active watchlists" });
  }

  // ── 2. For each SKU on the watchlists, pull the 2 most recent snapshots
  // per (retailer_id, pack_size). We do this with one query per unique SKU.
  const skus = Array.from(new Set(watchlists.map((w) => w.sku)));
  const skuSnapshots = new Map<string, SnapshotRow[]>(); // sku → all recent snaps sorted desc

  for (const sku of skus) {
    // Pull last 6 snapshots per retailer/pack — overkill but cheap; we only
    // diff [0] vs [1] per group below.
    const rows = await supaSelect<SnapshotRow>(env, "finder_price_snapshots", {
      select: "id,sku,retailer_id,pack_size,price,currency,price_eur,price_per_cigar_eur,in_stock,source_url,scraped_at",
      sku: `eq.${sku}`,
      order: "scraped_at.desc",
      limit: "300",
    });
    skuSnapshots.set(sku, rows);
  }

  // ── 3. For each (sku, retailer, pack), keep [newest, second_newest].
  function pairsFor(sku: string): Array<{ newest: SnapshotRow; previous: SnapshotRow | null }> {
    const rows = skuSnapshots.get(sku) || [];
    const groups = new Map<string, SnapshotRow[]>();
    for (const row of rows) {
      const key = `${row.retailer_id}::${row.pack_size}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    const out: Array<{ newest: SnapshotRow; previous: SnapshotRow | null }> = [];
    for (const list of groups.values()) {
      // list is already sorted desc by scraped_at.
      if (list[0]) out.push({ newest: list[0], previous: list[1] ?? null });
    }
    return out;
  }

  // ── 4. Walk every watchlist × every (retailer, pack) pair and detect events.
  const events: AlertEvent[] = [];
  for (const w of watchlists) {
    for (const { newest, previous } of pairsFor(w.sku)) {
      // PRICE DROP: newest < previous AND (no target OR meets target).
      if (previous && newest.price_eur < previous.price_eur) {
        const meetsTarget = w.target_price_eur == null || newest.price_eur <= w.target_price_eur;
        const belowBaseline = w.baseline_price_eur == null || newest.price_eur < w.baseline_price_eur;
        if (meetsTarget && belowBaseline) {
          events.push({
            type: "price_drop",
            watchlist: w,
            newest,
            previous,
            sku: newest.sku,
            retailerId: newest.retailer_id,
            packSize: newest.pack_size,
            alertPriceEur: newest.price_eur,
          });
        }
      }
      // BACK IN STOCK: transitioned false → true.
      if (previous && previous.in_stock === false && newest.in_stock === true) {
        events.push({
          type: "back_in_stock",
          watchlist: w,
          newest,
          previous,
          sku: newest.sku,
          retailerId: newest.retailer_id,
          packSize: newest.pack_size,
          alertPriceEur: newest.price_eur,
        });
      }
    }
  }

  // ── 5. Dedupe against finder_alert_deliveries: skip events we already fired
  // for this (watchlist_id, snapshot_id) pair.
  if (events.length === 0) {
    return json({ ok: true, watchlistsScanned: watchlists.length, eventsDetected: 0, alertsFired: 0 });
  }

  // Pull existing deliveries for the watchlists involved.
  const watchlistIds = Array.from(new Set(events.map((e) => e.watchlist.watchlist_id)));
  const existingDeliveries = await supaSelect<{ watchlist_id: string; snapshot_id: string }>(env, "finder_alert_deliveries", {
    select: "watchlist_id,snapshot_id",
    watchlist_id: `in.(${watchlistIds.map((id) => `"${id}"`).join(",")})`,
  });
  const sent = new Set(existingDeliveries.map((d) => `${d.watchlist_id}::${d.snapshot_id}`));
  const fresh = events.filter((e) => !sent.has(`${e.watchlist.watchlist_id}::${e.newest.id}`));

  // ── 6. Apply optional limit + dry-run gate.
  const queue = limitParam > 0 ? fresh.slice(0, limitParam) : fresh;

  if (dryRun) {
    return json({
      ok: true,
      dryRun: true,
      watchlistsScanned: watchlists.length,
      eventsDetected: events.length,
      eventsAfterDedup: fresh.length,
      eventsQueued: queue.length,
      sample: queue.slice(0, 5).map((e) => ({
        type: e.type,
        sku: e.sku,
        retailer: e.retailerId,
        pack: e.packSize,
        to: e.watchlist.email,
        newEur: e.newest.price_eur,
        prevEur: e.previous?.price_eur ?? null,
        subject: renderEmail(e).subject,
      })),
    });
  }

  // ── 7. Send each email and log delivery.
  let sentCount = 0;
  const sendErrors: string[] = [];
  for (const event of queue) {
    if (!env.RESEND_API_KEY) {
      sendErrors.push("RESEND_API_KEY not configured");
      break;
    }
    const rendered = renderEmail(event);
    const sendRes = await sendEmail(env, event.watchlist.email, rendered);

    await supaInsert(env, "finder_alert_deliveries", {
      watchlist_id: event.watchlist.watchlist_id,
      subscriber_id: event.watchlist.subscriber_id,
      alert_type: event.type,
      snapshot_id: event.newest.id,
      sku: event.sku,
      retailer_id: event.retailerId,
      alert_price_eur: event.alertPriceEur,
      delivery_status: sendRes.ok ? "sent" : "failed",
    });

    if (sendRes.ok) {
      sentCount++;
      // Stamp the watchlist with the time of the most recent alert. (alert_count
      // increment lives in a Postgres trigger we'll add when we wire admin
      // analytics — out of scope for the alert engine itself.)
      await supaUpdate(
        env,
        "finder_watchlists",
        `id=eq.${event.watchlist.watchlist_id}`,
        { last_alert_sent_at: new Date().toISOString() }
      );
    } else {
      sendErrors.push(`${event.watchlist.email}: ${sendRes.error}`);
    }
  }

  return json({
    ok: sendErrors.length === 0,
    watchlistsScanned: watchlists.length,
    eventsDetected: events.length,
    eventsAfterDedup: fresh.length,
    eventsQueued: queue.length,
    alertsFired: sentCount,
    errors: sendErrors,
  });
};

export const onRequestGet: PagesFunction<Env> = async () =>
  json(
    {
      ok: false,
      error: "POST only (with X-Scraper-Token header)",
      hint: "Append ?dry=1 to preview events without sending emails, ?limit=N to cap sends.",
    },
    405
  );
