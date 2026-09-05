import Link from "next/link";
import type { Metadata } from "next";
import { mission, site, vision, framework } from "@/lib/site";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Lelwak Stars CBO is a youth-led community based organisation working in environmental conservation, agripreneurship and school mentorship.",
};

export default function AboutPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-navy-700 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">About Us</span>
          <h1 className="mt-5 font-display text-display !text-white">
            A youth-led organisation with roots in the community.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            {site.legalName} was formed by young people who decided that
            environmental degradation and youth idleness in their community were
            not problems to wait on — they were problems to organise around.
          </p>
        </div>
      </header>

      {/* Vision / Mission */}
      <section className="section bg-cream-200">
        <div className="shell grid gap-6 lg:grid-cols-2">
          <div className="card overflow-hidden" data-reveal>
            <div className="h-1.5 bg-gradient-to-r from-forest-800 to-leaf-500" />
            <div className="p-8">
              <span className="eyebrow">Our Vision</span>
              <p className="mt-5 font-display text-xl font-bold leading-relaxed text-forest-800 md:text-2xl">
                {vision}
              </p>
            </div>
          </div>
          <div className="card overflow-hidden" data-reveal>
            <div className="h-1.5 bg-gradient-to-r from-gold-500 to-gold-300" />
            <div className="p-8">
              <span className="eyebrow">Our Mission</span>
              <p className="mt-5 font-display text-xl font-bold leading-relaxed text-navy-700 md:text-2xl">
                {mission}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="bg-cream-50 py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            <span className="eyebrow">Background</span>
            <h2 className="mt-4 font-display text-h2">
              Why Lelwak Stars exists
            </h2>
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-navy-700/75">
              <p>
                Lelwak Stars CBO is a youth-led organisation focused on inspiring
                community action through youth engagement, school mentorship and
                environmental conservation.
              </p>
              <p>
                We work with the people who live with the problem every day:
                households watching their land degrade, schools with learners who
                need direction, and young people with energy and no clear route
                into income. Our answer is practical — grow trees, grow skills,
                grow enterprises.
              </p>
              <p>
                We operate in close relationship with local administration and
                community stakeholders, which is why our activities are welcomed
                and sustained rather than dropped after a single visit.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-gold-500/50 bg-gold-500/[0.06] p-5">
              <p className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-gold-700">
                Governance & registration
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/70">
                {site.registration.number ? (
                  <>
                    Registered CBO No.{" "}
                    <strong>{site.registration.number}</strong>
                    {site.registration.issuedBy && <> · {site.registration.issuedBy}</>}
                  </>
                ) : (
                  <>
                    Registration certificate number, issuing authority, leadership
                    names and audited financials will be published here. Sponsors
                    and grant-making bodies routinely request these — this is the
                    first thing we should complete.
                  </>
                )}
              </p>
            </div>
          </div>

          <div data-reveal>
            <span className="eyebrow">Strategic Framework</span>
            <h3 className="mt-4 font-display text-h3">
              Four drivers that keep our work accountable
            </h3>
            <ol className="mt-6 space-y-4">
              {framework.map((f) => (
                <li key={f.step} className="card flex gap-5 p-6">
                  <span className="font-display text-3xl font-extrabold leading-none text-sage-300">
                    {f.step}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-bold text-forest-800">
                      {f.title}
                    </h4>
                    <p className="mt-1.5 text-[0.875rem] leading-relaxed text-navy-700/70">
                      {f.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-sage-100">
        <div className="shell">
          <div className="max-w-2xl" data-reveal>
            <span className="eyebrow">What we hold to</span>
            <h2 className="mt-4 font-display text-h2">Our values</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Youth leadership",
                d: "Young people design and deliver the work — not just attend it.",
              },
              {
                t: "Honest reporting",
                d: "We publish what worked, what didn't, and what it cost.",
              },
              {
                t: "Community first",
                d: "Activities are shaped with local administration and households.",
              },
              {
                t: "Sustainability",
                d: "We plant, then we monitor survival. Livelihoods, then we follow up.",
              },
            ].map((v) => (
              <div key={v.t} className="card p-6" data-reveal>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500/15 text-forest-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-forest-800">
                  {v.t}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-navy-700/70">
                  {v.d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3" data-reveal>
            <Link href="/programs" className="btn btn-forest">
              See our programmes
              <ArrowRightIcon />
            </Link>
            <Link href="/partner-with-us" className="btn btn-ghost">
              Partner with us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
