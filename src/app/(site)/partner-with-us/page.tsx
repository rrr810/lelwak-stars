import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { partnershipTiers } from "@/lib/site";
import { CheckIcon, HeartHandIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Become a sponsor or partner of Lelwak Stars CBO. Tell us what you'd like to support and we'll respond within two working days.",
};

const whatHappensNext = [
  {
    n: "01",
    t: "We read and reply",
    d: "A member of our leadership team responds within two working days — not an autoresponder.",
  },
  {
    n: "02",
    t: "We send the pack",
    d: "Registration details, programme budgets, monitoring approach and photographs from recent activities.",
  },
  {
    n: "03",
    t: "We agree the shape",
    d: "A call or meeting to scope which programme, which sites, what period and what reporting you need.",
  },
  {
    n: "04",
    t: "We deliver and report",
    d: "Delivery with photographs, dates, locations and participant numbers — plus an honest summary of what changed.",
  },
];

export default function PartnerPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-forest-800 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-leaf-300 ring-1 ring-inset ring-white/15">
            <HeartHandIcon className="h-3.5 w-3.5" />
            Partnership enquiry
          </span>
          <h1 className="mt-6 font-display text-display !text-white">
            Let&apos;s build something that outlives the project.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Tell us what you&apos;d like to support. We&apos;ll come back with a
            costed proposal, our registration details and photographs of the
            exact activities your contribution would fund.
          </p>
        </div>
      </header>

      <section className="section bg-cream-200">
        <div className="shell grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <div>
            <div className="card p-7 md:p-9" data-reveal>
              <h2 className="font-display text-h3">Start the conversation</h2>
              <p className="mt-1.5 text-sm text-navy-700/60">
                Fields marked * are required. Everything else helps us prepare a
                better proposal.
              </p>
              <div className="mt-7">
                <InquiryForm defaultType="sponsorship" />
              </div>
            </div>

            {/* What happens next */}
            <div className="mt-8" data-reveal>
              <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-[0.16em] text-forest-600">
                What happens next
              </h3>
              <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                {whatHappensNext.map((s) => (
                  <li key={s.n} className="card flex gap-4 p-5">
                    <span className="font-display text-2xl font-extrabold leading-none text-sage-300">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-display text-[0.9375rem] font-bold text-forest-800">
                        {s.t}
                      </p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-navy-700/65">
                        {s.d}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-[1.5rem] bg-forest-900 p-7 text-cream-200 shadow-lift" data-reveal>
              <h3 className="font-display text-lg font-extrabold !text-white">
                Partnership tiers at a glance
              </h3>
              <div className="mt-5 space-y-4">
                {partnershipTiers.map((t) => (
                  <div key={t.id} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-display text-[0.9375rem] font-bold !text-white">
                        {t.name}
                      </p>
                      <span className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-leaf-300">
                        {t.amount}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {t.includes.slice(0, 3).map((inc) => (
                        <li key={inc} className="flex gap-2 text-[0.75rem] leading-snug text-cream-200/65">
                          <span className="mt-[0.3rem] h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-7" data-reveal>
              <h3 className="font-display text-base font-bold text-forest-800">
                In-kind support is welcome
              </h3>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-navy-700/70">
                Not everything has to be cash. Seedlings, polythene bags, shade
                netting, tools, water tanks, transport, printing, venue hire,
                facilitator time and equipment all go straight into delivery.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Nursery inputs & tools",
                  "Transport and logistics",
                  "Training venues and catering",
                  "Printing, signage and materials",
                  "Professional skills (design, agronomy, accounting)",
                ].map((k) => (
                  <li key={k} className="flex gap-2 text-[0.8125rem] text-navy-700/70">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-200 text-forest-700">
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-dashed border-gold-500/50 bg-gold-500/[0.07] p-7" data-reveal>
              <h3 className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-gold-700">
                Due diligence pack
              </h3>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-navy-700/70">
                Foundations and corporate CSR teams usually need: CBO
                registration certificate, leadership list, bank details, a
                budget breakdown and references. Ask for these in your message
                and we&apos;ll send them with the proposal.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
