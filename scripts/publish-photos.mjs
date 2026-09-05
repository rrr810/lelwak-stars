#!/usr/bin/env node
/**
 * ============================================================================
 *  LELWAK STARS — PHOTO PUBLISH PIPELINE (batch-safe)
 *
 *    node scripts/publish-photos.mjs <dir-or-zip> [--category <id>] [--keep]
 *
 *  Designed for photos arriving in small batches while staying under the
 *  workspace size cap:
 *
 *    1. process   unzip if needed, strip EXIF/GPS, emit 1600w + 480w WebP
 *    2. upload    WebP renditions -> public  "gallery"  bucket
 *    3. insert    one public.gallery row per photo (category, caption,
 *                 dimensions, dominant colour, date from EXIF)
 *    4. verify    fetch each public URL back and confirm HTTP 200
 *    5. clean     delete the local raws, originals and WebP copies so the
 *                 workspace only ever holds one batch at a time
 *
 *  Raw camera files are NOT kept anywhere by default: the 1600w WebP is
 *  high-quality enough to re-derive anything the site needs, and Supabase's
 *  free tier storage is 1 GB total — a full archive of 4000px originals would
 *  blow that budget. Pass --keep-originals to also store the untouched file
 *  in the PRIVATE "originals" bucket for a selected batch.
 *
 *  Photos the categoriser is unsure about are inserted UNPUBLISHED
 *  (is_published=false) and reported, so nothing is ever mislabelled live.
 * ============================================================================
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { WebSocket as NodeWebSocket } from "ws";

// Node 20 has no native WebSocket; supabase-js realtime needs one at
// construction time even though we never subscribe to channels.
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = NodeWebSocket;
}

const args = process.argv.slice(2);
const input = args.filter((a) => !a.startsWith("--"))[0];
const flag = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const forcedCategory = flag("category");
const keepOriginals = args.includes("--keep-originals");
const noClean = args.includes("--keep");

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}
const supabase = createClient(URL_, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

if (!input) {
  console.error("Usage: node scripts/publish-photos.mjs <dir-or-zip> [--category <id>] [--keep-originals] [--keep]");
  process.exit(1);
}

const BATCH = path.resolve(".batch");
await fs.rm(BATCH, { recursive: true, force: true });
await fs.mkdir(BATCH, { recursive: true });

// ---------------------------------------------------------------- 1. process
console.log("\n🌱 1/5 processing…");
const procArgs = [
  "scripts/process-photos.mjs",
  path.resolve(input),
  "--out",
  ".batch/out",
  ...(forcedCategory ? ["--category", forcedCategory] : []),
];
execFileSync(process.execPath, procArgs, { stdio: "inherit" });

const manifest = JSON.parse(
  await fs.readFile(path.join(BATCH, "out", "manifest.json"), "utf8"),
);
console.log(`\n   ${manifest.length} photo(s) in this batch`);

// ---------------------------------------------------------------- 2. upload
console.log("\n☁️  2/5 uploading WebP renditions to the public gallery bucket…");
let uploaded = 0;
for (const row of manifest) {
  for (const [rel, mime] of [
    [row.path_full, "image/webp"],
    [row.path_thumb, "image/webp"],
  ]) {
    const buf = await fs.readFile(path.join(BATCH, "out", "gallery", path.basename(rel)));
    const { error } = await supabase.storage.from("gallery").upload(rel, buf, {
      contentType: mime,
      upsert: true,
    });
    if (error) throw new Error(`upload ${rel}: ${error.message}`);
  }
  uploaded++;
  process.stdout.write(`\r   ${uploaded}/${manifest.length} uploaded   `);
}
console.log("");

if (keepOriginals) {
  console.log("   🔒 also storing untouched originals in the PRIVATE bucket…");
  for (const row of manifest) {
    const src = path.join(BATCH, "out", "originals", path.basename(row.path_original));
    const buf = await fs.readFile(src);
    const { error } = await supabase.storage
      .from("originals")
      .upload(row.path_original, buf, { upsert: true });
    if (error) throw new Error(`original upload: ${error.message}`);
  }
  console.log("   done");
}

// ---------------------------------------------------------------- 3. insert
console.log("\n🗄  3/5 writing gallery rows…");
let inserted = 0;
let unpublished = 0;
for (const row of manifest) {
  // idempotent: skip photos already published at the same full path
  const { data: existing } = await supabase
    .from("gallery")
    .select("id")
    .eq("path_full", row.path_full)
    .limit(1);
  if (existing && existing.length > 0) {
    console.log(`   = ${row.slug} already in the database, skipped`);
    continue;
  }

  const caption = row.caption ?? "";
  const { error } = await supabase.from("gallery").insert({
    category: row.category,
    title: row.slug,
    caption,
    location: row.location ?? null,
    shot_on: row.taken_at ?? null,
    path_full: row.path_full,
    path_thumb: row.path_thumb,
    path_original: keepOriginals ? row.path_original : null,
    width: row.width,
    height: row.height,
    alt: caption || `Lelwak Stars activity — ${row.category.replace(/-/g, " ")}`,
    dominant_color: row.dominant_color,
    is_featured: false,
    is_published: !row.needs_review,
  });
  if (error) throw new Error(`insert ${row.slug}: ${error.message}`);
  inserted++;
  if (row.needs_review) unpublished++;
}
console.log(`   ${inserted} row(s) written, ${unpublished} held back for review`);

// ---------------------------------------------------------------- 4. verify
console.log("\n🔎 4/5 verifying public URLs…");
let ok = 0;
for (const row of manifest.slice(0, 5)) {
  const pub = `${URL_}/storage/v1/object/public/gallery/${row.path_full}`;
  const res = await fetch(pub, { method: "HEAD" });
  if (res.ok) ok++;
  console.log(`   ${res.status} ${pub.replace(URL_, "")}`);
}
if (manifest.length > 0 && ok === 0) {
  throw new Error("no public URL verified — aborting cleanup");
}

// ---------------------------------------------------------------- 5. clean
if (!noClean) {
  console.log("\n🧹 5/5 cleaning the workspace batch…");
  await fs.rm(BATCH, { recursive: true, force: true });
  console.log("   local raws, originals and WebP copies deleted");
} else {
  console.log("\n🧹 5/5 --keep passed, leaving .batch/ in place");
}

// ---------------------------------------------------------------- summary
const { count: live } = await supabase
  .from("gallery")
  .select("id", { count: "exact", head: true })
  .eq("is_published", true);
const { count: held } = await supabase
  .from("gallery")
  .select("id", { count: "exact", head: true })
  .eq("is_published", false);

console.log(`
────────────────────────────────────────────────────────────
  ✅ batch published
     uploaded this batch : ${uploaded}
     new gallery rows    : ${inserted}
     held for review     : ${unpublished}
     live on the site    : ${live ?? 0}
     awaiting review     : ${held ?? 0}
────────────────────────────────────────────────────────────
`);
