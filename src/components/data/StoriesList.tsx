"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStories, publicUrl } from "@/lib/data";
import { seedStories, type SeedStory } from "@/lib/seed";
import { programs } from "@/lib/site";
import { asset } from "@/lib/site";
import { ArrowRightIcon, CalendarIcon, PinIcon } from "@/components/icons";

type Row = SeedStory & { image: string };

/** Story cards: live Supabase rows when published, structural seed otherwise. */
export default function StoriesList() {
  const [items, setItems] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchStories(24).then((live) => {
      if (!alive) return;
      if (live && live.length > 0) {
        setItems(
          live.map((r) => ({
            slug: r.slug,
            title: r.title,
            program: (r.program ?? "capacity-building") as Row["program"],
            location: r.location ?? "",
            date: r.activity_date
              ? new Date(r.activity_date).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : "",
            image: r.cover_image ? publicUrl(r.cover_image) : "",
            excerpt: r.excerpt,
            challenge: r.challenge,
            action: r.action,
            outcome: r.outcome,
            need: r.next_need,
            reached: r.people_reached,
          })),
        );
      } else {
        setItems(seedStories);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const list = items ?? [];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {list.map((s) => {
          const program = programs.find((p) => p.id === s.program);
          return (
            <article key={s.slug} className="card group flex flex-col overflow-hidden" data-reveal>
              <div className="relative aspect-[16/9] overflow-hidden">
{s.image ? (
                <img
                  src={s.image.startsWith("http") ? s.image : asset(s.image)}
                  alt={s.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-forest-700 via-forest-600 to-navy-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/75 via-transparent to-transparent" />
                {program && (
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-white shadow-soft"
                    style={{ backgroundColor: program.accent }}
                  >
                    {program.short}
                  </span>
                )}
                <div className="absolute inset-x-4 bottom-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] font-medium text-white/85">
                  {s.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <PinIcon className="h-3.5 w-3.5" /> {s.location}
                    </span>
                  )}
                  {s.date && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" /> {s.date}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-7">
                <h2 className="font-display text-h3 !text-forest-800">{s.title}</h2>
                {s.excerpt && (
                  <p className="mt-2.5 text-[0.875rem] leading-relaxed text-navy-700/70">
                    {s.excerpt}
                  </p>
                )}

                <dl className="mt-5 space-y-3 border-t border-cream-300 pt-5 text-[0.8125rem] leading-relaxed">
                  {s.challenge && <Row label="The challenge" color="text-clay-500" text={s.challenge} />}
                  {s.action && <Row label="What we did" color="text-forest-600" text={s.action} />}
                  {s.outcome && <Row label="The outcome" color="text-gold-600" text={s.outcome} />}
                </dl>

                {s.reached != null && (
                  <p className="mt-4 inline-flex w-fit rounded-full bg-sage-200 px-3 py-1 text-[0.75rem] font-bold text-forest-700">
                    {Number(s.reached).toLocaleString()} people reached
                  </p>
                )}

                {s.need && (
                  <div className="mt-5 rounded-xl bg-sage-100 p-4">
                    <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                      Support needed next
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-navy-700/75">{s.need}</p>
                  </div>
                )}

                <Link
                  href="/partner-with-us"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-[0.875rem] font-bold text-forest-700"
                >
                  Support this work
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          );
        })}
        {items === null &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[28rem] animate-pulse rounded-[1.25rem] bg-sage-200" />
          ))}
      </div>

      {items !== null && items.length > 0 && items[0].slug === seedStories[0].slug && (
        <p className="mt-8 text-center text-xs italic text-navy-700/50">
          These are structural placeholders. Real activity records, dates,
          locations, participant numbers and photographs load automatically
          once the content archive is uploaded.
        </p>
      )}
    </>
  );
}

function Row({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div>
      <dt className={`font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${color}`}>
        {label}
      </dt>
      <dd className="mt-0.5 text-navy-700/70">{text}</dd>
    </div>
  );
}
