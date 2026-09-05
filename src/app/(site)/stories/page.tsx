import type { Metadata } from "next";
import StoriesList from "@/components/data/StoriesList";

export const metadata: Metadata = {
  title: "Stories & Activities",
  description:
    "Community activity stories from Lelwak Stars CBO — tree nurseries, planting days, school mentorship visits and youth agripreneurship training.",
};

export default function StoriesPage() {
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
          <StoriesList />
        </div>
      </section>
    </div>
  );
}
