import Link from "next/link";
import type { Metadata } from "next";
import { partnershipTiers, programs } from "@/lib/site";
import PartnersList from "@/components/data/PartnersList";
import { ArrowRightIcon, CheckIcon, HeartHandIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Partnership Opportunities",
  description:
    "Partner with Lelwak Stars CBO: sponsor tree nurseries, agripreneurship cohorts, school mentorship programmes and community environmental campaigns.",
};


const sponsorableItems = [
  {
    t: "A nursery bed",
    d: "Polythene seedling bags, soil, shade netting, watering cans and labour for one full growing cycle.",
    unit: "per bed / cycle",
  },
  {
    t: "A planting campaign",
    d: "Seedlings, transport, tools and community mobilisation for a site-wide planting day.",
    unit: "per campaign",
  },
  {
    t: "A school mentorship term",
    d: "Facilitators, materials and follow-up visits for one school across an entire term.",
    unit: "per school / term",
  },
  {
    t: "An agripreneurship cohort",
    d: "Training delivery, workbooks, starter toolkits and post-training mentorship for a youth group.",
    unit: "per cohort",
  },
  {
    t: "Equipment & materials",
    d: "Water storage, wheelbarrows, spades, seedling trays, protective gear and record-keeping supplies.",
    unit: "in-kind or cash",
  },
  {
    t: "An environmental awareness drive",
    d: "Community barazas, air-pollution and conservation awareness sessions with printed materials.",
    unit: "per drive",
  },
];

export default async function PartnersPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-forest-900 py-20 text-cream-200 md:py-28">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Partnership Opportunities</span>
          <h1 className="mt-5 font-display text-display !text-white">
            Fund something real, and see it grow.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Lelwak Stars is delivery-ready. We have the structure, the community
            relationships and the track record — what we are looking for is
            partners who want their support to become visible, measurable
            change.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/partner-with-us" className="btn btn-primary !px-6 !py-3">
              <HeartHandIcon className="h-4 w-4" />
              Become a Partner
            </Link>
            <Link href="/impact" className="btn btn-light !px-6 !py-3">
              See our impact data
            </Link>
          </div>
        </div>
      </header>

      {/* Tiers */}
      <section className="section bg-cream-200">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <span className="eyebrow">Three ways in</span>
            <h2 className="mt-4 font-display text-h2">
              Choose the level of involvement that suits you.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Amounts are flexible and discussed with you directly — these tiers
              describe what each relationship looks like in practice.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {partnershipTiers.map((t) => (
              <article
                key={t.id}
                className={`card relative flex flex-col p-8 ${
                  t.highlight ? "!shadow-lift ring-2 ring-leaf-500" : ""
                }`}
                data-reveal
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-forest-950 shadow-soft">
                    Most popular
                  </span>
                )}
                <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-600">
                  {t.amount}
                </p>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-forest-800">
                  {t.name}
                </h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-navy-700/70">
                  {t.text}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 border-t border-cream-300 pt-6">
                  {t.includes.map((inc) => (
                    <li key={inc} className="flex gap-2.5 text-[0.8125rem] leading-snug text-navy-700/75">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-forest-950">
                        <CheckIcon className="h-2.5 w-2.5" />
                      </span>
                      {inc}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/partner-with-us?tier=${t.id}`}
                  className={`btn mt-7 w-full ${t.highlight ? "btn-primary" : "btn-ghost"}`}
                >
                  Enquire about {t.name.split(" ")[0]}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What you can fund */}
      <section className="bg-cream-50 py-20">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <span className="eyebrow">Specific & fundable</span>
            <h2 className="mt-4 font-display text-h2">
              Six things you can sponsor directly.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Prefer to fund something concrete rather than a general donation?
              Pick a line item and we will cost it, deliver it and report back
              with photographs.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsorableItems.map((item, i) => (
              <div key={item.t} className="card p-7" data-reveal>
                <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-cream-400">
                  Option {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-forest-800">
                  {item.t}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-navy-700/70">
                  {item.d}
                </p>
                <p className="mt-4 inline-flex rounded-full bg-sage-200 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-forest-700">
                  {item.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme alignment */}
      <section className="section bg-sage-100">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <span className="eyebrow">Aligned to our pillars</span>
            <h2 className="mt-4 font-display text-h2">
              Every partnership maps to a programme.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {programs.map((p) => (
              <div
                key={p.id}
                className="flex gap-4 rounded-2xl bg-white p-6 shadow-soft"
                data-reveal
              >
                <span
                  className="mt-1 h-full w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
                <div>
                  <h3 className="font-display text-base font-bold" style={{ color: p.accent }}>
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-navy-700/70">
                    {p.partnerAsk}
                  </p>
                  <Link
                    href={`/programs#${p.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-bold text-forest-700"
                  >
                    Programme details
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current partners */}
      <section className="section bg-cream-200">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <span className="eyebrow">Who stands with us</span>
            <h2 className="mt-4 font-display text-h2">Partners & supporters</h2>
          </div>

          <PartnersList />
        </div>
      </section>
    </div>
  );
}
