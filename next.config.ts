import type { NextConfig } from "next";

/**
 * The site ships two ways from the same codebase:
 *
 *  1. GitHub Pages (static)  — `output: "export"`, built by
 *     .github/workflows/deploy-pages.yml with NEXT_PUBLIC_BASE_PATH set to
 *     "/lelwak-stars" because project sites live under a sub-path.
 *  2. A Node host later (Vercel) for the staff admin dashboard — same build,
 *     basePath left empty.
 *
 * Server Actions are not available in a static export, so the enquiry form
 * submits from the browser through the anon key. That is safe by design:
 * RLS column grants (migration 0003/0004) restrict which columns a public
 * caller may write, the honeypot WITH CHECK rejects filled traps, and the
 * BEFORE INSERT trigger (0005) derives status/is_priority server-side.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    // No image-optimisation server on a static host; the photo pipeline
    // already produces sized WebP renditions, so this costs nothing.
    unoptimized: true,
  },
  // Clean URLs on Pages: /about.html is also reachable as /about
  trailingSlash: false,
};

export default nextConfig;
