"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import { Btn, Card, Field, inputCls, Notice, PageHead, Spinner } from "@/components/admin/ui";

type Settings = Record<string, string | number | null> & { id: number };

const FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp", hint: "International format, e.g. +2547…" },
  { key: "address_line", label: "Address line", hint: "Town / street — optional" },
  { key: "region", label: "Region", hint: "County / sub-county" },
  { key: "registration_no", label: "CBO registration number", hint: "Sponsors ask for this" },
  { key: "issued_by", label: "Registered by", hint: 'e.g. "Department of Social Services"' },
  { key: "year_founded", label: "Year founded" },
  { key: "facebook", label: "Facebook URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "x_twitter", label: "X / Twitter URL" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "tiktok", label: "TikTok URL" },
  { key: "hero_heading", label: "Home hero heading", hint: "Leave empty to keep the current one" },
  { key: "hero_sub", label: "Home hero sub-line" },
  { key: "donation_link", label: "Donation link", hint: "M-Pesa page, PayPal, etc." },
  { key: "mpesa_till", label: "M-Pesa till / paybill" },
];

export default function SettingsPage() {
  const { sb, changePassword } = useAdmin();
  const [row, setRow] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    sb.from("site_settings").select("*").order("id").limit(1).then(({ data }) => {
      if (data && data[0]) setRow(data[0] as Settings);
    });
  }, [sb]);

  const set = (key: string, value: string) => setRow((r) => (r ? { ...r, [key]: value } : r));

  const save = async () => {
    if (!row) return;
    const payload: Record<string, unknown> = { id: row.id };
    for (const f of FIELDS) {
      const raw = (row[f.key] ?? "") as string;
      payload[f.key] = f.key === "year_founded" ? (raw === "" ? null : Number(raw)) : raw === "" ? null : raw;
    }
    const { error } = await sb.from("site_settings").upsert(payload);
    setMsg(error ? { tone: "err", text: error.message } : { tone: "ok", text: "Settings saved. They go live on the public site with the next deploy (one push)." });
  };

  const savePassword = async () => {
    if (pw.next.length < 10) {
      setPwMsg({ tone: "err", text: "Use at least 10 characters." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ tone: "err", text: "The two passwords do not match." });
      return;
    }
    const err = await changePassword(pw.next);
    setPwMsg(err ? { tone: "err", text: err } : { tone: "ok", text: "Password changed. Use it next time you sign in." });
    setPw({ next: "", confirm: "" });
  };

  if (!row) return <Spinner />;

  return (
    <>
      <PageHead
        title="Settings"
        sub="Organisation facts, socials and hero copy. This table is the single source of truth — the public site picks it up on the next deploy."
        action={<Btn onClick={() => void save()}>Save settings</Btn>}
      />
      {msg ? (
        <div className="mb-4">
          <Notice tone={msg.tone}>{msg.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <input
                className={inputCls}
                value={(row[f.key] as string) ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </Field>
          ))}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
              Change password
            </h2>
            <Field label="New password">
              <input className={inputCls} type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </Field>
            <Field label="Repeat it">
              <input className={inputCls} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </Field>
            {pwMsg ? <Notice tone={pwMsg.tone}>{pwMsg.text}</Notice> : null}
            <Btn onClick={() => void savePassword()}>Update password</Btn>
          </Card>

          <Card>
            <h2 className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
              How publishing works
            </h2>
            <ul className="mt-3 space-y-2 text-[0.8125rem] leading-relaxed text-navy-700/70">
              <li>• Photos, captions, enquiries and statuses go live instantly.</li>
              <li>• Story detail pages, settings and hero copy ship with the next deploy — about a minute after a push to main.</li>
              <li>• Nothing here is public except what you publish. Anonymous visitors can only read live content and send enquiries.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
