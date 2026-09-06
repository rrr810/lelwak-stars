"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import type { Database } from "@/lib/database.types";
type PartnerInsert = Database["public"]["Tables"]["partners"]["Insert"];
import { Badge, Btn, Card, Field, inputCls, Notice, PageHead, Spinner, Toggle } from "@/components/admin/ui";

type Partner = {
  id: string;
  name: string;
  slug: string;
  tier: string;
  website: string | null;
  description: string;
  contribution: string | null;
  is_published: boolean;
  sort_order: number;
};

const TIERS = ["seed", "grower", "canopy", "in-kind"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const blank = (): Partner => ({
  id: "",
  name: "",
  slug: "",
  tier: "seed",
  website: "",
  description: "",
  contribution: "",
  is_published: true,
  sort_order: 0,
});

export default function PartnersPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Partner[] | null>(null);
  const [draft, setDraft] = useState<Partner>(blank());
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = () =>
    sb.from("partners").select("*").order("sort_order").then(({ data }) => setRows((data ?? []) as Partner[]));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const set = (c: Partial<Partner>) => setDraft((d) => ({ ...d, ...c }));

  const save = async () => {
    if (!draft.name.trim()) {
      setMsg({ tone: "err", text: "A partner name is required." });
      return;
    }
    const { id: _id, ...rest } = draft;
    void _id;
    const payload: PartnerInsert = { ...rest, tier: draft.tier as PartnerInsert["tier"], slug: draft.slug.trim() || slugify(draft.name), website: draft.website || null, contribution: draft.contribution || null };
    const { error } = draft.id
      ? await sb.from("partners").update(payload).eq("id", draft.id)
      : await sb.from("partners").insert(payload);
    setMsg(error ? { tone: "err", text: error.message } : { tone: "ok", text: draft.id ? "Partner updated." : "Partner added." });
    void load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this partner from the public page?")) return;
    const { error } = await sb.from("partners").delete().eq("id", id);
    setMsg(error ? { tone: "err", text: error.message } : { tone: "ok", text: "Partner removed." });
    if (draft.id === id) setDraft(blank());
    void load();
  };

  if (!rows) return <Spinner />;

  return (
    <>
      <PageHead
        title="Partners"
        sub="Organisations that fund, co-deliver or endorse your work. Shown on the public Partners page — proof you don't work alone."
        action={
          <Btn
            onClick={() => {
              setDraft(blank());
              setMsg(null);
            }}
          >
            + Add partner
          </Btn>
        }
      />
      {msg ? (
        <div className="mb-4">
          <Notice tone={msg.tone}>{msg.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setDraft({ ...r, website: r.website ?? "", contribution: r.contribution ?? "" });
                setMsg(null);
              }}
              className={`flex w-full flex-wrap items-center gap-3 rounded-2xl border p-4 text-left transition ${
                draft.id === r.id ? "border-forest-600 bg-sage-100" : "border-navy-700/10 bg-white hover:border-forest-600/40"
              }`}
            >
              <span className="font-display text-[0.9375rem] font-extrabold text-navy-900">{r.name}</span>
              <Badge tone="navy">{r.tier}</Badge>
              <Badge tone={r.is_published ? "green" : "clay"}>{r.is_published ? "live" : "hidden"}</Badge>
              {r.contribution ? <span className="text-[0.75rem] text-navy-700/55">{r.contribution}</span> : null}
            </button>
          ))}
          {rows.length === 0 ? <p className="text-[0.8125rem] text-navy-700/50">No partners yet.</p> : null}
        </div>

        <Card className="space-y-4 self-start">
          <Field label="Name">
            <input className={inputCls} value={draft.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tier">
              <select className={inputCls} value={draft.tier} onChange={(e) => set({ tier: e.target.value })}>
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <input className={inputCls} type="number" value={draft.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Website">
            <input className={inputCls} value={draft.website ?? ""} onChange={(e) => set({ website: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Who they are">
            <textarea className={inputCls + " min-h-[4rem]"} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label="What they did with you" hint='e.g. "Co-funded uniform outreach at Emdin Primary"'>
            <textarea className={inputCls + " min-h-[3.5rem]"} value={draft.contribution ?? ""} onChange={(e) => set({ contribution: e.target.value })} />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <Toggle checked={draft.is_published} onChange={(v) => set({ is_published: v })} label="Published" />
            <div className="flex gap-2">
              {draft.id ? (
                <Btn kind="danger" onClick={() => void remove(draft.id)}>
                  Remove
                </Btn>
              ) : null}
              <Btn onClick={() => void save()}>{draft.id ? "Save" : "Add"}</Btn>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
