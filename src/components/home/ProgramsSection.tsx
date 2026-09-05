import Link from "next/link";
import { programs } from "@/lib/site";
import { programIcons, ArrowRightIcon } from "@/components/icons";

export default function ProgramsSection() {
  return (
    <section id="programs" className="section bg-cream-50">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">Our Work</span>
            <h2 className="mt-4 font-display text-h2">
              Four pillars, one goal: communities that can sustain themselves.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Nothing here is theoretical. Each pillar runs as a live programme
              with participants, locations and results you can visit.
            </p>
          </div>
          <Link href="/programs" className="btn btn-ghost shrink-0">
            All programmes
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {programs.map((p, i) => {
            const Icon = programIcons[p.icon];
            return (
              <article
                key={p.id}
                id={p.id}
                className="card group relative overflow-hidden !rounded-[1.5rem] scroll-mt-32"
                data-reveal
              >
                {/* accent edge */}
                <span
                  className="absolute inset-y-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2.5"
                  style={{ backgroundColor: p.accent }}
                />

                <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
                  <div className="p-7 pl-9 sm:p-8 sm:pl-10">
                    <div className="flex items-start gap-4">
                      <span
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6"
                        style={{ backgroundColor: p.accentSoft, color: p.accent }}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p
                          className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
                          style={{ color: p.accent }}
                        >
                          Pillar {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-1 font-display text-h3 !text-navy-700">
                          {p.name}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-5 text-[0.9375rem] leading-relaxed text-navy-700/75">
                      {p.blurb}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {p.bullets.slice(0, 3).map((b) => (
                        <li key={b} className="flex gap-2.5 text-[0.8125rem] text-navy-700/70">
                          <span
                            className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: p.accent }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: p.accentSoft }}>
                      <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em]" style={{ color: p.accent }}>
                        How a partner helps
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-navy-700/80">
                        {p.partnerAsk}
                      </p>
                    </div>

                    <Link
                      href={`/programs#${p.id}`}
                      className="mt-6 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-bold transition-colors"
                      style={{ color: p.accent }}
                    >
                      Explore this programme
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* image column */}
                  <div className="relative hidden h-full min-h-[16rem] w-44 overflow-hidden sm:block lg:w-56">
                    {/* TODO: real programme photo */}
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 opacity-30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-10"
                      style={{ backgroundColor: p.accent }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
