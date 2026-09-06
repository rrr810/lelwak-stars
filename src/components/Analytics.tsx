"use client";

/**
 * Privacy-friendly analytics beacon.
 *
 * One row per route view into public.page_views: path, referrer, viewport
 * width, day and a per-tab session uuid. No cookies, no fingerprinting, no
 * third party — the insert policy allows anon writes and nothing else, and
 * only signed-in admins can read the table back.
 */

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      let sid = sessionStorage.getItem("ls_sid");
      if (!sid) {
        sid =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        sessionStorage.setItem("ls_sid", sid);
      }
      const sb = createClient();
      // NB: supabase-js builders are thenables — the request only fires when
      // .then() runs. `void builder` would silently do nothing.
      sb.from("page_views")
        .insert({
          session_id: sid,
          path: pathname,
          referrer: document.referrer || null,
          viewport_w: window.innerWidth,
          view_day: new Date().toISOString().slice(0, 10),
        })
        .then(() => {});
    } catch {
      /* analytics must never break the site */
    }
  }, [pathname]);

  return null;
}
