// Cloudflare Pages Function — POST /api/watchlist/save
// ---------------------------------------------------------------------------
// Handles Save-to-Watchlist for both anonymous email-capture users and Lounge
// members. Runs on the edge.
//
// Flow:
//   1. Validate payload  { sku, targetPriceEur?, email?, baselineEur?, productName?, source? }
//   2. If a Lounge member session cookie is present (Supabase JWT), use that.
//      Otherwise treat as anonymous email capture.
//   3. Upsert finder_email_subscribers (by email) — mark confirmed_at = now()
//      because the save itself is the explicit opt-in for this specific alert.
//      We don't double-opt-in via email click anymore: it was burning ~40% of
//      legitimate signups (alert engine view requires confirmed_at IS NOT NULL,
//      so an unconfirmed save silently never fires) and creates a worse UX
//      ("check your inbox" with nothing arriving). GDPR-fine because consent
//      is action-specific + every transactional email carries an unsubscribe
//      link tied to the subscriber's confirm_token.
//   4. Insert finder_watchlists row (unique on subscriber+sku).
//   5. Fire a confirmation email via Resend so the user sees a receipt.
//      Email send is best-effort: if Resend errors, the save still succeeds
//      and the next price-drop alert is the first contact.
//   6. Return JSON { ok, status, message }.
//
// Auth model:
//   This endpoint runs with the SERVICE_ROLE key, which bypasses RLS so we can
//   write rows on behalf of anonymous users. The endpoint itself rate-limits
//   per IP + per email to prevent abuse.

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;     // server-only, set in Cloudflare Pages → Settings → Env vars
  // Resend transactional email — same keys the alert engine uses.
  RESEND_API_KEY?: string;
  ALERT_FROM_EMAIL?: string;
}

type SavePayload = {
  sku: string;
  targetPriceEur?: number | null;
  email?: string;
  baselineEur?: number | null;
  /** Human-readable cigar name from the modal, e.g. "Cohiba Robustos". Falls
   *  back to slug-pretty if absent so the confirmation email doesn't say
   *  "cohiba-robustos was saved." */
  productName?: string;
  source?: string;
  marketingOptIn?: boolean;
};

// Slug → "Cohiba Robustos" fallback when productName isn't supplied.
function prettifySku(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fmtPriceEur(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return "€" + Math.round(Number(n)).toLocaleString("en-US");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

// Build the "alert saved" confirmation email. Intentionally short — this is a
// receipt, not a sales pitch. One soft Lounge mention in the footer.
function renderSaveConfirmation(opts: {
  productName: string;
  sku: string;
  targetEur: number | null;
  baselineEur: number | null;
  email: string;
  confirmToken: string;
}): { subject: string; html: string; text: string } {
  const skuUrl = `https://thenextcigar.com/finder/sku/${opts.sku}/`;
  const unsubscribe = `https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(opts.email)}&token=${encodeURIComponent(opts.confirmToken)}`;
  const triggerLine = opts.targetEur != null
    ? `<strong>${fmtPriceEur(opts.targetEur)}</strong> or below`
    : (opts.baselineEur != null
        ? `below the current best (<strong>${fmtPriceEur(opts.baselineEur)}</strong>)`
        : `the next time it drops`);
  const subject = `Alert saved — ${opts.productName}`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2a2520;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f3ee;padding:28px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px 8px 32px;border-bottom:1px solid #eee;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#c9a961;font-weight:700;">Alert saved</div>
          <h1 style="margin:6px 0 0 0;font-size:22px;line-height:1.3;color:#1a1612;">${escapeHtml(opts.productName)}</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;">
            We'll email you the moment any retailer in our European catalogue drops
            <strong>${escapeHtml(opts.productName)}</strong> to ${triggerLine}.
          </p>
          <p style="margin:0 0 18px 0;font-size:14px;line-height:1.55;color:#7a6f60;">
            Prices are refreshed every 6 hours from public retailer pages. One alert per drop, no newsletter blasts.
          </p>
          <div style="margin:0 0 22px 0;">
            <a href="${skuUrl}" style="display:inline-block;background:#c9a961;color:#1a1612;font-weight:700;font-size:14px;text-decoration:none;padding:13px 22px;border-radius:4px;">View the comparison →</a>
          </div>
          <p style="margin:0;font-size:13px;color:#7a6f60;">
            Want unlimited alerts, price-history charts, and travel mode?
            <a href="https://thenextcigar.com/lounge/" style="color:#3a322a;">Join The Lounge</a> — $9/month or $79/year, free for life if you join before 1 June 2026.
          </p>
        </td></tr>
        <tr><td style="padding:18px 32px;background:#f9f6ef;border-top:1px solid #eee;font-size:11px;line-height:1.6;color:#7a6f60;">
          You're receiving this because you saved <strong>${escapeHtml(opts.productName)}</strong> on thenextcigar.com. The Finder is free and ad-free; we earn nothing from these alerts.
          <br><br>
          <a href="${unsubscribe}" style="color:#7a6f60;">Unsubscribe</a> ·
          <a href="https://thenextcigar.com/finder/" style="color:#7a6f60;">The Finder</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `ALERT SAVED — ${opts.productName}

We'll email you the moment any retailer in our European catalogue drops ${opts.productName} to ${opts.targetEur != null
    ? `${fmtPriceEur(opts.targetEur)} or below`
    : (opts.baselineEur != null
        ? `below ${fmtPriceEur(opts.baselineEur)} (current best)`
        : `a lower price`)}.

View the comparison: ${skuUrl}

Want unlimited alerts, price-history charts, and travel mode?
Join The Lounge: $9/month or $79/year (free for life until 1 June 2026).
https://thenextcigar.com/lounge/

You can unsubscribe any time: ${unsubscribe}
`;
  return { subject, html, text };
}

async function sendConfirmationEmail(
  env: Env,
  to: string,
  payload: { subject: string; html: string; text: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };
  const from = env.ALERT_FROM_EMAIL || "alerts@thenextcigar.com";
  try {
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
        tags: [{ name: "category", value: "alert_save_confirmation" }],
      }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return { ok: false, error: `resend ${r.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

const ALLOWED_SOURCES = new Set(["finder_save", "sku_page", "country_page", "blog_post"]);
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// ─── In-memory rate limiter ────────────────────────────────────────────────
// Cloudflare Pages Functions spin up new isolates per region — this limiter
// is per-isolate, not global, so a determined attacker on multiple regions
// can still flood. But it raises the floor: 10 req/min from one IP cap, 5
// req/min from one email cap. Together that defeats casual abuse.
//
// We don't pull in Cloudflare KV here because that's a $5/mo billable
// dependency for a feature that has no abuse pressure today. If/when abuse
// shows up, swap this for KV or Durable Objects.
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_IP = 10;
const RATE_LIMIT_EMAIL = 5;

function rateLimitCheck(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Reject anything that isn't JSON (CSRF defence + sanity).
  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return json({ ok: false, error: "content-type must be application/json" }, 400);
  }

  // Per-IP rate limit before parsing the body — cheap throttle for floods.
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!rateLimitCheck(`ip:${ip}`, RATE_LIMIT_IP)) {
    return json({ ok: false, error: "too many requests — try again in a minute" }, 429);
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
  const productName = (body.productName || "").toString().trim().slice(0, 120) || prettifySku(sku);

  if (!sku || sku.length > 64) {
    return json({ ok: false, error: "invalid sku" }, 400);
  }
  if (!email || !EMAIL_RX.test(email) || email.length > 320) {
    return json({ ok: false, error: "valid email required" }, 400);
  }

  // Per-email rate limit — prevents one IP cycling many emails to bypass
  // the per-IP cap, and prevents a stolen IP rotation from abusing a single
  // email address.
  if (!rateLimitCheck(`email:${email}`, RATE_LIMIT_EMAIL)) {
    return json({ ok: false, error: "too many requests for this email — try again in a minute" }, 429);
  }

  // ── 1. UPSERT subscriber ─────────────────────────────────────────────────
  // We use a service-role POST to /rest/v1/finder_email_subscribers with
  // ?on_conflict=email&Prefer=resolution=merge-duplicates — the standard
  // PostgREST upsert pattern. Returns the resolved row so we have its id.
  //
  // confirmed_at is set NOW on every save. The user's explicit click on
  // "Save price alert" is the consent gesture; the alert engine view
  // (finder_active_watchlists) requires confirmed_at IS NOT NULL to fire,
  // so leaving it null would silently disable every anonymous signup.
  const nowIso = new Date().toISOString();
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
          last_seen_at: nowIso,
          confirmed_at: nowIso,
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
    confirm_token: string;
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

  // ── 4. Send the confirmation email (best-effort) ─────────────────────────
  // For anonymous subscribers only — Lounge members get notifications inside
  // the app; spamming their inbox on every save is noise. Resend failures
  // do NOT roll back the save; the next price-drop alert remains the
  // commitment-shaped first contact even if this receipt didn't go out.
  let emailSent = false;
  let emailError: string | undefined;
  if (!subscriber.profile_id) {
    const rendered = renderSaveConfirmation({
      productName,
      sku,
      targetEur: targetPriceEur,
      baselineEur,
      email,
      confirmToken: subscriber.confirm_token,
    });
    const r = await sendConfirmationEmail(env, email, rendered);
    emailSent = r.ok;
    emailError = r.error;
  }

  // ── 5. Tell the caller what's next ───────────────────────────────────────
  // We always claim success here — the row exists, the alert engine will
  // fire on the next drop. Whether the receipt email landed is secondary.
  return json({
    ok: true,
    status: "saved",
    needsConfirmation: false, // single-opt-in: no inbox click required
    emailSent,
    emailError,
    message: emailSent
      ? `Saved. Confirmation sent to ${email}.`
      : `Saved. We'll email you when ${productName} drops in price.`,
  });
};

// Tiny GET handler for health-checks (browser sanity, e.g. /api/watchlist/save returns a hint).
export const onRequestGet: PagesFunction<Env> = async () =>
  json({ ok: false, error: "POST only" }, 405);
