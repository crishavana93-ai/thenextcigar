-- ============================================================================
-- The Lounge — email redesign (migration 017)
-- ============================================================================
-- Two changes:
--   1. Update send_lounge_email() — sender is now "The Lounge
--      <contact@thenextcigar.com>" instead of notifications@thenextcigar.com
--   2. Update lounge_email_layout() — branded HTML template with the dark
--      "THE LOUNGE" logo at the top, proper email-safe CSS, and a footer.
--
-- IMPORTANT: contact@thenextcigar.com must be a verified sender at Resend.
-- If not, the API call will fail and emails won't send. To verify:
--   Resend dashboard → Domains → thenextcigar.com → confirm SPF/DKIM/DMARC
--   are green. Then any address @thenextcigar.com can be used as sender.
-- ============================================================================

-- 1. Sender change ---------------------------------------------------------
create or replace function public.send_lounge_email(
  to_email text,
  subject text,
  html_body text
) returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  api_key text;
  request_id bigint;
begin
  api_key := public.get_resend_api_key();
  if api_key is null or api_key = '' then
    raise warning '[send_lounge_email] Resend API key not configured';
    return null;
  end if;

  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    ),
    body := jsonb_build_object(
      'from', 'The Lounge <contact@thenextcigar.com>',
      'to', to_email,
      'subject', subject,
      'html', html_body,
      'reply_to', 'contact@thenextcigar.com'
    )
  ) into request_id;

  return request_id;
end;
$$;

-- 2. Branded email layout --------------------------------------------------
-- The hosted logo URL points at our deployed Cloudflare Pages domain so
-- inboxes can fetch it. We use the dark leather "THE LOUNGE" icon since it
-- reads well on the cream/charcoal email background.

create or replace function public.lounge_email_layout(
  preheader text,
  greeting text,
  body_html text,
  cta_label text,
  cta_url text
) returns text
language plpgsql
immutable
as $$
declare
  template text;
begin
  template := $tpl$<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Lounge</title>
</head>
<body style="margin:0;padding:0;background:#f5efe0;font-family:Georgia,'Times New Roman',serif;color:#1a1d2e;">

  <!-- Preheader: hidden text Gmail/Apple Mail shows in inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f5efe0;opacity:0;">
    __PREHEADER__
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5efe0;">
    <tr>
      <td align="center" style="padding:32px 16px 0 16px;">

        <!-- Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Dark header band with logo -->
          <tr>
            <td align="center" style="background:#1a1d2e;padding:28px 24px 24px 24px;">
              <img
                src="https://lounge.thenextcigar.com/lounge-app-icon-192.png"
                alt="The Lounge"
                width="64" height="64"
                style="display:block;width:64px;height:64px;border-radius:12px;border:0;outline:none;"
              />
              <p style="margin:14px 0 0 0;color:#c9a961;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">The Lounge</p>
              <p style="margin:4px 0 0 0;color:rgba(245,239,224,0.55);font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;">The Next Cigar · Members</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px 32px;">
              <p style="margin:0 0 18px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1a1d2e;">__GREETING__</p>

              <div style="font-family:Georgia,serif;font-size:15px;line-height:1.65;color:#333;">
                __BODY__
              </div>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px 0;">
                <tr>
                  <td bgcolor="#c9a961" style="border-radius:8px;">
                    <a href="__CTA_URL__"
                       style="display:inline-block;padding:13px 28px;background:#c9a961;color:#1a1d2e;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.06em;text-decoration:none;border-radius:8px;">
                      __CTA_LABEL__ →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quiet divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid #ebe3cf;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 30px 32px;">
              <p style="margin:0 0 8px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#6b6663;line-height:1.6;">
                You're getting this because you're a founding-cohort member of The Lounge.
              </p>
              <p style="margin:0 0 12px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#6b6663;line-height:1.6;">
                <a href="https://lounge.thenextcigar.com/lounge/app/" style="color:#c9a961;text-decoration:none;">Open the app</a>
                &nbsp;·&nbsp;
                <a href="https://thenextcigar.com/" style="color:#c9a961;text-decoration:none;">Read the magazine</a>
                &nbsp;·&nbsp;
                <a href="mailto:contact@thenextcigar.com" style="color:#c9a961;text-decoration:none;">Reply to Cris</a>
              </p>
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#a8a39c;letter-spacing:0.06em;">
                The Next Cigar · Stockholm, Sweden
              </p>
            </td>
          </tr>

        </table>

        <!-- Outer brand mark below the card -->
        <p style="margin:18px 0 32px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;color:#a8a39c;letter-spacing:0.2em;text-transform:uppercase;">
          T N E X T &nbsp; · &nbsp; C I G A R S
        </p>

      </td>
    </tr>
  </table>

</body>
</html>$tpl$;

  template := replace(template, '__PREHEADER__', coalesce(preheader, ''));
  template := replace(template, '__GREETING__', coalesce(greeting, 'Hello,'));
  template := replace(template, '__BODY__', coalesce(body_html, ''));
  template := replace(template, '__CTA_LABEL__', coalesce(cta_label, 'Open The Lounge'));
  template := replace(template, '__CTA_URL__', coalesce(cta_url, 'https://lounge.thenextcigar.com/lounge/app/'));

  return template;
end;
$$;
