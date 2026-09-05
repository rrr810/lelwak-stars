import Link from "next/link";
import { asset, programs } from "@/lib/site";
import { ArrowRightIcon, CalendarIcon, PinIcon } from "@/components/icons";

/**
 * Featured activity stories.
 *
 * SEED CONTENT — these three are illustrative placeholders written to show the
 * exact story structure we want (challenge → action → outcome → next need).
 * Once you send the "Community Activities Stories" content and photos, these
 * get replaced with the real activities and load from Supabase `stories`.
 */
const seedStories = [
  {
    slug: "nursery-establishment",
    title: "Establishing our first community tree nursery",
    program: "tree-nurseries" as const,
    location: "Community nursery site",
    date: "Recent activity",
    image: "/images/placeholder-nursery.jpg",
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
    program: "school-mentorship" as const,
    location: "Partner schools",
    date: "Recent activity",
    image: "/images/placeholder-mentorship.jpg",
    challenge:
      "Learners had little exposure to practical environmental stewardship, discipline and leadership outside the classroom syllabus.",
    action:
      "We visited schools to run mentorship sessions on personal responsibility, leadership and caring for the environment — including hands-on tree planting with the learners.",
    outcome:
      "Students left with concrete actions they could take at school and at home, and several schools asked us to return and support environmental clubs.",
    need: "Adopt a school for a term so mentorship becomes a sustained programme, not a one-off visit.",
  },
  {
    slug: "agripreneurship-training",
    title: "Turning agriculture into a youth livelihood",
    program: "agripreneurship" as const,
    location: "Community training sessions",
    date: "Recent activity",
    image: "/images/placeholder-training.jpg",
    challenge:
      "Young people saw farming as subsistence rather than business, so talent and labour left the community instead of building it.",
    action:
      "We ran agripreneurship workshops covering agribusiness skills, record keeping, value addition and climate-smart practice, with follow-up mentorship.",
    outcome:
      "Participants began treating small plots and nursery stock as enterprises with costs, margins and customers.",
    need: "Fund the next training cohort plus starter toolkits and inputs.",
  },
];

export default function StoriesPreview() {
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
          {seedStories.map((s) => {
            const program = programs.find((p) => p.id === s.program)!;
            return (
              <article key={s.slug} className="card group flex flex-col overflow-hidden" data-reveal>
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* TODO: real activity photos */}
                  <img
                    src={asset(s.image)}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
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
                    <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                      Support needed next
                    </p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-navy-700/75">
                      {s.need}
                    </p>
                  </div>

                  <Link
                    href="/partner-with-us"
                    className="mt-5 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-bold text-forest-700 transition-colors hover:text-forest-800"
                  >
                    Support this work
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs italic text-navy-700/50" data-reveal>
          Story details above are structural placeholders pending the verified
          activity records and photographs from Lelwak Stars.
        </p>
      </div>
    </section>
  );
}
