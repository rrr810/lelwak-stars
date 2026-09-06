"use client";

/**
 * Smart 404.
 *
 * GitHub Pages has no server, so a story created in the admin dashboard
 * after the last deploy has no static HTML file yet. Pages serves this page
 * for the unknown URL; if the path looks like /stories/<slug> and the story
 * exists (and is published) in the database, we render it live right here.
 * The next deploy then bakes a proper static page for SEO.
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStory, fetchStoryPhotos } from "@/lib/data";
import StoryArticle, { type StoryPhoto, type StoryRow } from "@/components/story/StoryArticle";

const storySlugFromLocation = () => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.replace(/^\/lelwak-stars/, "");
  const m = /^\/stories\/([a-z0-9-]+)\/?$/.exec(path);
  return m ? m[1] : null;
};

export default function NotFound() {
  const pathname = usePathname();
  const [live, setLive] = useState<{ story: StoryRow; photos: StoryPhoto[] } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const slug = storySlugFromLocation() ?? (/^\/stories\/([a-z0-9-]+)\/?$/.exec(pathname ?? "")?.[1] ?? null);
    if (!slug) {
      setChecked(true);
      return;
    }
    let alive = true;
    (async () => {
      const story = await fetchStory(slug);
      if (!alive) return;
      if (story) {
        const photos = (await fetchStoryPhotos(story.id)) as unknown as StoryPhoto[];
        if (!alive) return;
        document.title = `${story.title} · Lelwak Stars CBO`;
        setLive({ story, photos });
      }
      setChecked(true);
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (live) return <StoryArticle story={live.story} photos={live.photos} />;

  if (!checked) return <div className="min-h-[70vh] bg-cream-200 pt-[7.5rem]" />;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream-200 px-6 pt-[7.5rem]">
      <div className="max-w-md text-center">
        <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-forest-600">404</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-900">This path leads into the bush.</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-navy-700/70">
          The page you asked for doesn&apos;t exist (yet). The stories and programmes below are very much alive.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/stories" className="btn btn-primary">
            Read our stories
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
