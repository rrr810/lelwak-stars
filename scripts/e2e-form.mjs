#!/usr/bin/env node
/**
 * End-to-end test: drive a real browser through the partner enquiry form and
 * confirm the submission lands in Supabase.
 *
 *   node scripts/e2e-form.mjs
 *
 * Requires a running server on $BASE_URL (default http://127.0.0.1:3000) and
 * SUPABASE_SERVICE_ROLE_KEY in .env.local for the verification read.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";

// ---- load .env.local without a dependency ----
function loadEnv(file = ".env.local") {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = loadEnv();
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;

const stamp = Date.now();
const submission = {
  name: "E2E Test Funder",
  email: `e2e-${stamp}@test.invalid`,
  organisation: "End To End Foundation",
  phone: "+254700000000",
  message: `Automated end-to-end submission ${stamp}. Please ignore — this is a test of the partner enquiry form.`,
};

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function readRow() {
  if (!SR || !SB_URL) return { skipped: true };
  const r = await fetch(
    `${SB_URL}/rest/v1/inquiries?email=eq.${encodeURIComponent(submission.email)}&select=*`,
    { headers: { apikey: SR, Authorization: `Bearer ${SR}` } },
  );
  if (!r.ok) return { error: `HTTP ${r.status}` };
  const rows = await r.json();
  return rows[0] ?? null;
}

async function cleanup() {
  if (!SR || !SB_URL) return;
  await fetch(
    `${SB_URL}/rest/v1/inquiries?email=eq.${encodeURIComponent(submission.email)}`,
    { method: "DELETE", headers: { apikey: SR, Authorization: `Bearer ${SR}` } },
  );
}

console.log(`\n🧪 Lelwak Stars — partner enquiry form E2E`);
console.log(`   target : ${BASE_URL}`);
console.log(`   verify : ${SR && SB_URL ? "Supabase (service role)" : "SKIPPED, no service key"}\n`);

const browser = await chromium.launch();
const page = await browser.newPage();

const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

try {
  // ---------- 1. load ----------
  console.log("1. Load /partner-with-us");
  const resp = await page.goto(`${BASE_URL}/partner-with-us`, { waitUntil: "networkidle" });
  check("page returns 200", resp?.status() === 200, `HTTP ${resp?.status()}`);
  check("header renders", await page.locator("header").count() > 0);
  check("footer renders", await page.locator("footer").count() > 0);
  check("form present", await page.locator("form").count() > 0);

  // ---------- 2. client-side validation ----------
  console.log("\n2. Validation");
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForTimeout(900);
  const nameErr = await page.locator("text=Please tell us your name").count();
  check("empty submit is rejected with a name error", nameErr > 0);

  await page.fill("#name", "A");
  await page.fill("#email", "not-an-email");
  await page.fill("#message", "short");
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForTimeout(900);
  check(
    "invalid email is rejected",
    (await page.locator("text=Please enter a valid email address").count()) > 0,
  );
  check(
    "too-short message is rejected",
    (await page.locator("text=Please add a little more detail").count()) > 0,
  );

  // ---------- 3. honeypot ----------
  console.log("\n3. Honeypot");
  const hp = page.locator("#hp");
  check("honeypot field exists and is off-screen", (await hp.count()) > 0);

  // ---------- 4. real submission ----------
  console.log("\n4. Honest submission");
  await page.fill("#name", submission.name);
  await page.fill("#email", submission.email);
  await page.fill("#organisation", submission.organisation);
  await page.fill("#phone", submission.phone);
  await page.selectOption("#inquiry_type", "sponsorship");
  await page.selectOption("#budget_range", "500k-2m");
  await page.fill("#message", submission.message);
  await page.locator("#hp").fill(""); // a real browser leaves it empty

  await Promise.all([
    page.waitForResponse((r) => r.request().method() === "POST", { timeout: 20000 }).catch(() => null),
    page.locator('form button[type="submit"]').first().click(),
  ]);

  await page.waitForTimeout(3500);
  const success = await page.locator("text=Message received").count();
  check("success state renders", success > 0);
  check(
    "confirmation copy shown",
    (await page.locator("text=Asante sana").count()) > 0,
  );

  // ---------- 5. database verification ----------
  console.log("\n5. Supabase verification");
  const row = await readRow();
  if (row?.skipped) {
    console.log("  ⚠️  skipped — no service role key available");
  } else if (!row) {
    check("row stored in public.inquiries", false, "NOT FOUND");
  } else {
    check("row stored in public.inquiries", true, row.id);
    check("name matches", row.name === submission.name, row.name);
    check("organisation captured", row.organisation === submission.organisation, row.organisation);
    check("phone captured", row.phone === submission.phone, row.phone);
    check("inquiry_type = sponsorship", row.inquiry_type === "sponsorship", row.inquiry_type);
    check("budget_range captured", row.budget_range === "500k-2m", row.budget_range);
    check("status defaulted to 'new' server-side", row.status === "new", row.status);
    check("is_priority auto-flagged (sponsorship)", row.is_priority === true, String(row.is_priority));
    check("honeypot stored null/empty", !row.hp, String(row.hp));
    check("message stored in full", row.message === submission.message, `${row.message?.length} chars`);
    check("ip_hash present (hashed, not raw)", row.ip_hash === null || /^[a-f0-9]{64}$/.test(row.ip_hash ?? ""), String(row.ip_hash).slice(0, 16));
  }

  // ---------- 6. no client errors ----------
  console.log("\n6. Browser console");
  const real = consoleErrors.filter((e) => !/favicon|Download the React DevTools/i.test(e));
  check("no uncaught page errors", real.length === 0, real.slice(0, 2).join(" | "));

  await cleanup();
} catch (err) {
  console.error("\n💥 Test crashed:", err.message);
  failures++;
  await page.screenshot({ path: "/tmp/e2e-failure.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
