"use client";

import { useEffect, useState } from "react";
import GalleryGrid, { type GalleryImage } from "@/components/GalleryGrid";
import { fetchGallery } from "@/lib/data";
import { galleryCategories } from "@/lib/site";

/** Homepage gallery: live from Supabase, graceful placeholder until photos exist. */
export default function HomeGallery() {
  const [images, setImages] = useState<GalleryImage[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGallery({ limit: 12 }).then((rows) => alive && setImages(rows));
    return () => {
      alive = false;
    };
  }, []);

  if (images === null) {
    return <div className="mt-10 grid auto-rows-[9.5rem] gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="row-span-2 animate-pulse rounded-2xl bg-sage-200" />
      ))}
    </div>;
  }

  if (images.length > 0) {
    return (
      <div className="mt-10">
        <GalleryGrid images={images} columns={4} showFilters limit={12} />
      </div>
    );
  }

  return <ArchivePlaceholder />;
}

function ArchivePlaceholder() {
  return (
    <div className="mt-10" data-reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {galleryCategories.map((c) => (
          <div
            key={c.id}
            className="group relative flex min-h-[11rem] flex-col justify-end overflow-hidden rounded-2xl bg-forest-800 p-5 shadow-soft"
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
              <p className="mt-1.5 font-display text-lg font-extrabold text-white">{c.label}</p>
              <p className="mt-1 text-[0.75rem] text-cream-200/60">Awaiting upload</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-2xl border border-dashed border-forest-300 bg-sage-100 p-5 text-center text-sm leading-relaxed text-navy-700/70">
        <strong className="font-display text-forest-800">
          The photo archive isn&apos;t connected yet.
        </strong>{" "}
        Once the Lelwak Stars photographs are uploaded, they are automatically
        compressed to WebP, thumbnailed, tagged by activity and displayed here
        with captions and a full-screen lightbox.
      </p>
    </div>
  );
}
