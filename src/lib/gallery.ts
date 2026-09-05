import "server-only";
import { db } from "@/lib/db";
import type { GalleryImage } from "@/components/GalleryGrid";
import type { GalleryCategory } from "@/lib/database.types";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "gallery";

/**
 * Builds a public URL for a stored object path.
 * Reads the bucket's public URL from Supabase when connected, otherwise
 * assumes the standard `<project>/storage/v1/object/public/<bucket>/<path>`.
 */
async function publicUrl(supabase: Awaited<ReturnType<typeof db>>, path: string) {
  if (!supabase) return path.startsWith("http") ? path : `/${path.replace(/^\//, "")}`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Gallery images from Supabase, newest first.
 * Falls back to [] when the database isn't connected — the UI then renders
 * its "archive coming soon" empty state rather than breaking the page.
 */
export async function getGalleryImages(opts?: {
  category?: GalleryCategory;
  storyId?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<GalleryImage[]> {
  const supabase = await db();
  if (!supabase) return [];

  let query = supabase
    .from("gallery")
    .select(
      "id, category, title, caption, location, shot_on, path_full, path_thumb, alt, is_featured, sort_order",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.storyId) query = query.eq("story_id", opts.storyId);
  if (opts?.featuredOnly) query = query.eq("is_featured", true);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[gallery] fetch failed:", error.message);
    return [];
  }
  if (!data) return [];

  return Promise.all(
    data.map(async (row) => ({
      id: row.id,
      src: await publicUrl(supabase, row.path_full),
      thumb: await publicUrl(supabase, row.path_thumb),
      alt: row.alt || row.caption || row.title || "Lelwak Stars community activity",
      caption: row.caption || row.title,
      category: row.category,
      location: row.location ?? undefined,
      date: row.shot_on
        ? new Date(row.shot_on).toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })
        : undefined,
      span: row.is_featured ? 4 : 2,
    })),
  );
}

export async function getStories(limit = 3) {
  const supabase = await db();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[stories] fetch failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getImpactStats() {
  const supabase = await db();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("impact_stats")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (error) {
    console.error("[impact] fetch failed:", error.message);
    return null;
  }
  return data;
}

export async function getPartners() {
  const supabase = await db();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (error) return [];
  return data ?? [];
}

export async function getSiteSettings() {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? null;
}
