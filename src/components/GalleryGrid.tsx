"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { galleryCategories } from "@/lib/site";
import { fetchCategories } from "@/lib/data";
import { ArrowRightIcon, CloseIcon } from "@/components/icons";

export type GalleryImage = {
  id: string;
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  category: string;
  location?: string;
  date?: string;
  /** 1-10, controls the masonry row span */
  span?: number;
};

/**
 * Filterable, keyboard-accessible gallery with a lightbox.
 *
 * Images come from Supabase Storage (`gallery` bucket) once connected.
 * Each item ships two paths: a 480px thumb for the grid and a 1600px
 * full-size WebP for the lightbox — so a 300-photo library still loads fast.
 */
export default function GalleryGrid({
  images,
  columns = 4,
  showFilters = true,
  limit,
}: {
  images: GalleryImage[];
  columns?: 3 | 4;
  showFilters?: boolean;
  limit?: number;
}) {
  const [active, setActive] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [cats, setCats] = useState<{ id: string; label: string }[]>([...galleryCategories]);

  useEffect(() => {
    let alive = true;
    fetchCategories().then((live) => {
      if (alive && live.length) setCats(live);
    });
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    const filtered =
      active === "all" ? images : images.filter((i) => i.category === active);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [images, active, limit]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: images.length };
    for (const c of cats) {
      map[c.id] = images.filter((i) => i.category === c.id).length;
    }
    return map;
  }, [images, cats]);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpenIndex((i) =>
        i === null ? null : (i + dir + visible.length) % visible.length,
      ),
    [visible.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  const current = openIndex !== null ? visible[openIndex] : null;

  return (
    <>
      {showFilters && (
        <div className="flex flex-wrap gap-2" data-reveal>
          <FilterChip
            label="All photos"
            count={counts.all}
            active={active === "all"}
            onClick={() => setActive("all")}
          />
          {cats
            .filter((c) => counts[c.id] > 0)
            .map((c) => (
              <FilterChip
                key={c.id}
                label={c.label}
                count={counts[c.id]}
                active={active === c.id}
                onClick={() => setActive(c.id)}
              />
            ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-cream-400 bg-cream-100 p-12 text-center">
          <p className="font-display text-lg font-bold text-forest-800">
            No photos in this category yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-700/60">
            As soon as the Lelwak Stars photo archive is uploaded, this grid
            fills automatically — sorted, captioned and tagged by activity.
          </p>
        </div>
      ) : (
        <div
          className={`mt-8 grid auto-rows-[8.5rem] gap-3 sm:auto-rows-[9.5rem] ${
            columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {visible.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              className={`group relative overflow-hidden rounded-2xl bg-sage-200 text-left transition-shadow duration-300 hover:shadow-lift focus-visible:shadow-lift ${
                (img.span ?? 2) >= 4 ? "row-span-4" : (img.span ?? 2) === 3 ? "row-span-3" : "row-span-2"
              }`}
              aria-label={`View photo: ${img.alt || img.caption || "Lelwak Stars activity"}`}
              data-reveal
            >
              <img
                src={img.thumb || img.src}
                alt={img.alt || img.caption}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-x-3 bottom-3 translate-y-2 text-[0.75rem] font-medium leading-snug text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {img.caption || img.alt}
                {img.location && (
                  <span className="mt-0.5 block text-[0.6875rem] text-leaf-300">
                    {img.location}
                  </span>
                )}
              </span>
              <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-forest-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45" />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || current.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <CloseIcon />
          </button>

          {visible.length > 1 && (
            <>
              <NavButton side="left" onClick={() => step(-1)} />
              <NavButton side="right" onClick={() => step(1)} />
            </>
          )}

          <figure
            className="flex max-h-full w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current.src}
              alt={current.alt || current.caption}
              className="max-h-[76vh] w-auto max-w-full rounded-xl object-contain shadow-lift"
            />
            <figcaption className="mt-4 max-w-2xl text-center">
              <p className="text-[0.9375rem] font-medium text-white">
                {current.caption || current.alt}
              </p>
              {(current.location || current.date) && (
                <p className="mt-1 text-[0.75rem] text-leaf-300/80">
                  {[current.location, current.date].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.14em] text-white/40">
                {(openIndex ?? 0) + 1} / {visible.length}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-200 ${
        active
          ? "bg-forest-800 text-white shadow-soft"
          : "bg-white text-navy-700/75 shadow-soft hover:bg-sage-100 hover:text-forest-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.625rem] tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-sage-200 text-forest-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 ${
        side === "left" ? "left-3 md:left-6" : "right-3 md:right-6"
      }`}
    >
      <ArrowRightIcon
        className={`h-5 w-5 ${side === "left" ? "rotate-180" : ""}`}
      />
    </button>
  );
}
