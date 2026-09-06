import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchStory, fetchStories, fetchStoryPhotos } from "@/lib/data";
import StoryArticle from "@/components/story/StoryArticle";
import StoryLive from "@/components/story/StoryLive";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const rows = await fetchStories(200);
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await fetchStory(slug);
  if (!story) return { title: "Story not found" };
  return {
    title: story.title,
    description: story.excerpt || undefined,
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const story = await fetchStory(slug);
  if (!story) notFound();
  const photos = await fetchStoryPhotos(story.id);
  const staticId = `story-static-${slug}`;

  return (
    <>
      <div id={staticId}>
        <StoryArticle story={story} photos={photos} />
      </div>
      <StoryLive
        slug={slug}
        staticId={staticId}
        staticUpdated={story.updated_at ?? ""}
        staticCover={story.cover_image ?? null}
        staticPhotoCount={photos.length}
      />
    </>
  );
}
