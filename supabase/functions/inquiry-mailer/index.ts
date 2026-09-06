/**
 * inquiry-mailer — Supabase Edge Function (Deno)
 *
 * Triggered by a database webhook on INSERT into public.inquiries.
 * Sends two emails through Resend:
 *   1. internal notification  → NOTIFY_TO (the organisation inbox)
 *   2. confirmation           → the person who submitted the form
 *
 * Secrets (set via `supabase secrets set` / management API):
 *   RESEND_API_KEY     Resend sending key
 *   MAIL_SHARED_SECRET random string the webhook must present
 *   NOTIFY_TO          default lelwakstarscbo@gmail.com
 *   RESEND_FROM        default "Lelwak Stars CBO <onboarding@resend.dev>"
 *                      → switch to a verified domain once DNS is set
 */

const RESEND = "https://api.resend.com/emails";

interface InquiryRecord {
  name: string;
  email: string;
  organisation?: string | null;
  inquiry_type?: string;
  phone?: string | null;
  budget_range?: string | null;
  message: string;
  submitted_at?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function ownerHtml(r: InquiryRecord) {
  const rows = [
    ["Type", r.inquiry_type ?? "—"],
    ["Organisation", r.organisation || "—"],
    ["Phone", r.phone || "—"],
    ["Budget", r.budget_range || "—"],
  ]
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5b6b62;font-size:13px">${k}</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#123047">${esc(v)}</td></tr>`)
    .join("");
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#14532D;color:#fff;border-radius:12px 12px 0 0;padding:16px 20px;font-size:15px;font-weight:bold">
      🌱 New enquiry — Lelwak Stars CBO
    </div>
    <div style="border:1px solid #ddebdd;border-top:0;border-radius:0 0 12px 12px;padding:20px">
      <h2 style="margin:0 0 4px;font-size:20px;color:#123047">${esc(r.name)}</h2>
      <p style="margin:0 0 14px;font-size:13px;color:#5b6b62">
        <a href="mailto:${esc(r.email)}" style="color:#14532D">${esc(r.email)}</a>
      </p>
      <table cellpadding="0" cellspacing="0">${rows}</table>
      <div style="margin:14px 0;background:#f7f5ed;border-radius:10px;padding:14px;font-size:14px;line-height:1.55;color:#33463c;white-space:pre-wrap">${esc(r.message)}</div>
      <a href="https://rrr810.github.io/lelwak-stars/admin/inquiries"
         style="display:inline-block;background:#14532D;color:#fff;text-decoration:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:bold">
         Open in dashboard
      </a>
    </div>
  </div>`;
}

function submitterHtml(r: InquiryRecord) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#33463c">
    <div style="background:#14532D;color:#fff;border-radius:12px 12px 0 0;padding:16px 20px;font-size:15px;font-weight:bold">
      🌱 Lelwak Stars CBO — we received your message
    </div>
    <div style="border:1px solid #ddebdd;border-top:0;border-radius:0 0 12px 12px;padding:22px;font-size:14px;line-height:1.65">
      <p style="margin:0 0 12px">Asante sana, <b>${esc(r.name.split(" ")[0] || r.name)}</b>.</p>
      <p style="margin:0 0 12px">
        Your message reached our team safely. A member of Lelwak Stars CBO will
        reply to this email address within a few days.
      </p>
      <div style="background:#f7f5ed;border-radius:10px;padding:14px;margin:14px 0;white-space:pre-wrap">${esc(r.message)}</div>
      <p style="margin:0;font-size:13px;color:#5b6b62">
        While you wait: our latest field stories are at
        <a href="https://rrr810.github.io/lelwak-stars/stories" style="color:#14532D">lelwakstars.org/stories</a>.<br/>
        Lelwak Stars CBO · youth-led community organisation · Kenya
      </p>
    </div>
  </div>`;
}

async function send(from: string, to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch(RESEND, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
  });
  const body = await res.text();
  if (!res.ok) console.error(`resend ${res.status} → ${to}: ${body}`);
  else console.log(`sent → ${to}`);
  return res.ok;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("MAIL_SHARED_SECRET");
  if (secret && req.headers.get("x-mail-secret") !== secret) {
    return new Response("unauthorised", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }

  // database webhook envelope: { type, table, record, ... }
  const record = (payload as { record?: InquiryRecord }).record;
  if (!record?.email || !record?.name) {
    return new Response("no record", { status: 400 });
  }

  const from = Deno.env.get("RESEND_FROM") ?? "Lelwak Stars CBO <onboarding@resend.dev>";
  const notifyTo = Deno.env.get("NOTIFY_TO") ?? "lelwakstarscbo@gmail.com";
  const when = record.submitted_at
    ? new Date(record.submitted_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
    : "";

  await send(
    from,
    notifyTo,
    `New ${record.inquiry_type ?? "enquiry"}: ${record.name}${record.organisation ? ` (${record.organisation})` : ""}`,
    ownerHtml(record),
  );

  // confirmation to the submitter (needs a verified sending domain on Resend;
  // on the onboarding domain Resend 403s strangers — logged, never fatal)
  await send(
    from,
    record.email,
    "We received your message — Lelwak Stars CBO",
    submitterHtml(record),
    notifyTo,
  );

  console.log(`processed enquiry from ${record.email} at ${when}`);
  return new Response("ok", { status: 200 });
});
