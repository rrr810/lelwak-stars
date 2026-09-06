"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import type { Database } from "@/lib/database.types";
type StoryInsert = Database["public"]["Tables"]["stories"]["Insert"];
import { publicUrl } from "@/lib/data";
import { Badge, Btn, Card, Field, inputCls, Notice, PageHead, Spinner, Toggle } from "@/components/admin/ui";

type Story = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  program: string | null;
  location: string | null;
  activity_date: string | null;
  cover_image: string | null;
  challenge: string;
  action: string;
  outcome: string;
  next_need: string;
  is_featured: boolean;
  is_published: boolean;
};

const PROGRAMS = ["tree-nurseries", "agripreneurship", "school-mentorship", "capacity-building"];

const blank = (): Story => ({
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  program: "tree-nurseries",
  location: "",
  activity_date: "",
  cover_image: null,
  challenge: "",
  action: "",
  outcome: "",
  next_need: "",
  is_featured: false,
  is_published: false,
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

export default function StoriesPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Story[] | null>(null);
  const [photos, setPhotos] = useState<{ path_full: string; path_thumb: string; caption: string }[]>([]);
  const [draft, setDraft] = useState<Story>(blank());
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = () =>
    sb.from("stories").select("*").order("published_at", { ascending: false }).then(({ data }) => {
      setRows((data ?? []) as Story[]);
    });

  useEffect(() => {
    void load();
    sb.from("gallery").select("path_full,path_thumb,caption").eq("is_published", true).order("created_at", { ascending: false }).limit(60).then(({ data }) =>
      setPhotos((data ?? []) as { path_full: string; path_thumb: string; caption: string }[]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const set = (changes: Partial<Story>) => setDraft((d) => ({ ...d, ...changes }));

  const save = async () => {
    if (!draft.title.trim()) {
      setMsg({ tone: "err", text: "A title is required." });
      return;
    }
    const { id: _id, ...rest } = draft;
    void _id;
    const payload: StoryInsert = {
      ...rest,
      program: (draft.program ?? null) as StoryInsert["program"],
      slug: draft.slug.trim() || slugify(draft.title),
      location: draft.location || null,
      activity_date: draft.activity_date || null,
    };
    const { error } = draft.id
      ? await sb.from("stories").update(payload).eq("id", draft.id)
      : await sb.from("stories").insert(payload);
    setMsg(error ? { tone: "err", text: error.message } : { tone: "ok", text: draft.id ? "Story updated." : "Story created." });
    void load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this story? Its photos stay in the gallery.")) return;
    const { error } = await sb.from("stories").delete().eq("id", id);
    setMsg(error ? { tone: "err", text: error.message } : { tone: "ok", text: "Story deleted." });
    if (draft.id === id) setDraft(blank());
    void load();
  };

  if (!rows) return <Spinner />;

  return (
    <>
      <PageHead
        title="Stories"
        sub="The sponsor-facing narrative: challenge → action → outcome → next need. Published stories appear on the site within a minute of the next deploy for their detail page; cards and gallery links update instantly."
        action={
          <Btn
            onClick={() => {
              setDraft(blank());
              setMsg(null);
            }}
          >
            + New story
          </Btn>
        }
      />
      {msg ? (
        <div className="mb-4">
          <Notice tone={msg.tone}>{msg.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* -------------------------------------------------------- list */}
        <div className="space-y-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setDraft({ ...r, activity_date: r.activity_date ?? "", location: r.location ?? "" });
                setMsg(null);
              }}
              className={`block w-full rounded-2xl border p-4 text-left transition ${
                draft.id === r.id ? "border-forest-600 bg-sage-100" : "border-navy-700/10 bg-white hover:border-forest-600/40"
              }`}
            >
              <p className="font-display text-[0.875rem] font-extrabold text-navy-900">{r.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={r.is_published ? "green" : "clay"}>{r.is_published ? "live" : "draft"}</Badge>
                {r.is_featured ? <Badge tone="gold">featured</Badge> : null}
                <Badge tone="navy">{(r.program ?? "—").replace(/-/g, " ")}</Badge>
              </div>
            </button>
          ))}
          {rows.length === 0 ? <p className="text-[0.8125rem] text-navy-700/50">No stories yet.</p> : null}
        </div>

        {/* ------------------------------------------------------- editor */}
        <Card className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Slug" hint="Leave empty to generate from the title.">
              <input className={inputCls} value={draft.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="auto-from-title" />
            </Field>
          </div>
          <Field label="Excerpt" hint="One sentence shown on story cards.">
            <textarea className={inputCls + " min-h-[3.5rem]"} value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
          </Field>
          <Field label="Story body" hint="Blank line = new paragraph.">
            <textarea className={inputCls + " min-h-[9rem]"} value={draft.body} onChange={(e) => set({ body: e.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="The challenge">
              <textarea className={inputCls + " min-h-[4.5rem]"} value={draft.challenge} onChange={(e) => set({ challenge: e.target.value })} />
            </Field>
            <Field label="What we did">
              <textarea className={inputCls + " min-h-[4.5rem]"} value={draft.action} onChange={(e) => set({ action: e.target.value })} />
            </Field>
            <Field label="The outcome">
              <textarea className={inputCls + " min-h-[4.5rem]"} value={draft.outcome} onChange={(e) => set({ outcome: e.target.value })} />
            </Field>
            <Field label="What this needs next" hint="The ask — sponsors read this first.">
              <textarea className={inputCls + " min-h-[4.5rem]"} value={draft.next_need} onChange={(e) => set({ next_need: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Programme">
              <select className={inputCls} value={draft.program ?? ""} onChange={(e) => set({ program: e.target.value || null })}>
                <option value="">— none —</option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input className={inputCls} value={draft.location ?? ""} onChange={(e) => set({ location: e.target.value })} />
            </Field>
            <Field label="Activity date">
              <input className={inputCls} type="date" value={draft.activity_date ?? ""} onChange={(e) => set({ activity_date: e.target.value })} />
            </Field>
          </div>
          <Field label="Cover photo" hint="From the published gallery.">
            <div className="flex gap-3">
              <select
                className={inputCls}
                value={draft.cover_image ?? ""}
                onChange={(e) => set({ cover_image: e.target.value || null })}
              >
                <option value="">— none —</option>
                {photos.map((p) => (
                  <option key={p.path_full} value={p.path_full}>
                    {(p.caption || p.path_full).slice(0, 44)}
                  </option>
                ))}
              </select>
              {draft.cover_image ? (
                <img src={publicUrl(draft.cover_image.replace(/-1600(\.webp)$/, "-480$1"))} alt="" className="h-14 w-20 rounded-lg object-cover" />
              ) : null}
            </div>
          </Field>
          <div className="flex flex-wrap items-center gap-6">
            <Toggle checked={draft.is_published} onChange={(v) => set({ is_published: v })} label="Published" />
            <Toggle checked={draft.is_featured} onChange={(v) => set({ is_featured: v })} label="Featured on home" />
            <div className="ml-auto flex gap-2">
              {draft.id ? (
                <Btn kind="danger" onClick={() => void remove(draft.id)}>
                  Delete
                </Btn>
              ) : null}
              <Btn onClick={() => void save()}>{draft.id ? "Save changes" : "Create story"}</Btn>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
