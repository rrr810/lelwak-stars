"use client";

/**
 * Browser-side admin data layer.
 *
 * Auth is Supabase Auth (email + password); every write goes through PostgREST
 * with the signed-in user's JWT, and Row Level Security limits writes to rows
 * in public.admin_members / public.admin_users (is_staff() / is_admin()).
 * Anonymous visitors keep read-only + enquiry-insert access, exactly as before.
 *
 * Photo uploads are compressed IN THE BROWSER before they touch Storage:
 * canvas re-encode to WebP at 1600w (full) and 480w (thumb), which also strips
 * EXIF/GPS because canvas pixels carry no metadata. Same output contract as
 * scripts/publish-photos.mjs, so gallery rows look identical either way.
 */

import { useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAdmin() {
  const sb = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  const signIn = async (email: string, password: string) => {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };
  const signOut = async () => {
    await sb.auth.signOut();
  };
  const changePassword = async (password: string) => {
    const { error } = await sb.auth.updateUser({ password });
    return error?.message ?? null;
  };

  return { sb, session, loading, signIn, signOut, changePassword };
}

export type AdminHook = ReturnType<typeof useAdmin>;

/* ------------------------------------------------------------------ images */

export interface CompressedPhoto {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  color: string;
}

function drawScaled(src: ImageBitmap, maxW: number) {
  const scale = Math.min(1, maxW / src.width);
  const w = Math.round(src.width * scale);
  const h = Math.round(src.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(src, 0, 0, w, h);
  return { canvas, w, h };
}

function avgColor(src: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, 8, 8);
  const d = ctx.getImageData(0, 0, 8, 8).data;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
  }
  const n = d.length / 4;
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("webp encode failed"))),
      "image/webp",
      quality,
    ),
  );
}

/** Resize + WebP-encode one file. EXIF/GPS never survives the canvas. */
export async function compressPhoto(file: File, quality = 0.8): Promise<CompressedPhoto> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const full = drawScaled(bmp, 1600);
  const thumb = drawScaled(bmp, 480);
  const [fullBlob, thumbBlob] = await Promise.all([
    toBlob(full.canvas, quality),
    toBlob(thumb.canvas, 0.72),
  ]);
  const color = avgColor(bmp);
  bmp.close();
  return {
    full: fullBlob,
    thumb: thumbBlob,
    width: full.w,
    height: full.h,
    color,
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "photo";

/**
 * Compress + upload + insert one gallery row. Returns the inserted row id.
 * Mirrors scripts/publish-photos.mjs paths: webp/<slug>-<hash>-1600.webp etc.
 */
export async function publishPhoto(
  sb: SupabaseClient,
  file: File,
  opts: { category: string; caption?: string; storyId?: string | null },
) {
  const photo = await compressPhoto(file);
  const base = slugify(file.name.replace(/\.[a-z0-9]+$/i, ""));
  const hash = Math.random().toString(16).slice(2, 10);
  const slug = `${base}-${hash}`;
  const pathFull = `webp/${slug}-1600.webp`;
  const pathThumb = `webp/${slug}-480.webp`;

  for (const [path, blob] of [
    [pathFull, photo.full],
    [pathThumb, photo.thumb],
  ] as const) {
    const { error } = await sb.storage.from("gallery").upload(path, blob, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw new Error(`upload ${path}: ${error.message}`);
  }

  const caption = opts.caption ?? "";
  const { data, error } = await sb
    .from("gallery")
    .insert({
      category: opts.category,
      title: slug,
      caption,
      alt: caption || `Lelwak Stars activity — ${opts.category.replace(/-/g, " ")}`,
      path_full: pathFull,
      path_thumb: pathThumb,
      width: photo.width,
      height: photo.height,
      dominant_color: photo.color,
      story_id: opts.storyId ?? null,
      is_featured: false,
      is_published: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(`insert: ${error.message}`);
  return data.id as string;
}

/** Remove storage objects + the gallery row. */
export async function deletePhoto(sb: SupabaseClient, row: { id: string; path_full: string; path_thumb: string }) {
  await sb.storage.from("gallery").remove([row.path_full, row.path_thumb]);
  const { error } = await sb.from("gallery").delete().eq("id", row.id);
  if (error) throw new Error(error.message);
}
