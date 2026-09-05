import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns a Supabase server client, or `null` when the environment isn't
 * configured yet. Every data layer below falls back to the static seed in
 * `src/lib/site.ts`, so the site builds and previews beautifully *before*
 * the Supabase project is connected.
 */
export async function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    url.includes("YOUR-PROJECT-REF") ||
    key.includes("your-anon")
  ) {
    return null;
  }

  try {
    return await createClient();
  } catch {
    return null;
  }
}

export function supabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR-PROJECT-REF"));
}
