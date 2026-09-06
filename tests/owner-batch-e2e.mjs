#!/usr/bin/env node
/** E2E: verified impact, self-serve categories, drag-drop upload, Gmail reply. */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3999/lelwak-stars";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PW = process.env.ADMIN_TEMP_PASSWORD;

let pass = 0, fail = 0;
const check = (n, ok, x = "") => (ok ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} ${x}`)));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log("\n1. Verified impact numbers live");
await page.goto(`${BASE}/impact`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const ib = await page.textContent("body");
for (const [n, label] of [["14,000", "seedlings"], ["180", "mentored"], ["Full uniforms", "uniforms"]]) {
  check(`${label} figure on impact page`, (ib ?? "").includes(n));
}
check("verified badge shown", (ib ?? "").includes("verified count"));
check("old percent placeholders gone", !(ib ?? "").includes("48%"));
await page.screenshot({ path: "/home/user/screenshots/impact-verified.jpg", type: "jpeg", quality: 82, fullPage: false });

console.log("\n2. Admin: add category + drag-drop upload");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.waitForSelector('input[type="email"]', { timeout: 15000 });
await page.fill('input[type="email"]', "admin@lelwakstars.org");
await page.fill('input[type="password"]', PW);
await page.click('button[type="submit"]');
await page.waitForSelector("text=Overview", { timeout: 20000 });
await page.goto(`${BASE}/admin/gallery`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const gb = await page.textContent("body");
check("drag-drop zone present", (gb ?? "").includes("Drag photos here"));

// add a category through the UI
await page.fill('input[placeholder="e.g. Fundraisers"]', "Fundraisers");
await page.click("text=+ Add category");
await page.waitForTimeout(2500);
const sel = await page.locator("select").first().textContent();
check("new category in upload select", (sel ?? "").includes("Fundraisers"));

// drag-drop one canvas-made photo into the zone
const dropped = await page.evaluate(async () => {
  const canvas = document.createElement("canvas");
  canvas.width = 900; canvas.height = 600;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#14532D"; ctx.fillRect(0, 0, 900, 600);
  ctx.fillStyle = "#D89B32"; ctx.font = "bold 80px sans-serif"; ctx.fillText("E2E DROP", 220, 330);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  const file = new File([blob], "e2e-drop-test.png", { type: "image/png" });
  const dt = new DataTransfer();
  dt.items.add(file);
  const zs = [...document.querySelectorAll("div")].filter((d) => d.textContent?.trim().startsWith("Drag photos here"));
  const zone = zs[zs.length - 1];
  if (!zone) return "no zone";
  zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
  zone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  return "dropped";
});
check("drop event dispatched", dropped === "dropped", dropped);
await page.waitForTimeout(6000);
const after = await page.textContent("body");
check("upload success notice", /1 photo compressed, uploaded and published/.test(after ?? ""), (after ?? "").slice(0, 80));

console.log("\n3. Uploaded photo is on the public site");
await page.goto(`${BASE}/gallery`, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const pubCount = await page.textContent("body");
check("public gallery count grew to 29", (pubCount ?? "").includes("29 photograph"), (pubCount ?? "").slice(0, 60));

console.log("\n4. Gmail compose on Reply");
await page.goto(`${BASE}/admin/inquiries`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const [popup] = await Promise.all([
  page.waitForEvent("popup", { timeout: 8000 }).catch(() => null),
  page.click("text=✉ Reply to"),
]);
check("reply opens mail compose in new tab", !!popup && (popup.url().includes("mail.google.com") || popup.url().includes("mailto:")), popup?.url().slice(0, 60) ?? "no popup");
if (popup) await popup.close().catch(() => {});

console.log("\n5. Cleanup test artifacts");
const g = await fetch(`${URL_}/rest/v1/gallery?select=id,path_full,path_thumb,category&title=like.e2e-drop%25`, {
  headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
});
const rows = await g.json();
for (const r of rows) {
  await fetch(`${URL_}/storage/v1/object/gallery/${r.path_full}`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  await fetch(`${URL_}/storage/v1/object/gallery/${r.path_thumb}`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
  await fetch(`${URL_}/rest/v1/gallery?id=eq.${r.id}`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
}
console.log(`  removed ${rows.length} test photo(s)`);
await fetch(`${URL_}/rest/v1/gallery_categories?id=eq.fundraisers`, { method: "DELETE", headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
console.log("  removed test category");

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
