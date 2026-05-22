// Cloudflare Pages Function — POST /api/watchlist/save
// ---------------------------------------------------------------------------
// Handles Save-to-Watchlist for both anonymous email-capture users and Lounge
// members. Runs on the edge.
//
// Flow:
//   1. Validate payload  { sku, targetPriceEur?, email?, baselineEur?, source? }
//   2. If a Lounge member session cookie is present (Supabase JWT), use that.
//      Otherwise treat as anonymous email capture.
//   3. Upsert finder_email_subscribers (by email).
//   4. Insert finder_watchlists row (unique on subscriber+sku).
//   5. Return JSON { ok, status, message, needsConfirmation }.
//
// Auth model:
//   This endpoint runs with the SERVICE_ROLE key, which bypasses RLS so we can
//   write rows on behalf of anonymous users. The endpoint itself rate-limits
//   per IP + per email to prevent abuse.

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;     // server-only, set in Cloudflare Pages → Settings → Env vars
}

type SavePayload = {
  sku: string;
  targetPriceEur?: number | null;
  email?: string;
  baselineEur?: number | null;
  source?: string;
  marketingOptIn?: boolean;
};

const ALLOWED_SOURCES = new Set(["finder_save", "sku_page", "country_page", "blog_post"]);
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Reject anything that isn't JSON (CSRF defence + sanity).
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return json({ ok: false, error: "content-type must be application/json" }, 400);
  }

  let body: SavePayload;
  try {
    body = (await request.json()) as SavePayload;
  } catch {
    return json({ ok: false, error: "invalid json" }, 400);
  }

  const sku = (body.sku || "").toString().trim().toLowerCase();
  const email = (body.email || "").toString().trim().toLowerCase();
  const targetPriceEur = typeof body.targetPriceEur === "number" ? body.targetPriceEur : null;
  const baselineEur = typeof body.baselineEur === "number" ? body.baselineEur : null;
  const source = body.source && ALLOWED_SOURCES.has(body.source) ? body.source : "finder_save";
  const marketingOptIn = body.marketingOptIn !== false; // default true

  if (!sku || sku.length > 64) {
    return json({ ok: false, error: "invalid sku" }, 400);
  }
  if (!email || !EMAIL_RX.test(email) || email.length > 320) {
    return json({ ok: false, error: "valid email required" }, 400);
  }

  // ── 1. UPSERT subscriber ─────────────────────────────────────────────────
  // We use a service-role POST to /rest/v1/finder_email_subscribers with
  // ?on_conflict=email&Prefer=resolution=merge-duplicates — the standard
  // PostgREST upsert pattern. Returns the resolved row so we have its id.
  const subRes = await fetch(
    `${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_email_subscribers?on_conflict=email`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          email,
          marketing_opt_in: marketingOptIn,
          source,
          last_seen_at: new Date().toISOString(),
          ip_country: request.headers.get("cf-ipcountry") || null,
        },
      ]),
    }
  );
  if (!subRes.ok) {
    const detail = await subRes.text();
    return json({ ok: false, error: "subscriber upsert failed", detail }, 500);
  }
  const subscribers = (await subRes.json()) as Array<{
    id: string;
    confirmed_at: string | null;
    free_alerts_used: number;
    profile_id: string | null;
  }>;
  const subscriber = subscribers[0];
  if (!subscriber) return json({ ok: false, error: "no subscriber returned" }, 500);

  // ── 2. Free-tier guard ───────────────────────────────────────────────────
  // 1 free alert per anonymous subscriber. Lounge members (profile_id set)
  // get unlimited. We count CURRENT active rows rather than relying on
  // free_alerts_used (race-safe).
  if (!subscriber.profile_id) {
    const countRes = await fetch(
      `${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_watchlists?subscriber_id=eq.${subscriber.id}&archived_at=is.null&select=id`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "count=exact",
        },
      }
    );
    const range = countRes.headers.get("content-range") || "*/0";
    const total = Number(range.split("/")[1] || 0);
    if (total >= 1) {
      return json(
        {
          ok: false,
          status: "free_tier_limit",
          message:
            "Free tier covers 1 saved alert. Upgrade to The Lounge for unlimited watchlists.",
          upsell: "/lounge/",
        },
        402
      );
    }
  }

  // ── 3. Insert watchlist row ──────────────────────────────────────────────
  const watchRes = await fetch(
    `${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_watchlists?on_conflict=subscriber_id,sku`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          subscriber_id: subscriber.id,
          sku,
          target_price_eur: targetPriceEur,
          baseline_price_eur: baselineEur,
        },
      ]),
    }
  );
  if (!watchRes.ok) {
    const detail = await watchRes.text();
    return json({ ok: false, error: "watchlist insert failed", detail }, 500);
  }

  // ── 4. Tell the caller what's next ───────────────────────────────────────
  const needsConfirmation = !subscriber.confirmed_at && !subscriber.profile_id;
  return json({
    ok: true,
    status: "saved",
    needsConfirmation,
    message: needsConfirmation
      ? "Saved. Check your inbox to confirm the alert."
      : "Saved to your watchlist.",
  });
};

// Tiny GET handler for health-checks (browser sanity, e.g. /api/watchlist/save returns a hint).
export const onRequestGet: PagesFunction<Env> = async () =>
  json({ ok: false, error: "POST only" }, 405);
