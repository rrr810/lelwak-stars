"use client";

/**
 * Enquiries — the simple version.
 * One card per message, readable at a glance: who wrote, what they said,
 * a big Reply button, and three plain status chips (New / Replied / Done).
 * Statuses map onto the database enum behind the scenes.
 */

import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import type { Database } from "@/lib/database.types";
type InquiryUpdate = Database["public"]["Tables"]["inquiries"]["Update"];
import { Btn, Card, Notice, PageHead, Spinner, inputCls } from "@/components/admin/ui";

type Inquiry = {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  country: string | null;
  message: string;
  budget_range: string | null;
  status: string;
  is_priority: boolean;
  notes: string | null;
  submitted_at: string;
};

const GROUPS = [
  { id: "new", label: "New", statuses: ["new"] },
  { id: "talking", label: "Replied / talking", statuses: ["contacted", "in-discussion"] },
  { id: "done", label: "Done", statuses: ["won", "lost"] },
  { id: "hidden", label: "Hidden", statuses: ["archived"] },
];

const CHIP_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Replied",
  "in-discussion": "In talks",
  won: "Done — yes",
  lost: "Done — no",
  archived: "Hidden",
};

const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function InquiriesPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [tab, setTab] = useState("new");
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
    setMsg(error ? `Could not save notes: ${error.message}` : null);
    void load();
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, talking: 0, done: 0, hidden: 0 };
    for (const r of rows ?? []) {
      const g = GROUPS.find((g) => g.statuses.includes(r.status));
      if (g) c[g.id]++;
    }
    return c;
  }, [rows]);

  const list = (rows ?? []).filter((r) => {
    const g = GROUPS.find((g) => g.id === tab);
    return g ? g.statuses.includes(r.status) : true;
  });

  if (!rows) return <Spinner />;

  return (
    <>
      <PageHead
        title="Enquiries"
        sub="Messages from people who want to work with you. Read, reply by email, then move the card along."
      />
      {msg ? (
        <div className="mb-4">
          <Notice tone="err">{msg}</Notice>
        </div>
      ) : null}

      {/* ---------------------------------------------------------- tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setTab(g.id)}
            className={`rounded-full px-4 py-1.5 text-[0.8125rem] font-bold transition ${
              tab === g.id ? "bg-forest-700 text-white" : "bg-white text-navy-700/70 hover:bg-sage-100"
            }`}
          >
            {g.label}
            <span className={`ml-2 rounded-full px-1.5 text-[0.6875rem] ${tab === g.id ? "bg-white/20" : "bg-navy-700/10"}`}>
              {counts[g.id]}
            </span>
          </button>
        ))}
      </div>

      {/* --------------------------------------------------------- cards */}
      <div className="space-y-5">
        {list.map((r) => (
          <Card key={r.id} className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-lg font-extrabold text-navy-900">{r.name}</span>
              {r.organisation ? <span className="text-[0.875rem] font-medium text-navy-700/65">{r.organisation}</span> : null}
              {r.is_priority ? (
                <span className="rounded-full bg-gold-600/15 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-gold-600">
                  ★ sponsor / grant lead
                </span>
              ) : null}
              <span className="ml-auto text-[0.75rem] text-navy-700/45">{ago(r.submitted_at)}</span>
            </div>

            <p className="whitespace-pre-wrap rounded-xl bg-cream-100 p-4 text-[0.9375rem] leading-relaxed text-navy-700/90">
              {r.message}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-navy-700/70">
              <span>
                Wants: <b className="text-navy-900">{r.inquiry_type}</b>
              </span>
              {r.budget_range ? (
                <span>
                  Budget: <b className="text-navy-900">{r.budget_range}</b>
                </span>
              ) : null}
              {r.country ? <span>From {r.country}</span> : null}
              {r.phone ? (
                <a className="font-bold text-forest-700 underline" href={`tel:${r.phone}`}>
                  {r.phone}
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-navy-700/8 pt-4">
              <a
                href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: your message to Lelwak Stars CBO`)}&body=${encodeURIComponent(`Hello ${r.name},\n\nThank you for writing to Lelwak Stars CBO…\n\n`)}`}
                className="rounded-xl bg-forest-700 px-4 py-2 text-[0.8125rem] font-bold text-white transition hover:bg-forest-800"
              >
                ✉ Reply to {r.email.split("@")[0]}
              </a>
              <span className="text-[0.75rem] font-bold uppercase tracking-wide text-navy-700/45">Move to:</span>
              {(["new", "contacted", "in-discussion", "won", "lost"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => void setStatus(r.id, st)}
                  className={`rounded-full px-3 py-1 text-[0.75rem] font-bold transition ${
                    r.status === st
                      ? "bg-forest-700 text-white"
                      : "bg-navy-700/8 text-navy-700/70 hover:bg-sage-100"
                  }`}
                >
                  {CHIP_LABEL[st]}
                </button>
              ))}
              <button
                onClick={() => void setStatus(r.id, r.status === "archived" ? "new" : "archived")}
                className="ml-auto text-[0.75rem] font-bold text-navy-700/45 underline-offset-2 hover:text-clay-500 hover:underline"
              >
                {r.status === "archived" ? "unhide" : "hide"}
              </button>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-[0.75rem] font-bold text-navy-700/50 hover:text-navy-700">
                Your private notes (only admins see these)
              </summary>
              <input
                className={inputCls + " mt-2"}
                defaultValue={r.notes ?? ""}
                placeholder="e.g. replied 12/09, sent proposal pack"
                onBlur={(e) => {
                  if (e.target.value !== (r.notes ?? "")) void saveNotes(r.id, e.target.value);
                }}
              />
            </details>
          </Card>
        ))}

        {list.length === 0 ? (
          <Card>
            <p className="text-[0.9375rem] text-navy-700/60">
              {tab === "new"
                ? "No unread messages. When someone sends the partner form on your site, it appears here instantly — and (once Resend is wired) in your Gmail inbox too."
                : "Nothing in this pile yet."}
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
