"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import type { Database } from "@/lib/database.types";
type InquiryUpdate = Database["public"]["Tables"]["inquiries"]["Update"];
import { Badge, Btn, Card, Field, inputCls, Notice, PageHead, Spinner } from "@/components/admin/ui";

type Inquiry = {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  role: string | null;
  country: string | null;
  message: string;
  budget_range: string | null;
  status: string;
  is_priority: boolean;
  notes: string | null;
  submitted_at: string;
};

const STATUSES = ["new", "contacted", "in-discussion", "won", "lost", "archived"] as const;

const statusTone = (s: string) =>
  s === "new" ? "gold" : s === "won" ? "green" : s === "lost" || s === "archived" ? "navy" : "clay";

export default function InquiriesPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () =>
    sb
      .from("inquiries")
      .select("*")
      .order("submitted_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Inquiry[]));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await sb
      .from("inquiries")
      .update({ status: status as InquiryUpdate["status"], handled_at: status === "new" ? null : new Date().toISOString() })
      .eq("id", id);
    setMsg(error ? `Could not update: ${error.message}` : null);
    void load();
  };

  const saveNotes = async (id: string, notes: string) => {
    const { error } = await sb.from("inquiries").update({ notes }).eq("id", id);
    setMsg(error ? `Could not save notes: ${error.message}` : "Notes saved.");
  };

  const list = (rows ?? []).filter((r) => filter === "all" || r.status === filter);

  if (!rows) return <Spinner />;

  return (
    <>
      <PageHead
        title="Enquiries"
        sub="Every partner-with-us submission, newest first. Priority rows are sponsorships and grants — the database flags them automatically."
        action={
          <select className={inputCls + " w-auto"} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />
      {msg ? <div className="mb-4">{<Notice tone="info">{msg}</Notice>}</div> : null}

      <div className="space-y-4">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <button
                className="font-display text-[0.9375rem] font-extrabold text-navy-900 underline-offset-4 hover:underline"
                onClick={() => setOpen(open === r.id ? null : r.id)}
              >
                {open === r.id ? "▾" : "▸"} {r.name}
              </button>
              {r.organisation ? <span className="text-[0.8125rem] text-navy-700/60">{r.organisation}</span> : null}
              <Badge tone="navy">{r.inquiry_type}</Badge>
              {r.is_priority ? <Badge tone="gold">priority</Badge> : null}
              <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              <span className="ml-auto text-[0.75rem] text-navy-700/45">
                {new Date(r.submitted_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {open === r.id ? (
              <div className="mt-4 space-y-4 border-t border-navy-700/8 pt-4">
                <p className="whitespace-pre-wrap rounded-xl bg-cream-100 p-4 text-[0.875rem] leading-relaxed text-navy-700/85">
                  {r.message}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Reply by email">
                    <a className="text-[0.8125rem] font-bold text-forest-700 underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </Field>
                  {r.phone ? (
                    <Field label="Phone / WhatsApp">
                      <a className="text-[0.8125rem] font-bold text-forest-700 underline" href={`tel:${r.phone}`}>
                        {r.phone}
                      </a>
                    </Field>
                  ) : null}
                  {r.budget_range ? (
                    <Field label="Budget range">
                      <span className="text-[0.8125rem] font-bold text-navy-900">{r.budget_range}</span>
                    </Field>
                  ) : null}
                  {r.country ? (
                    <Field label="Country">
                      <span className="text-[0.8125rem] text-navy-700/75">{r.country}</span>
                    </Field>
                  ) : null}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Status">
                    <select className={inputCls} value={r.status} onChange={(e) => void setStatus(r.id, e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Internal notes" hint="Only admins can read these.">
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        defaultValue={r.notes ?? ""}
                        placeholder="e.g. replied 12/09, sent proposal pack"
                        onBlur={(e) => {
                          if ((e.target.value ?? "") !== (r.notes ?? "")) void saveNotes(r.id, e.target.value);
                        }}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            ) : null}
          </Card>
        ))}
        {list.length === 0 ? (
          <Card>
            <p className="text-[0.875rem] text-navy-700/55">
              Nothing here yet. When a visitor sends the partner form, it lands in this list instantly.
            </p>
          </Card>
        ) : null}
      </div>
      <div className="mt-6">
        <Btn kind="ghost" onClick={() => void load()}>
          Refresh
        </Btn>
      </div>
    </>
  );
}
