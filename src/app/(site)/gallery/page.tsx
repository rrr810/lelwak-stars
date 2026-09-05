import type { Metadata } from "next";
import GalleryBody from "@/components/data/GalleryBody";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from Lelwak Stars CBO activities: tree nurseries, planting days, school mentorship, youth training and community engagement.",
};


export default async function GalleryPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-forest-800 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Photo Archive</span>
          <h1 className="mt-5 font-display text-display !text-white">
            The gallery.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Photographs from our nurseries, planting days, school visits,
            training sessions and community meetings. Filter by activity to see
            exactly what your support would fund.
          </p>
        </div>
      </header>

      <section className="section bg-cream-200">
        <div className="shell">
          <GalleryBody />
        </div>
      </section>

    </div>
  );
}
