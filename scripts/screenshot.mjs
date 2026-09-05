#!/usr/bin/env node
/**
 * Full-page screenshots of the live site, for review without a browser.
 *   node scripts/screenshot.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = "/home/user/screenshots";
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { path: "/", name: "home", full: true },
  { path: "/programs", name: "programs", full: true },
  { path: "/partners", name: "partners", full: true },
  { path: "/partner-with-us", name: "partner-with-us", full: true },
  { path: "/gallery", name: "gallery", full: true },
  { path: "/impact", name: "impact", full: true },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

for (const p of pages) {
  await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1200);
  // trigger reveal-on-scroll for full captures
  if (p.full) {
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += 700;
          // instant: the site uses CSS smooth scrolling, and smooth scrollTo
          // calls retargeted every 60ms never actually reach the bottom,
          // leaving reveal-on-scroll sections invisible in captures.
          window.scrollTo({ top: y, behavior: "instant" });
          if (y < document.body.scrollHeight) setTimeout(step, 90);
          else {
            window.scrollTo({ top: 0, behavior: "instant" });
            setTimeout(res, 500);
          }
        };
        step();
      });
      // let lazy-loaded images finish decoding before we scroll back up
      await Promise.all(
        Array.from(document.images).map(
          (img) =>
            new Promise((r) => {
              if (img.complete && img.naturalWidth > 0) return r(1);
              const t = setTimeout(r, 5000); // never hang on empty/dead srcs
              img.addEventListener("load", () => { clearTimeout(t); r(1); });
              img.addEventListener("error", () => { clearTimeout(t); r(1); });
            }),
        ),
      );
    });
    await page.waitForTimeout(600);
  }
  const file = `${OUT}/${p.name}.jpg`;
  await page.screenshot({ path: file, fullPage: p.full, type: "jpeg", quality: 82 });
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`  ${p.path.padEnd(16)} -> ${file}  (${kb} KB)`);
}

await browser.close();
console.log("done");
