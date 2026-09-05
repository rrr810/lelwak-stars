#!/usr/bin/env node
/**
 * ============================================================================
 *  LELWAK STARS — PHOTO PIPELINE
 *  `node scripts/process-photos.mjs <input-dir-or-zip> [--category <id>]`
 * ============================================================================
 *
 *  WHAT IT DOES
 *   1. Unzips if given a .zip (uses the system `unzip`).
 *   2. Finds every JPEG / PNG / HEIC / WebP.
 *   3. Strips EXIF + GPS metadata (privacy — school children's photos).
 *   4. Writes two optimised WebP renditions per photo:
 *        out/gallery/<slug>-1600.webp   (full, for lightbox / hero)
 *        out/gallery/<slug>-480.webp    (thumb, for the grid)
 *      and keeps the untouched original in out/originals/
 *   5. Samples the dominant colour for a blur-up placeholder.
 *   6. Writes out/manifest.json  — the rows to insert into public.gallery.
 *   7. Writes out/insert-gallery.sql — paste straight into the Supabase
 *      SQL Editor once images are uploaded.
 *
 *  CATEGORY TAGGING
 *   --category <id>   tag everything in this batch
 *   or put photos in folders named after a category and they're tagged
 *   automatically. Valid categories:
 *     tree-nurseries, tree-planting, school-mentorship,
 *     youth-training, community-engagement, partnerships
 *   Untagged photos land in `community-engagement` and are flagged
 *   "needs_review": true in the manifest so nothing is guessed silently.
 *
 *  WHY IT MATTERS
 *   A 300-photo phone archive is typically ~1.2 GB of 4000×3000 JPEGs.
 *   This pipeline turns that into ~35 MB of WebP that loads instantly on a
 *   3G connection in the field — without looking soft on a sponsor's
 *   4K monitor.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CATEGORIES = [
  "tree-nurseries",
  "tree-planting",
  "school-mentorship",
  "youth-training",
  "community-engagement",
  "partnerships",
];

const IMAGE_EXT = /\.(jpe?g|png|heic|heif|webp|avif|tif?f|bmp)$/i;

// ---------------------------------------------------------------- args
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const input = positional[0];
const forcedCategory = getFlag("category");
const quality = Number(getFlag("quality") ?? 78);
const fullWidth = Number(getFlag("width") ?? 1600);
const thumbWidth = Number(getFlag("thumb-width") ?? 480);
const outDir = getFlag("out") ?? "out";

if (!input) {
  console.error(`
Usage:
  node scripts/process-photos.mjs ./photos.zip
  node scripts/process-photos.mjs ./photos --category tree-planting
  node scripts/process-photos.mjs ./photos --quality 82 --width 1800

Flags:
  --category <id>    force a category on this batch
  --quality <n>      WebP quality, 1-100 (default 78)
  --width <n>        full-size max width px (default 1600)
  --thumb-width <n>  thumbnail max width px (default 480)
  --out <dir>        output directory (default "out")
`);
  process.exit(1);
}

function getFlag(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

// ---------------------------------------------------------------- helpers
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "photo";

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^(out|node_modules|\.git|__MACOSX|\.DS_Store)$/i.test(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile() && IMAGE_EXT.test(entry.name) && !entry.name.startsWith(".")) {
      yield { full, rel: path.relative(dir, full) };
    }
  }
}

/** Average colour of a downscaled version — used as a CSS blur-up backdrop. */
async function dominantColor(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(8, 8, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0, g = 0, b = 0;
  const n = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
  }
  const toHex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Infer a category from the folder the photo sat in. */
function categoryFromPath(rel) {
  const parts = rel.split(path.sep).map((p) => slugify(p));
  for (const p of parts) {
    const hit = CATEGORIES.find((c) => p === c || p.includes(c) || c.includes(p));
    if (hit) return { category: hit, inferred: true };
  }
  // loose keyword matching on filenames/folders
  const joined = parts.join(" ").toLowerCase();
  const keywords = [
    [/nursery|nurseries|seedling bed|polythene/, "tree-nurseries"],
    [/plant|planting|reforest|sapling/, "tree-planting"],
    [/school|pupil|student|classroom|mentor|learner/, "school-mentorship"],
    [/training|workshop|agribusiness|agripreneur|cohort/, "youth-training"],
    [/chief|admin|baraza|meeting|official|partner|sponsor|mou/, "partnerships"],
    [/community|group|youth|members|cleanup|campaign/, "community-engagement"],
  ];
  for (const [re, cat] of keywords) if (re.test(joined)) return { category: cat, inferred: true };
  return { category: "community-engagement", inferred: false };
}

async function ensure(p) {
  await fs.mkdir(p, { recursive: true });
}

function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

// ---------------------------------------------------------------- main
async function main() {
  let sourceDir = path.resolve(input);
  let tempZipDir = null;

  // Unzip when handed an archive
  if (/\.zip$/i.test(input)) {
    tempZipDir = path.join(path.dirname(sourceDir), `.unzipped-${Date.now()}`);
    await ensure(tempZipDir);
    console.log(`\n📦 Unzipping ${path.basename(sourceDir)} …`);
    execFileSync("unzip", ["-q", "-o", sourceDir, "-d", tempZipDir], { stdio: "inherit" });
    sourceDir = tempZipDir;
  }

  const galleryDir = path.join(outDir, "gallery");
  const originalsDir = path.join(outDir, "originals");
  await ensure(galleryDir);
  await ensure(originalsDir);

  console.log(`\n🌱 Lelwak Stars photo pipeline`);
  console.log(`   source : ${sourceDir}`);
  console.log(`   output : ${outDir}/`);
  console.log(`   quality: ${quality} · full ≤${fullWidth}px · thumb ≤${thumbWidth}px\n`);

  const manifest = [];
  let totalIn = 0;
  let totalOut = 0;
  let skipped = 0;
  let n = 0;

  for await (const { full, rel } of walk(sourceDir)) {
    n++;
    const label = `[${String(n).padStart(3, "0")}] ${rel}`;
    try {
      const buf = await fs.readFile(full);
      totalIn += buf.byteLength;

      const meta = await sharp(buf, { failOn: "none" }).metadata();
      if (!meta.width || !meta.height) throw new Error("unreadable dimensions");

      const cat = forcedCategory
        ? { category: forcedCategory, inferred: true }
        : categoryFromPath(rel);

      if (!CATEGORIES.includes(cat.category)) {
        console.warn(`   ⚠ unknown category "${cat.category}" → community-engagement`);
        cat.category = "community-engagement";
      }

      const base = slugify(path.basename(rel, path.extname(rel)));
      const hash = createHash("sha1").update(buf).digest("hex").slice(0, 8);
      const slug = `${base}-${hash}`;

      const fullName = `${slug}-${fullWidth}.webp`;
      const thumbName = `${slug}-${thumbWidth}.webp`;

      // strip EXIF/GPS automatically — .rotate() applies orientation then drops metadata
      const fullBuf = await sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width: fullWidth, height: fullWidth, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toBuffer();

      const thumbBuf = await sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width: thumbWidth, height: thumbWidth, fit: "inside", withoutEnlargement: true })
        .webp({ quality: Math.min(quality + 4, 90), effort: 5 })
        .toBuffer();

      await fs.writeFile(path.join(galleryDir, fullName), fullBuf);
      await fs.writeFile(path.join(galleryDir, thumbName), thumbBuf);

      // keep the original untouched but private
      const origName = `${slug}${path.extname(rel)}`;
      await fs.copyFile(full, path.join(originalsDir, origName));

      const outMeta = await sharp(fullBuf).metadata();
      totalOut += fullBuf.byteLength + thumbBuf.byteLength;

      manifest.push({
        slug,
        source: rel,
        category: cat.category,
        category_inferred: cat.inferred,
        needs_review: !cat.inferred,
        path_full: `webp/${fullName}`,
        path_thumb: `webp/${thumbName}`,
        path_original: `originals/${origName}`,
        width: outMeta.width ?? meta.width,
        height: outMeta.height ?? meta.height,
        dominant_color: await dominantColor(buf),
        original_bytes: buf.byteLength,
        webp_bytes: fullBuf.byteLength + thumbBuf.byteLength,
        // exif date if present (before we strip it)
        taken_at: meta.exif ? extractExifDate(buf) : null,
      });

      const saved = 100 - ((fullBuf.byteLength + thumbBuf.byteLength) / buf.byteLength) * 100;
      process.stdout.write(
        `\r   ${label.slice(0, 58).padEnd(58)} ${meta.width}×${meta.height} → ${
          outMeta.width
        }×${outMeta.height}  ${bytes(buf.byteLength)} → ${bytes(
          fullBuf.byteLength + thumbBuf.byteLength,
        )} (${saved.toFixed(0)}% saved)  ` + `[${cat.category}]   `,
      );
    } catch (err) {
      skipped++;
      console.error(`\n   ✗ ${rel}: ${err.message}`);
    }
  }

  if (n === 0) {
    console.error("No images found. Check the path or unzip the archive first.");
    process.exit(1);
  }

  await fs.writeFile(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  await fs.writeFile(path.join(outDir, "insert-gallery.sql"), buildSql(manifest));

  const needsReview = manifest.filter((m) => m.needs_review).length;

  console.log(`\n
────────────────────────────────────────────────────────────
  ✅ Processed ${manifest.length} photo${manifest.length === 1 ? "" : "s"}${skipped ? ` · ${skipped} skipped` : ""}
  📉 ${bytes(totalIn)} → ${bytes(totalOut)}  (${(100 - (totalOut / totalIn) * 100).toFixed(1)}% smaller)
  📁 ${galleryDir}/      ← upload these to the public "gallery" bucket
  🔒 ${originalsDir}/    ← upload these to the private "originals" bucket
  📄 ${outDir}/manifest.json
  📄 ${outDir}/insert-gallery.sql   ← paste into Supabase SQL Editor
${needsReview ? `  ⚠️  ${needsReview} photo(s) could not be categorised automatically —
     they are marked "needs_review" in the manifest. Check those.` : ""}
────────────────────────────────────────────────────────────
`);

  if (tempZipDir) await fs.rm(tempZipDir, { recursive: true, force: true });
}

function extractExifDate(buf) {
  // crude DateTimeOriginal scan — good enough for ordering, not for precision
  const m = buf.subarray(0, 128 * 1024).toString("latin1")
    .match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function sqlStr(v) {
  if (v === null || v === undefined) return "null";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function buildSql(rows) {
  const values = rows.map((r) => {
    const cat = CATEGORIES.includes(r.category) ? r.category : "community-engagement";
    return `  (${sqlStr(r.slug)}, ${sqlStr(cat)}::gallery_category, ${sqlStr(
      r.path_full,
    )}, ${sqlStr(r.path_thumb)}, ${sqlStr(r.path_original)}, ${
      r.width ?? "null"
    }, ${r.height ?? "null"}, ${sqlStr(r.dominant_color)}, ${sqlStr(
      r.taken_at,
    )}::date, ${r.needs_review ? "false" : "true"})`;
  });

  return `-- =====================================================================
-- Lelwak Stars — gallery inserts (generated by scripts/process-photos.mjs)
-- ${rows.length} photographs.
--
-- BEFORE RUNNING: upload out/gallery/webp/* to the public  "gallery"   bucket
--                 upload out/originals/*    to the private "originals" bucket
--
-- Columns: id, category, path_full, path_thumb, path_original,
--          width, height, dominant_color, shot_on, is_published
-- Rows needing review are inserted UNPUBLISHED so they never show publicly
-- until someone has captioned them.
-- =====================================================================

insert into public.gallery
  (id, category, path_full, path_thumb, path_original, width, height, dominant_color, shot_on, is_published)
values
${values.join(",\n")}
on conflict (id) do update set
  path_thumb = excluded.path_thumb,
  path_full  = excluded.path_full,
  width      = excluded.width,
  height     = excluded.height,
  dominant_color = excluded.dominant_color;

-- How many are waiting for a caption / category check:
select count(*) as needs_review from public.gallery where is_published = false;
`;
}

main().catch((err) => {
  console.error("\n💥 Pipeline failed:", err);
  process.exit(1);
});
