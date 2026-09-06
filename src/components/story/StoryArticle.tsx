"use client";

/**
 * The full story article layout, shared by:
 *  - the static build (server page renders it at deploy time),
 *  - the live overlay (client re-renders it when the DB row changed),
 *  - the smart 404 router (brand-new stories, before any deploy).
 */

import Link from "next/link";
import type { Database } from "@/lib/database.types";
import { publicUrl } from "@/lib/data";
import { programs } from "@/lib/site";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, PinIcon } from "@/components/icons";

export type StoryRow = Database["public"]["Tables"]["stories"]["Row"];
export type StoryPhoto = {
  id: string;
  src: string;
  alt?: string;
  caption?: string | null;
};

export function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function StoryArticle({ story, photos }: { story: StoryRow; photos: StoryPhoto[] }) {
  const program = programs.find((p) => p.id === story.program);

  return (
    <div className="pt-[7.5rem]">
      {/* ---------------------------------------------------------- header */}
      <header className="grain relative overflow-hidden bg-navy-700 py-16 text-cream-200 md:py-20">
        {story.cover_image ? (
          <img
            src={publicUrl(story.cover_image)}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            fetchPriority="high"
            decoding="async"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-800/85 to-navy-800/60" />
        <div className="shell relative max-w-3xl">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-[0.8125rem] font-bold text-cream-200/80 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" /> All stories
          </Link>
          {program ? (
            <span
              className="mt-6 inline-block rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-white"
              style={{ backgroundColor: program.accent }}
            >
              {program.short}
            </span>
          ) : null}
          <h1 className="mt-4 font-display text-display font-extrabold !text-white">{story.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] font-medium text-cream-200/85">
            {story.location ? (
              <span className="inline-flex items-center gap-1.5">
                <PinIcon className="h-4 w-4" /> {story.location}
              </span>
            ) : null}
            {story.activity_date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                {new Date(story.activity_date).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------- the story */}
      <section className="section bg-cream-100">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-2xl">
            {story.excerpt ? (
              <p className="font-display text-h3 leading-snug text-forest-900">{story.excerpt}</p>
            ) : null}
            <div className="mt-6 space-y-5 text-lead text-navy-700/80">
              {paragraphs(story.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {photos.length > 0 ? (
              <div className="mt-12">
                <h2 className="font-display text-h2 text-forest-900">From this day</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {photos.map((ph) => (
                    <figure key={ph.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                      <img
                        src={ph.src}
                        alt={ph.alt || ph.caption || story.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {ph.caption ? (
                        <figcaption className="px-4 py-3 text-[0.8125rem] leading-relaxed text-navy-700/75">
                          {ph.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* --------------------------------------------- structure card */}
          <aside className="lg:pt-2">
            <div className="card sticky top-28 space-y-5 p-6">
              <h2 className="font-display text-h3 text-forest-900">At a glance</h2>
              {(
                [
                  ["The challenge", story.challenge, "text-clay-500"],
                  ["What we did", story.action, "text-forest-600"],
                  ["The outcome", story.outcome, "text-gold-600"],
                ] as const
              ).map(([label, text, color]) =>
                text ? (
                  <div key={label}>
                    <dt className={`font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${color}`}>
                      {label}
                    </dt>
                    <dd className="mt-1 text-[0.875rem] leading-relaxed text-navy-700/75">{text}</dd>
                  </div>
                ) : null,
              )}
              {story.next_need ? (
                <div className="rounded-xl bg-sage-100 p-4">
                  <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                    What this needs next
                  </p>
                  <p className="mt-1.5 text-[0.875rem] font-medium leading-relaxed text-forest-900">
                    {story.next_need}
                  </p>
                </div>
              ) : null}
              <Link href="/partner-with-us" className="btn btn-primary w-full justify-center">
                Support work like this
                <ArrowRightIcon />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
