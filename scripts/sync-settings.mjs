#!/usr/bin/env node
/**
 * ============================================================================
 *  Bake Supabase `site_settings` into src/lib/site.ts
 *
 *    SUPABASE_SERVICE_ROLE_KEY=… node scripts/sync-settings.mjs
 *
 *  The public site is a static export, so organisation facts (phone,
 *  registration, socials…) are compiled in. Admins edit them in
 *  /admin/settings; this script rewrites the site config from the database
 *  row so the next push ships them. Run it after the owner saves settings.
 * ============================================================================
 */

import fs from "node:fs/promises";
import path from "node:path";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ncarkchmduwihzoadyiv.supabase.co";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE) {
  console.error("SUPABASE_SERVICE_ROLE_KEY missing");
  process.exit(1);
}

const res = await fetch(`${URL_}/rest/v1/site_settings?id=eq.1&select=*`, {
  headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
});
if (!res.ok) throw new Error(`fetch settings: ${res.status}`);
const [s] = await res.json();
if (!s) {
  console.log("no settings row — nothing to sync");
  process.exit(0);
}

const file = path.resolve("src/lib/site.ts");
let src = await fs.readFile(file, "utf8");

const str = (v) => (v === null || v === undefined ? "" : String(v));

const C = "(?: *\\/\\/[^\\n]*)?"; // optional trailing comment, so re-runs work
const replacements = [
  [new RegExp(`email: "[^"]*",${C}`), `email: "${str(s.contact_email) || "info@lelwakstars.org"}",`],
  [new RegExp(`phone: "[^"]*",${C}`), `phone: "${str(s.contact_phone)}",`],
  [new RegExp(`whatsapp: "[^"]*",${C}`), `whatsapp: "${str(s.whatsapp)}",`],
  [new RegExp(`region: "[^"]*",${C}`), `region: "${str(s.region) || "Kenya"}",`],
  [new RegExp(`addressLine: "[^"]*",${C}`), `addressLine: "${str(s.address_line)}",`],
  [new RegExp(`facebook: "[^"]*",${C}`), `facebook: "${str(s.facebook)}",`],
  [new RegExp(`instagram: "[^"]*",${C}`), `instagram: "${str(s.instagram)}",`],
  [new RegExp(`(^|\\n)  x: "[^"]*",${C}`), `$1  x: "${str(s.x_twitter)}",`],
  [new RegExp(`linkedin: "[^"]*",${C}`), `linkedin: "${str(s.linkedin)}",`],
  [new RegExp(`youtube: "[^"]*",${C}`), `youtube: "${str(s.youtube)}",`],
  [new RegExp(`tiktok: "[^"]*",${C}`), `tiktok: "${str(s.tiktok)}",`],
  [new RegExp(`number: "[^"]*",${C}`), `number: "${str(s.registration_no)}",`],
  [new RegExp(`issuedBy: "[^"]*",${C}`), `issuedBy: "${str(s.issued_by)}",`],
  [new RegExp(`yearFounded: \\d+,${C}`), `yearFounded: ${Number(s.year_founded) || 0},`],
];

let changed = 0;
for (const [re, to] of replacements) {
  if (re.test(src)) {
    src = src.replace(re, to);
    changed++;
  }
}
await fs.writeFile(file, src);
console.log(`  site.ts updated: ${changed}/${replacements.length} fields baked in from site_settings`);
console.log("  commit + push to ship them to the public site.");
