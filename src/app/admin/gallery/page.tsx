"use client";

import { useEffect, useRef, useState } from "react";
import { deletePhoto, publishPhoto, useAdmin } from "@/lib/admin-client";
import { publicUrl } from "@/lib/data";
import type { Database } from "@/lib/database.types";
type GalleryUpdate = Database["public"]["Tables"]["gallery"]["Update"];
import { Badge, Btn, Card, Field, inputCls, Notice, PageHead, Spinner, Toggle } from "@/components/admin/ui";

type Row = {
  id: string;
  category: string;
  caption: string;
  alt: string;
  path_full: string;
  path_thumb: string;
  is_featured: boolean;
  is_published: boolean;
  width: number | null;
  height: number | null;
  story_id: string | null;
};

type Cat = { id: string; label: string };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export default function GalleryPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [stories, setStories] = useState<{ id: string; title: string }[]>([]);
  const [filter, setFilter] = useState("all");
  const [uploadCat, setUploadCat] = useState("");
  const [newCat, setNewCat] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    Promise.all([
      sb
        .from("gallery")
        .select("id,category,caption,alt,path_full,path_thumb,is_featured,is_published,width,height,story_id")
        .order("created_at", { ascending: false }),
      sb.from("gallery_categories").select("id,label").order("sort_order"),
      sb.from("stories").select("id,title").order("published_at", { ascending: false }),
    ]).then(([g, c, s]) => {
      setRows((g.data ?? []) as Row[]);
      const list = (c.data ?? []) as Cat[];
      setCats(list);
      setStories((s.data ?? []) as { id: string; title: string }[]);
      setUploadCat((cur) => cur || list[0]?.id || "");
    });

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const patch = async (id: string, changes: GalleryUpdate) => {
    const { error } = await sb.from("gallery").update(changes).eq("id", id);
    setMsg(error ? { tone: "err", text: error.message } : null);
    void load();
  };

  const addCategory = async () => {
    const label = newCat.trim();
    if (!label) return;
    const id = slugify(label);
    const { error } = await sb
      .from("gallery_categories")
      .insert({ id, label, sort_order: cats.length + 1 });
    if (error) {
      setMsg({ tone: "err", text: error.code === "23505" ? `“${label}” already exists.` : error.message });
    } else {
      setMsg({ tone: "ok", text: `Category “${label}” added — it now appears here and on the public gallery.` });
      setNewCat("");
    }
    void load();
  };

  const onUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg(null);
    let ok = 0;
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      try {
        await publishPhoto(sb, file, { category: uploadCat });
        ok++;
      } catch (e) {
        errors.push(`${file.name}: ${(e as Error).message}`);
      }
    }
    setBusy(false);
    setMsg(
      errors.length
        ? { tone: "err", text: `${ok} uploaded, ${errors.length} failed — ${errors[0]}` }
        : { tone: "ok", text: `${ok} photo${ok === 1 ? "" : "s"} compressed, uploaded and published to “${cats.find((c) => c.id === uploadCat)?.label ?? uploadCat}”.` },
    );
    if (fileRef.current) fileRef.current.value = "";
    void load();
  };

  const remove = async (row: Row) => {
    if (!window.confirm("Delete this photo from the site and storage? This cannot be undone.")) return;
    try {
      await deletePhoto(sb, row);
      setMsg({ tone: "ok", text: "Photo deleted." });
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    }
    void load();
  };

  const list = (rows ?? []).filter((r) => filter === "all" || r.category === filter);

  if (!rows) return <Spinner />;

  return (
    <>
      <PageHead title="Gallery" sub="Upload, caption, categorise and publish photos. Uploads are compressed to WebP in your browser before they leave it — EXIF and GPS never reach the server." />

      {/* ------------------------------------------------------- upload bar */}
      <Card
        className={`mb-6 transition ${dragging ? "ring-4 ring-forest-600/40" : ""}`}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void onUpload(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragging ? "border-forest-600 bg-sage-100" : "border-navy-700/15 bg-cream-100"
          }`}
        >
          <p className="font-display text-lg font-extrabold text-navy-900">
            {dragging ? "Drop them — I've got it from here 🌱" : "Drag photos here"}
          </p>
          <p className="mx-auto mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-navy-700/60">
            Drop as many as you like at once — phone JPEGs, WhatsApp pictures,
            camera files. Each becomes a compressed WebP + thumbnail and goes
            live on the public gallery immediately.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Field label="Into category">
              <select className={inputCls + " w-52"} value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="mt-5 cursor-pointer rounded-xl bg-forest-700 px-4 py-2 text-[0.8125rem] font-bold text-white transition hover:bg-forest-800">
              {busy ? "Compressing & uploading…" : "…or choose files"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={busy}
                onChange={(e) => void onUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* --------------------------------------------- add a category */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-navy-700/8 pt-4">
          <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Missing a category?
          </span>
          <input
            className={inputCls + " w-56"}
            placeholder="e.g. Fundraisers"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void addCategory()}
          />
          <Btn kind="ghost" onClick={() => void addCategory()}>
            + Add category
          </Btn>
          <span className="text-[0.6875rem] text-navy-700/45">
            Appears here and on the public site instantly.
          </span>
        </div>

        {msg ? (
          <div className="mt-4">
            <Notice tone={msg.tone}>{msg.text}</Notice>
          </div>
        ) : null}
      </Card>

      {/* ---------------------------------------------------------- filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-[0.75rem] font-bold transition ${
            filter === "all" ? "bg-forest-700 text-white" : "bg-white text-navy-700/70 hover:bg-sage-100"
          }`}
        >
          All ({rows.length})
        </button>
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`rounded-full px-3 py-1 text-[0.75rem] font-bold transition ${
              filter === c.id ? "bg-forest-700 text-white" : "bg-white text-navy-700/70 hover:bg-sage-100"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3 p-4">
            <img
              src={publicUrl(r.path_thumb)}
              alt={r.caption || r.category}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div className="flex items-center gap-2">
              <Badge tone="navy">{cats.find((c) => c.id === r.category)?.label ?? r.category}</Badge>
              {r.is_featured ? <Badge tone="gold">featured</Badge> : null}
              {!r.is_published ? <Badge tone="clay">hidden</Badge> : null}
            </div>
            <textarea
              className={inputCls + " min-h-[4rem] resize-y"}
              defaultValue={r.caption}
              placeholder="Caption — what is happening, where, with whom?"
              onBlur={(e) => {
                if (e.target.value !== r.caption) void patch(r.id, { caption: e.target.value, alt: e.target.value });
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select className={inputCls} value={r.category} onChange={(e) => void patch(r.id, { category: e.target.value })}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Attach to story">
                <select
                  className={inputCls}
                  value={r.story_id ?? ""}
                  onChange={(e) => void patch(r.id, { story_id: e.target.value || null })}
                >
                  <option value="">— none —</option>
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title.slice(0, 34)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Toggle checked={r.is_published} onChange={(v) => void patch(r.id, { is_published: v })} label="Published" />
              <Toggle checked={r.is_featured} onChange={(v) => void patch(r.id, { is_featured: v })} label="Featured" />
              <Btn kind="danger" onClick={() => void remove(r)}>
                Delete
              </Btn>
            </div>
          </Card>
        ))}
      </div>
      {list.length === 0 ? (
        <Card>
          <p className="text-[0.875rem] text-navy-700/55">No photos in this category yet — drag the first ones above.</p>
        </Card>
      ) : null}
    </>
  );
}
