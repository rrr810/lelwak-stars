#!/usr/bin/env node
/**
 * Admin dashboard + analytics beacon E2E (run against the local static export).
 *   node tests/admin-e2e.mjs
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *      SUPABASE_SERVICE_ROLE_KEY, ADMIN_TEMP_PASSWORD
 */

import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://127.0.0.1:3999/lelwak-stars";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PW = process.env.ADMIN_TEMP_PASSWORD;
const EMAIL = "admin@lelwakstars.org";

const rest = async (path) => {
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
};

let pass = 0;
let fail = 0;
const check = (name, ok, extra = "") => {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${extra}`);
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shotDir = "/home/user/screenshots";
fs.mkdirSync(shotDir, { recursive: true });

/* ---------------------------------------------------------- 1. beacon */
console.log("\n1. Analytics beacon");
const before = (await rest("page_views?select=id")).length;
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const after = await rest("page_views?select=id,path,session_id,viewport_w&order=created_at.desc&limit=1");
check("page view inserted on home visit", after.length === 1 && after[0].path === "/", JSON.stringify(after[0] ?? {}));
check("session id recorded", !!after[0]?.session_id);
check("viewport width recorded", after[0]?.viewport_w === 1440, String(after[0]?.viewport_w));

await page.goto(`${BASE}/programs`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const sameSid = await rest("page_views?select=session_id&order=created_at.desc&limit=1");
check("same visitor keeps one session id across routes", sameSid[0]?.session_id === after[0]?.session_id);

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const adminLeak = await rest("page_views?select=path&path=like./admin*&limit=1");
check("admin screens never recorded", adminLeak.length === 0);

/* ---------------------------------------------------------- 2. login */
console.log("\n2. Login gate");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
check("login form shown when signed out", true);
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', "definitely-wrong-pw");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
const errText = await page.textContent("body");
check("wrong password rejected with message", /invalid|error|credentials/i.test(errText ?? ""));

await page.fill('input[type="password"]', PW);
await page.click('button[type="submit"]');
await page.waitForSelector('text=Overview', { timeout: 20000 });
check("sign-in works with admin account", true);

/* ------------------------------------------------------- 3. overview */
console.log("\n3. Overview + analytics");
await page.waitForTimeout(4000);
const body = await page.textContent("body");
check("overview shows page-view stats", /Page views/i.test(body ?? ""));
check("overview shows visitors count", /Visitors/i.test(body ?? ""));
check("overview shows live content counts", /Live content/i.test(body ?? ""));
check("30-day chart rendered", (await page.locator('svg[aria-label*="Views per day"]').count()) === 1);
await page.screenshot({ path: `${shotDir}/admin-overview.jpg`, type: "jpeg", quality: 82, fullPage: true });

/* ------------------------------------------------------- 4. galleries */
console.log("\n4. Gallery manager");
await page.click('a[href="/lelwak-stars/admin/gallery"]');
await page.waitForSelector("img", { timeout: 20000 });
await page.waitForTimeout(3000);
const imgs = await page.locator("main img").count();
check(`gallery lists photos (${imgs} thumbnails)`, imgs >= 20);
const gbody = await page.textContent("body");
check("upload controls present", /Choose photos/i.test(gbody ?? ""));
check("category filters present", /tree nurseries/i.test(gbody ?? ""));
await page.screenshot({ path: `${shotDir}/admin-gallery.jpg`, type: "jpeg", quality: 82, fullPage: false });

/* ------------------------------------------------------- 5. inquiries */
console.log("\n5. Inquiries CRM");
await page.goto(`${BASE}/admin/inquiries`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const ibody = await page.textContent("body");
check("enquiries page loads (empty state ok)", /Nothing here yet|Enquiries/i.test(ibody ?? ""));

/* -------------------------------------------------------- 6. stories */
console.log("\n6. Stories manager");
await page.goto(`${BASE}/admin/stories`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const sbody = await page.textContent("body");
const storyTitles = ["Planting Trees, Growing Dignity", "Restoring Hope", "Tachasis", "Growing Skills", "Inside the Nursery"];
const found = storyTitles.filter((t) => (sbody ?? "").toLowerCase().includes(t.toLowerCase()));
check(`story list shows live stories (${found.length}/5 found)`, found.length >= 4, found.join(","));

/* ------------------------------------------------------- 7. partners */
console.log("\n7. Partners manager");
await page.goto(`${BASE}/admin/partners`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const pbody = await page.textContent("body");
check("partner list shows live partners", /Chelilim|PAD/i.test(pbody ?? ""));

/* ------------------------------------------------------- 8. settings */
console.log("\n8. Settings + write round-trip");
await page.goto(`${BASE}/admin/settings`, { waitUntil: "networkidle" });
await page.waitForSelector('input', { timeout: 20000 });
await page.waitForTimeout(2500);
const emailInput = page.locator('input').first();
check("settings row loads from DB", (await emailInput.inputValue()).includes("lelwakstars.org"));
await page.click('text=Save settings');
await page.waitForTimeout(3000);
const stbody = await page.textContent("body");
check("save succeeds (RLS write as admin)", /Settings saved/i.test(stbody ?? "") || !/Could not|error/i.test(stbody ?? ""));
const db = await rest("site_settings?id=eq.1&select=contact_email,region");
check("DB row unchanged/stable after save", db[0]?.contact_email?.includes("lelwakstars.org"));
await page.screenshot({ path: `${shotDir}/admin-settings.jpg`, type: "jpeg", quality: 82, fullPage: false });

/* ------------------------------------------------------- 9. sign out */
console.log("\n9. Sign out");
await page.click('text=Sign out');
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
check("sign-out returns to login gate", true);

/* ------------------------------------------------- cleanup test rows */
const cleanup = await rest("page_views?select=id&created_at=gte." + new Date(Date.now() - 10 * 60000).toISOString());
if (cleanup.length) {
  await fetch(`${URL_}/rest/v1/page_views?id=in.(${cleanup.map((c) => c.id).join(",")})`, {
    method: "DELETE",
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
  console.log(`\ncleanup: removed ${cleanup.length} test page_views`);
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
