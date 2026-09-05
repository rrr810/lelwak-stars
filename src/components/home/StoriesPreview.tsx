"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset, programs } from "@/lib/site";
import { fetchStories, publicUrl } from "@/lib/data";
import { ArrowRightIcon, CalendarIcon, PinIcon } from "@/components/icons";

/**
 * Featured activity stories on the home page.
 *
 * Loads published stories from Supabase (featured first). The structural
 * seeds below only render when the database has no published story yet, so a
 * fresh install still shows the intended challenge → action → outcome shape.
 */
type Card = {
  slug: string;
  title: string;
  program: string;
  location: string;
  date: string;
  image: string;
  challenge: string;
  action: string;
  outcome: string;
  need: string;
};

const seedCards: Card[] = [
  {
    slug: "nursery-establishment",
    title: "Establishing our first community tree nursery",
    program: "tree-nurseries",
    location: "Community nursery site",
    date: "Recent activity",
    image: "",
    challenge:
      "Degraded land and scarce indigenous seedlings made it hard for households and schools to access affordable trees to plant.",
    action:
      "Our youth members built seedling beds, sourced polythene bags and shade netting, and set up a structured nursery management routine with watering and monitoring schedules.",
    outcome:
      "The nursery now raises seedlings for planting campaigns and supplies schools we mentor, with survival tracked after planting.",
    need: "Sponsor additional beds, water storage and shade netting to double output.",
  },
  {
    slug: "school-mentorship-visit",
    title: "Mentoring learners on environmental responsibility",
    program: "school-mentorship",
    location: "Partner schools",
    date: "Recent activity",
    image: "",
    challenge:
      "Learners had little exposure to practical environmental stewardship, discipline and leadership outside the classroom syllabus.",
    action:
      "We visited schools to run mentorship sessions on personal responsibility, leadership and caring for the environment — including hands-on tree planting with the learners.",
    outcome:
      "Schools reported improved discipline and ownership of compound trees, and learners joined subsequent planting days as volunteers.",
    need: "Fund mentorship materials and transport so we can reach more schools each term.",
  },
  {
    slug: "youth-agri-training",
    title: "Training youth agripreneurs on nursery business",
    program: "agripreneurship",
    location: "Training venue",
    date: "Recent activity",
    image: "",
    challenge:
      "Young people saw agriculture as subsistence, not as a viable business, and lacked practical nursery-management skills.",
    action:
      "We ran hands-on training on seedling production, costing and pricing, customer handling and record-keeping for nursery enterprises.",
    outcome:
      "Participants left with a simple business plan and several began selling seedlings to households and institutions.",
    need: "Sponsor training cohorts, toolkits and starter stock for youth nursery enterprises.",
  },
];

export default function StoriesPreview() {
  const [cards, setCards] = useState<Card[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchStories(3).then((rows) => {
      if (!alive) return;
      if (!rows.length) {
        setCards(seedCards);
        return;
      }
      setCards(
        rows.map((r) => ({
          slug: r.slug,
          title: r.title,
          program: (r.program ?? "tree-nurseries") as string,
          location: r.location ?? "",
          date: r.activity_date
            ? new Date(r.activity_date).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })
            : "Recent activity",
          image: r.cover_image
            ? publicUrl(r.cover_image)
            : "",
          challenge: r.challenge,
          action: r.action,
          outcome: r.outcome,
          need: r.next_need,
        })),
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="stories" className="section bg-cream-200">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">Activities & Stories</span>
            <h2 className="mt-4 font-display text-h2">
              Proof, not promises.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Each story follows the same honest structure: the challenge we
              found, what we did about it, who benefited, and what support is
              needed next.
            </p>
          </div>
          <Link href="/stories" className="btn btn-ghost shrink-0">
            All stories
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {(cards ?? seedCards.slice(0, 3)).map((s) => {
            const program = programs.find((p) => p.id === s.program)!;
            return (
              <article key={s.slug} className="card group flex flex-col overflow-hidden" data-reveal>
                <div className="relative aspect-[16/10] overflow-hidden">
{s.image ? (
                  <img
                    src={s.image.startsWith("http") ? s.image : asset(s.image)}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-forest-700 via-forest-600 to-navy-700" />
                )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent" />
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-white shadow-soft"
                    style={{ backgroundColor: program.accent }}
                  >
                    {program.short}
                  </span>
                  <div className="absolute inset-x-4 bottom-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] font-medium text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                      <PinIcon className="h-3.5 w-3.5" /> {s.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" /> {s.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-h3 !text-forest-800">
                    {s.title}
                  </h3>

                  <dl className="mt-4 space-y-3 text-[0.8125rem] leading-relaxed">
                    <div>
                      <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-clay-500">
                        The challenge
                      </dt>
                      <dd className="mt-0.5 text-navy-700/70">{s.challenge}</dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-600">
                        What we did
                      </dt>
                      <dd className="mt-0.5 text-navy-700/70">{s.action}</dd>
                    </div>
                    <div>
                      <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-gold-600">
                        The outcome
                      </dt>
                      <dd className="mt-0.5 text-navy-700/70">{s.outcome}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 rounded-xl bg-sage-100 p-3.5">
                    <p className="text-[0.8125rem] font-medium text-forest-900">
                      <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                        Next need&nbsp;·&nbsp;
                      </span>
                      {s.need}
                    </p>
                  </div>

                  <Link
                    href={`/stories/${s.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-[0.8125rem] font-bold text-forest-700 transition-colors hover:text-forest-900"
                  >
                    Read the full story
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
