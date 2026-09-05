import Link from "next/link";
import type { Metadata } from "next";
import { programs } from "@/lib/site";
import { programIcons, ArrowRightIcon, CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Tree nurseries and reforestation, agripreneurship empowerment, school mentorship and capacity building — the four programmes Lelwak Stars CBO runs.",
};

export default function ProgramsPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-forest-800 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Our Work</span>
          <h1 className="mt-5 font-display text-display !text-white">
            Four programmes, run by the community they serve.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Lelwak Stars works where environmental restoration and youth
            livelihood meet. Each programme below has active participants, a
            defined method, and results we can show you.
          </p>
          <Link href="/partner-with-us" className="btn btn-primary mt-8">
            Support a programme
            <ArrowRightIcon />
          </Link>
        </div>
      </header>

      <div className="section bg-cream-200">
        <div className="shell space-y-16">
          {programs.map((p, i) => {
            const Icon = programIcons[p.icon];
            const flip = i % 2 === 1;
            return (
              <article
                key={p.id}
                id={p.id}
                className="scroll-mt-32"
                data-reveal
              >
                <div
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    flip ? "lg:[direction:rtl]" : ""
                  }`}
                >
                  <div className="relative overflow-hidden rounded-[1.75rem] shadow-lift lg:[direction:ltr]">
                    <div className="aspect-[4/3]">
                      {/* TODO: real programme photograph */}
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span
                      className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white shadow-soft"
                      style={{ backgroundColor: p.accent }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      Pillar {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="lg:[direction:ltr]">
                    <span
                      className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: p.accentSoft, color: p.accent }}
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <h2 className="mt-5 font-display text-h2" style={{ color: p.accent }}>
                      {p.name}
                    </h2>
                    <p className="mt-4 text-lead text-navy-700/75">{p.blurb}</p>

                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {p.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex gap-2.5 rounded-xl bg-white p-3 text-[0.8125rem] leading-snug text-navy-700/80 shadow-soft"
                        >
                          <span
                            className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: p.accent }}
                          >
                            <CheckIcon className="h-2.5 w-2.5" />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>

                    <div
                      className="mt-6 rounded-2xl p-5"
                      style={{ backgroundColor: p.accentSoft }}
                    >
                      <p
                        className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: p.accent }}
                      >
                        How a partner helps
                      </p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-navy-700/80">
                        {p.partnerAsk}
                      </p>
                      <Link
                        href="/partner-with-us"
                        className="btn btn-forest mt-4 !px-5 !py-2.5 !text-[0.8125rem]"
                      >
                        Fund this pillar
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
