import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowRightIcon } from "@/components/icons";

export default function Hero() {
  return (
    <section className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-950">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        {/* TODO: replace with a real Lelwak Stars field photo */}
        <img
          src="/images/placeholder-hero.jpg"
          alt="Lelwak Stars youth members raising tree seedlings at a community nursery"
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/75 to-forest-900/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-transparent to-transparent" />
      </div>

      <div className="shell relative w-full pb-16 pt-36 md:pb-24">
        <div className="max-w-3xl">
          <span className="eyebrow eyebrow--light" data-reveal>
            Youth-led Community Based Organisation
          </span>

          <h1
            className="mt-6 font-display text-display font-extrabold text-white"
            data-reveal
          >
            We equip young people to grow{" "}
            <span className="relative whitespace-nowrap text-leaf-400">
              greener
              <svg
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-2.5 w-full text-gold-500"
                aria-hidden="true"
              >
                <path
                  d="M2 8C40 3 90 2 198 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            , stronger communities.
          </h1>

          <p
            className="mt-7 max-w-2xl text-lead text-cream-200/85"
            data-reveal
          >
            {site.shortName} works alongside schools, farmers and local
            administration to restore degraded land through community tree
            nurseries, and to turn that same land into livelihood through
            agripreneurship training and mentorship.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3" data-reveal>
            <Link href="/partner-with-us" className="btn btn-primary !px-7 !py-3.5 !text-base">
              Partner With Lelwak Stars
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/programs"
              className="btn btn-light !px-7 !py-3.5 !text-base"
            >
              See Our Work
            </Link>
          </div>

          {/* Trust strip */}
          <dl
            className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4"
            data-reveal
          >
            {[
              { k: "4", l: "Programme pillars" },
              { k: "Youth", l: "Led and governed" },
              { k: "Schools", l: "Mentorship visits" },
              { k: "Nurseries", l: "Community managed" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-extrabold text-white">
                  {s.k}
                </dt>
                <dd className="mt-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-leaf-300/80">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <span className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
          <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
        </span>
      </div>
    </section>
  );
}
