import Link from "next/link";
import type { Metadata } from "next";
import { getStories } from "@/lib/gallery";
import { programs } from "@/lib/site";
import { ArrowRightIcon, CalendarIcon, PinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Stories & Activities",
  description:
    "Community activity stories from Lelwak Stars CBO — tree nurseries, planting days, school mentorship visits and youth agripreneurship training.",
};

export const revalidate = 300;

/** Structural seed until the real activity records + photos are loaded. */
const seed = [
  {
    slug: "nursery-establishment",
    title: "Establishing our first community tree nursery",
    program: "tree-nurseries" as const,
    location: "Community nursery site",
    date: "Recent activity",
    image: "/images/placeholder-nursery.jpg",
    excerpt:
      "How we turned a patch of degraded land into a working seedling nursery managed by young people from the community.",
    challenge:
      "Degraded land and scarce indigenous seedlings made it hard for households and schools to access affordable trees to plant.",
    action:
      "Our youth members built seedling beds, sourced polythene bags and shade netting, and set up a structured nursery management routine with watering and monitoring schedules.",
    outcome:
      "The nursery now raises seedlings for planting campaigns and supplies schools we mentor, with survival tracked after planting.",
    need: "Sponsor additional beds, water storage and shade netting to double output.",
    reached: null as number | null,
  },
  {
    slug: "school-mentorship-visit",
    title: "Mentoring learners on environmental responsibility",
    program: "school-mentorship" as const,
    location: "Partner schools",
    date: "Recent activity",
    image: "/images/placeholder-mentorship.jpg",
    excerpt:
      "A term of school visits bringing practical environmental stewardship, discipline and leadership coaching to learners.",
    challenge:
      "Learners had little exposure to practical environmental stewardship, discipline and leadership outside the classroom syllabus.",
    action:
      "We visited schools to run mentorship sessions on personal responsibility, leadership and caring for the environment — including hands-on tree planting with the learners.",
    outcome:
      "Students left with concrete actions they could take at school and at home, and several schools asked us to return and support environmental clubs.",
    need: "Adopt a school for a term so mentorship becomes a sustained programme, not a one-off visit.",
    reached: null as number | null,
  },
  {
    slug: "agripreneurship-training",
    title: "Turning agriculture into a youth livelihood",
    program: "agripreneurship" as const,
    location: "Community training sessions",
    date: "Recent activity",
    image: "/images/placeholder-training.jpg",
    excerpt:
      "Agribusiness skills, record keeping and value addition — helping young people see farming as an enterprise.",
    challenge:
      "Young people saw farming as subsistence rather than business, so talent and labour left the community instead of building it.",
    action:
      "We ran agripreneurship workshops covering agribusiness skills, record keeping, value addition and climate-smart practice, with follow-up mentorship.",
    outcome:
      "Participants began treating small plots and nursery stock as enterprises with costs, margins and customers.",
    need: "Fund the next training cohort plus starter toolkits and inputs.",
    reached: null as number | null,
  },
  {
    slug: "community-engagement",
    title: "Working with local administration and community stakeholders",
    program: "capacity-building" as const,
    location: "Chief's office & community barazas",
    date: "Recent activity",
    image: "/images/placeholder-planting.jpg",
    excerpt:
      "Why our activities survive: we plan with the chief's office, elders and households before a single seedling is planted.",
    challenge:
      "Community initiatives often collapse because they arrive without local buy-in or coordination with existing structures.",
    action:
      "We met with local administration, presented our plans, and coordinated activity dates and sites with community stakeholders.",
    outcome:
      "Activities were welcomed, attended and protected — and follow-up requests came from the community rather than from us.",
    need: "Support facilitation, transport and materials for continued community engagement.",
    reached: null as number | null,
  },
];

export default async function StoriesPage() {
  const live = await getStories(24);
  const items = live.length > 0 ? live : seed;

  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-navy-700 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Stories & Activities</span>
          <h1 className="mt-5 font-display text-display !text-white">
            Every activity, documented.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Each story follows the same structure so a reader — whether a
            household, a school head or a funding officer — can see the problem,
            the response, the result and the next step in under a minute.
          </p>
        </div>
      </header>

      <section className="section bg-cream-200">
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((raw) => {
              const s = raw as (typeof seed)[number];
              const program = programs.find((p) => p.id === s.program);
              return (
                <article key={s.slug} className="card group flex flex-col overflow-hidden" data-reveal>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={s.image ?? "/images/placeholder-nursery.jpg"}
                      alt={s.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
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
                      <Row label="The challenge" color="text-clay-500" text={s.challenge} />
                      <Row label="What we did" color="text-forest-600" text={s.action} />
                      <Row label="The outcome" color="text-gold-600" text={s.outcome} />
                    </dl>

                    {s.reached != null && (
                      <p className="mt-4 inline-flex w-fit rounded-full bg-sage-200 px-3 py-1 text-[0.75rem] font-bold text-forest-700">
                        {Number(s.reached).toLocaleString()} people reached
                      </p>
                    )}

                    <div className="mt-5 rounded-xl bg-sage-100 p-4">
                      <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                        Support needed next
                      </p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-navy-700/75">
                        {s.need}
                      </p>
                    </div>

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
          </div>

          {live.length === 0 && (
            <p className="mt-8 text-center text-xs italic text-navy-700/50">
              These are structural placeholders. Real activity records, dates,
              locations, participant numbers and photographs load automatically
              once the content archive is uploaded.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Row({ label, color, text }: { label: string; color: string; text?: string }) {
  if (!text) return null;
  return (
    <div>
      <dt className={`font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] ${color}`}>
        {label}
      </dt>
      <dd className="mt-0.5 text-navy-700/70">{text}</dd>
    </div>
  );
}
