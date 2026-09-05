import Link from "next/link";
import { partnershipTiers } from "@/lib/site";
import { ArrowRightIcon, CheckIcon, HeartHandIcon } from "@/components/icons";

export default function PartnerCTA() {
  return (
    <section id="partners" className="section bg-sage-100">
      <div className="shell">
        <div className="overflow-hidden rounded-[2rem] bg-forest-800 shadow-lift" data-reveal>
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            {/* Left: the pitch */}
            <div className="grain relative p-8 md:p-12">
              <span className="eyebrow eyebrow--light">For Sponsors & Partners</span>
              <h2 className="mt-5 font-display text-h2 !text-white">
                Your support becomes trees, skills and confident young people.
              </h2>
              <p className="mt-5 text-lead text-cream-200/80">
                Lelwak Stars is already active, already organised and already
                producing results on the ground. What we need is scale — more
                nursery beds, more training cohorts, more schools reached.
              </p>

              <ul className="mt-8 space-y-3.5">
                {[
                  "Transparent reporting with photographs from every activity",
                  "Direct visibility: your name or logo on the work you fund",
                  "Youth-led delivery with local administration buy-in",
                  "Flexible: in-kind, one-off, annual or multi-year partnership",
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-[0.9375rem] text-cream-200/85">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-forest-950">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/partner-with-us" className="btn btn-primary !px-6 !py-3">
                  <HeartHandIcon className="h-4 w-4" />
                  Start a Conversation
                </Link>
                <Link
                  href="/impact"
                  className="btn !text-white"
                  style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.3)" }}
                >
                  See our impact data
                </Link>
              </div>
            </div>

            {/* Right: tiers */}
            <div className="border-t border-white/10 bg-forest-900/40 p-8 md:p-10 lg:border-l lg:border-t-0">
              <p className="font-display text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-500">
                Ways to partner
              </p>
              <div className="mt-5 space-y-3">
                {partnershipTiers.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-2xl p-5 transition-colors ${
                      t.highlight
                        ? "bg-white text-navy-700 shadow-lift"
                        : "bg-white/[0.06] text-cream-200 ring-1 ring-inset ring-white/10"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3
                        className={`font-display text-base font-extrabold ${
                          t.highlight ? "!text-forest-800" : "!text-white"
                        }`}
                      >
                        {t.name}
                        {t.highlight && (
                          <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 align-middle text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-forest-950">
                            Most popular
                          </span>
                        )}
                      </h3>
                      <span
                        className={`shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${
                          t.highlight ? "text-gold-600" : "text-leaf-300"
                        }`}
                      >
                        {t.amount}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-[0.8125rem] leading-relaxed ${
                        t.highlight ? "text-navy-700/75" : "text-cream-200/70"
                      }`}
                    >
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/partners"
                className="mt-6 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-bold text-leaf-300 transition-colors hover:text-white"
              >
                Full partnership details
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
