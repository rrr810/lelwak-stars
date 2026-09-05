import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Client used inside React components / client actions.
 * Uses the ANON key only — all writes are gated by Row Level Security.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
