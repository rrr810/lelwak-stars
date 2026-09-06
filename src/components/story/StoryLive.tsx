"use client";

/**
 * Live-refresh overlay for story pages.
 *
 * The static HTML (good for SEO and instant paint) is a snapshot from the
 * last deploy. On mount we fetch the current row: if the story changed in
 * the admin dashboard (edit, new cover, new photos attached) — or was
 * unpublished — we swap the snapshot for the live version right here, so
 * owners see their edits on the public site without waiting for a deploy.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStory, fetchStoryPhotos } from "@/lib/data";
import StoryArticle, { type StoryPhoto, type StoryRow } from "@/components/story/StoryArticle";

export default function StoryLive({
  slug,
  staticId,
  staticUpdated,
  staticCover,
  staticPhotoCount,
}: {
  slug: string;
  staticId: string;
  staticUpdated: string;
  staticCover: string | null;
  staticPhotoCount: number;
}) {
  const [live, setLive] = useState<{ story: StoryRow; photos: StoryPhoto[] } | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const story = await fetchStory(slug);
      if (!alive) return;
      if (!story) {
        setGone(true);
        return;
      }
      const photos = (await fetchStoryPhotos(story.id)) as unknown as StoryPhoto[];
      if (!alive) return;
      const changed =
        (story.updated_at ?? "") !== staticUpdated ||
        (story.cover_image ?? null) !== staticCover ||
        photos.length !== staticPhotoCount;
      if (changed) {
        document.getElementById(staticId)?.setAttribute("hidden", "");
        document.title = `${story.title} · Lelwak Stars CBO`;
        setLive({ story, photos });
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, staticId, staticUpdated, staticCover, staticPhotoCount]);

  if (gone) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 pt-[7.5rem]">
        <div className="max-w-md text-center">
          <p className="font-display text-2xl font-extrabold text-navy-900">This story is no longer published.</p>
          <Link href="/stories" className="btn btn-primary mt-6 inline-flex">
            Read other stories
          </Link>
        </div>
      </div>
    );
  }
  if (!live) return null;
  return <StoryArticle story={live.story} photos={live.photos} />;
}
