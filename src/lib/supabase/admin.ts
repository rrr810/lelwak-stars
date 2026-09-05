import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * SERVICE-ROLE client. Bypasses Row Level Security.
 *
 * ⚠️  SERVER ONLY. Never import this from a client component,
 *     never expose NEXT_PUBLIC_, never commit the key to GitHub.
 *
 * Used for: admin dashboard writes, sending partner notifications,
 * scheduled impact-stat rollups, image re-tagging jobs.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL. " +
        "Copy .env.example to .env.local and fill them in.",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
