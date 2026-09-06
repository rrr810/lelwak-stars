#!/usr/bin/env node
/**
 * GitHub-Pages-style static server for the exported site (local E2E).
 * Resolves /foo → foo.html → foo/index.html, like Pages does.
 *   node tests/serve.mjs [port]   (serves ./out mounted at /lelwak-stars)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.argv[2] ?? 3999);
const ROOT = path.resolve("out");
const PREFIX = "/lelwak-stars";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (!p.startsWith(PREFIX)) {
      res.writeHead(302, { Location: PREFIX + "/" });
      return res.end();
    }
    p = p.slice(PREFIX.length) || "/";
    const candidates = [path.join(ROOT, p), path.join(ROOT, `${p}.html`), path.join(ROOT, p, "index.html")];
    for (const f of candidates) {
      if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[path.extname(f)] ?? "application/octet-stream" });
        return fs.createReadStream(f).pipe(res);
      }
    }
    // SPA-ish fallback for client routes under /admin
    const fallback = path.join(ROOT, "404.html");
    if (fs.existsSync(fallback)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return fs.createReadStream(fallback).pipe(res);
    }
    res.writeHead(404).end("not found");
  })
  .listen(PORT, "0.0.0.0", () => console.log(`serving ${ROOT} at http://0.0.0.0:${PORT}${PREFIX}/`));
