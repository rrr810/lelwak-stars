import Link from "next/link";
import type { Metadata } from "next";
import ImpactGrid from "@/components/data/ImpactGrid";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Measured results from Lelwak Stars CBO: seedlings grown, youth trained, students mentored and community education reached.",
};


export default async function ImpactPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-forest-800 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Impact & Reporting</span>
          <h1 className="mt-5 font-display text-display !text-white">
            What we can account for.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Funders are asked to trust numbers. We would rather show you the
            activity behind them. This page carries our published indicators and
            explains exactly how each one is counted.
          </p>
        </div>
      </header>

      <section className="section bg-cream-200">
        <div className="shell">
          <ImpactGrid />

          {/* Methodology */}
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              {
                t: "How we count seedlings",
                d: "Nursery bed records: bags sown, germination, seedlings hardened off and distributed. Post-planting survival is checked on follow-up visits.",
              },
              {
                t: "How we count people reached",
                d: "Attendance registers per session, signed by the facilitator and, for schools, by the institution. No double-counting across sessions.",
              },
              {
                t: "How we report to partners",
                d: "Photographs, dates, locations and participant numbers for every funded activity — plus a written summary of what changed and what still needs support.",
              },
            ].map((m) => (
              <div key={m.t} className="card p-7" data-reveal>
                <h3 className="font-display text-h3">{m.t}</h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-navy-700/70">
                  {m.d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[1.75rem] border border-dashed border-gold-500/50 bg-gold-500/[0.06] p-7" data-reveal>
            <h3 className="font-display text-h3 !text-gold-700">
              One thing we want to fix
            </h3>
            <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-navy-700/75">
              Our portfolio currently reports percentages — 48% seedlings grown,
              45% youth trained. A percentage without a denominator is hard for a
              funder to verify. Our next reporting cycle will publish absolute
              counts and targets instead:{" "}
              <em>&ldquo;X seedlings raised against a target of Y&rdquo;</em>. That is
              what makes an impact page credible, and it is what this database
              schema is already built to hold.
            </p>
            <Link href="/partner-with-us" className="btn btn-forest mt-6">
              Ask for our latest report
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
