#!/usr/bin/env node
/** E2E for the "owner self-serve" batch: logo, simple enquiries, instant stories. */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://127.0.0.1:3999/lelwak-stars";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PW = process.env.ADMIN_TEMP_PASSWORD;

let pass = 0, fail = 0;
const check = (n, ok, x = "") => (ok ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log("\n1. Logo on public site");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const logo = page.locator('header img[src*="logo-badge"]');
check("header shows the real logo", (await logo.count()) >= 1);
const favicon = await page.locator('link[rel="icon"]').first().getAttribute("href");
check("favicon wired", !!favicon && favicon.includes("icon"), String(favicon));
await page.screenshot({ path: "/home/user/screenshots/home-logo.jpg", type: "jpeg", quality: 82 });

console.log("\n2. Contact email swapped");
const body = await page.textContent("body");
check("gmail contact visible somewhere", (body ?? "").includes("lelwakstarscbo@gmail.com"));

console.log("\n3. Brand-new story appears with NO deploy (smart 404)");
const slug = `e2e-live-${Date.now().toString(36)}`;
const ins = await fetch(`${URL_}/rest/v1/stories?select=id`, {
  method: "POST",
  headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "return=representation" },
  body: JSON.stringify({
    title: "E2E Instant Story", slug, excerpt: "Appeared without a deploy.",
    body: "This story was created in the database seconds ago and is served by the smart 404 router.",
    challenge: "c", action: "a", outcome: "o", is_published: true,
  }),
});
const [row] = await ins.json();
check("test story inserted", !!row?.id);
await page.goto(`${BASE}/stories/${slug}`, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const sb2 = await page.textContent("body");
check("new story renders live from DB", (sb2 ?? "").includes("E2E Instant Story"));
check("story body rendered", (sb2 ?? "").includes("smart 404 router"));
await page.screenshot({ path: "/home/user/screenshots/story-instant.jpg", type: "jpeg", quality: 82 });
// edit it live → overlay refresh test on a STATIC slug would need deploy; skip
await fetch(`${URL_}/rest/v1/stories?id=eq.${row.id}`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
console.log("  (test story deleted)");

console.log("\n4. Simple enquiries UI");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
await page.fill('input[type="email"]', "admin@lelwakstars.org");
await page.fill('input[type="password"]', PW);
await page.click('button[type="submit"]');
await page.waitForSelector("text=Overview", { timeout: 20000 });
await page.goto(`${BASE}/admin/inquiries`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const ib = await page.textContent("body");
check("tabs present (New / Replied / Done)", /New/.test(ib ?? "") && /Replied \/ talking/.test(ib ?? "") && /Done/.test(ib ?? ""));
check("message readable without expanding", (ib ?? "").includes("id like to partner as atech team"));
check("reply button present", /Reply to/.test(ib ?? ""));
check("status chips present", /Move to:/.test(ib ?? ""));
await page.screenshot({ path: "/home/user/screenshots/admin-inquiries-new.jpg", type: "jpeg", quality: 82, fullPage: true });

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
