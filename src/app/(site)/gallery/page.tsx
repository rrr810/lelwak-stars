import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryImages } from "@/lib/gallery";
import { galleryCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from Lelwak Stars CBO activities: tree nurseries, planting days, school mentorship, youth training and community engagement.",
};

export const revalidate = 300;

export default async function GalleryPage() {
  const images = await getGalleryImages();

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
          {images.length > 0 ? (
            <>
              <p className="text-sm font-medium text-navy-700/60">
                {images.length} photograph{images.length === 1 ? "" : "s"} ·{" "}
                {galleryCategories.length} collections
              </p>
              <div className="mt-6">
                <GalleryGrid images={images} columns={4} />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {galleryCategories.map((c) => (
                  <div
                    key={c.id}
                    className="group relative flex min-h-[13rem] flex-col justify-end overflow-hidden rounded-2xl bg-forest-800 p-6 shadow-soft"
                    data-reveal
                  >
                    <div
                      className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40"
                      style={{
                        background:
                          "radial-gradient(120% 100% at 20% 0%, #22C55E 0%, transparent 55%), radial-gradient(100% 100% at 100% 100%, #D89B32 0%, transparent 50%)",
                      }}
                    />
                    <div className="relative">
                      <p className="font-display text-[0.625rem] font-bold uppercase tracking-[0.18em] text-leaf-300">
                        Collection
                      </p>
                      <p className="mt-1.5 font-display text-xl font-extrabold text-white">
                        {c.label}
                      </p>
                      <p className="mt-1 text-[0.75rem] text-cream-200/60">
                        Awaiting upload
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.75rem] border border-dashed border-forest-300 bg-sage-100 p-8 text-center">
                <h2 className="font-display text-h3">
                  The photo archive isn&apos;t connected yet
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-navy-700/70">
                  When the Lelwak Stars photographs are uploaded, each one is
                  automatically resized, compressed to WebP, thumbnailed, tagged
                  by activity, captioned and published here — with full-screen
                  lightbox viewing, lazy loading and keyboard navigation.
                </p>
                <ol className="mx-auto mt-6 max-w-xl space-y-2 text-left text-[0.8125rem] text-navy-700/70">
                  <li>
                    <strong className="font-display text-forest-800">1.</strong>{" "}
                    Photos dropped into the <code>originals</code> bucket (private, untouched).
                  </li>
                  <li>
                    <strong className="font-display text-forest-800">2.</strong>{" "}
                    <code>npm run photos</code> compresses to 1600w + 480w WebP.
                  </li>
                  <li>
                    <strong className="font-display text-forest-800">3.</strong>{" "}
                    Metadata rows are written to <code>public.gallery</code> with
                    category, caption, location and date.
                  </li>
                  <li>
                    <strong className="font-display text-forest-800">4.</strong>{" "}
                    This page renders them. No code changes needed.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
