import { createClient } from "@/lib/supabase/client";
import type { GalleryImage } from "@/components/GalleryGrid";
import type { GalleryCategory } from "@/lib/database.types";

/**
 * Browser-safe data layer for the static (GitHub Pages) build.
 *
 * Every function returns the Supabase rows when the project is configured
 * and falls back to `null` / `[]` otherwise, so the same components render
 * the seed content in a bare checkout.
 */

export function configured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR-PROJECT-REF"));
}

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "gallery";

export function publicUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${BUCKET}/${path.replace(/^\//, "")}`;
}

export async function fetchGallery(opts?: {
  category?: GalleryCategory;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<GalleryImage[]> {
  if (!configured()) return [];
  try {
    const supabase = createClient();
    let query = supabase
      .from("gallery")
      .select(
        "id, category, title, caption, location, shot_on, path_full, path_thumb, alt, is_featured, sort_order",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (opts?.category) query = query.eq("category", opts.category);
    if (opts?.featuredOnly) query = query.eq("is_featured", true);
    if (opts?.limit) query = query.limit(opts.limit);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      src: publicUrl(row.path_full),
      thumb: publicUrl(row.path_thumb),
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
    }));
  } catch {
    return [];
  }
}

export async function fetchImpactStats() {
  if (!configured()) return null;
  try {
    const { data, error } = await createClient()
      .from("impact_stats")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function fetchStories(limit = 24) {
  if (!configured()) return [];
  try {
    const { data, error } = await createClient()
      .from("stories")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPartners() {
  if (!configured()) return [];
  try {
    const { data, error } = await createClient()
      .from("partners")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/** One published story by slug (build-time on static exports). */
export async function fetchStory(slug: string) {
  if (!configured()) return null;
  try {
    const { data, error } = await createClient()
      .from("stories")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/** Published gallery photos attached to a story, in curator order. */
export async function fetchStoryPhotos(storyId: string) {
  if (!configured()) return [];
  try {
    const { data, error } = await createClient()
      .from("gallery")
      .select("*")
      .eq("story_id", storyId)
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at");
    if (error || !data) return [];
    return data.map((row) => ({
      ...row,
      src: publicUrl(row.path_full),
      thumb: publicUrl(row.path_thumb),
    }));
  } catch {
    return [];
  }
}
