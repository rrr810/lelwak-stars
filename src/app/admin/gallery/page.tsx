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
  path_full: string;
  path_thumb: string;
  is_featured: boolean;
  is_published: boolean;
  width: number | null;
  height: number | null;
  story_id: string | null;
  alt: string;
};

const CATEGORIES = [
  "tree-nurseries",
  "tree-planting",
  "school-mentorship",
  "youth-training",
  "community-engagement",
  "partnerships",
];

export default function GalleryPage() {
  const { sb } = useAdmin();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [stories, setStories] = useState<{ id: string; title: string }[]>([]);
  const [filter, setFilter] = useState("all");
  const [uploadCat, setUploadCat] = useState("tree-planting");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    sb
      .from("gallery")
      .select("id,category,caption,alt,path_full,path_thumb,is_featured,is_published,width,height,story_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));

  useEffect(() => {
    void load();
    sb.from("stories").select("id,title").order("published_at", { ascending: false }).then(({ data }) =>
      setStories((data ?? []) as { id: string; title: string }[]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const patch = async (id: string, changes: GalleryUpdate) => {
    const { error } = await sb.from("gallery").update(changes).eq("id", id);
    setMsg(error ? { tone: "err", text: error.message } : null);
    void load();
  };

  const onUpload = async (files: FileList | null) => {
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
        : { tone: "ok", text: `${ok} photo${ok === 1 ? "" : "s"} compressed, uploaded and published.` },
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
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Add to category">
            <select className={inputCls + " w-52"} value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <label className="cursor-pointer rounded-xl bg-forest-700 px-4 py-2 text-[0.8125rem] font-bold text-white transition hover:bg-forest-800">
            {busy ? "Compressing & uploading…" : "Choose photos"}
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
          <p className="text-[0.6875rem] leading-relaxed text-navy-700/50">
            JPEG/HEIC/PNG from any phone. Each file becomes a 1600w WebP + a 480w thumb,
            published immediately; edit captions below.
          </p>
        </div>
        {msg ? (
          <div className="mt-4">
            <Notice tone={msg.tone}>{msg.text}</Notice>
          </div>
        ) : null}
      </Card>

      {/* ---------------------------------------------------------- filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1 text-[0.75rem] font-bold transition ${
              filter === c ? "bg-forest-700 text-white" : "bg-white text-navy-700/70 hover:bg-sage-100"
            }`}
          >
            {c === "all" ? `All (${rows.length})` : c.replace(/-/g, " ")}
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
              <Badge tone="navy">{r.category.replace(/-/g, " ")}</Badge>
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
                <select className={inputCls} value={r.category} onChange={(e) => void patch(r.id, { category: e.target.value as GalleryUpdate["category"] })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/-/g, " ")}
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
          <p className="text-[0.875rem] text-navy-700/55">No photos in this category yet — upload the first one above.</p>
        </Card>
      ) : null}
    </>
  );
}
