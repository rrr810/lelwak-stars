"use client";

import { useEffect, useState } from "react";
import { fetchImpactStats } from "@/lib/data";
import { stats as seedStats } from "@/lib/site";

type Row = {
  key: string;
  label: string;
  value: number | null;
  percent: number | null;
  note: string;
};

/**
 * Impact strip — live verified counts from the impact database.
 * Falls back to the portfolio seed only if Supabase is unreachable.
 */
export default function ImpactStats() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchImpactStats().then((live) => {
      if (!alive) return;
      if (live && live.length > 0) {
        setRows(
          live.map((r) => ({
            key: r.key,
            label: r.label,
            value: r.value,
            percent: r.percent === null ? null : Number(r.percent),
            note: r.note,
          })),
        );
      } else {
        setRows(seedStats.map((s) => ({ key: s.id, label: s.label, value: s.value, percent: s.percent, note: s.note })));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = rows ?? [];

  return (
    <section id="impact" className="section bg-cream-200">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">Our Impact</span>
            <h2 className="mt-4 font-display text-h2">Real work, measured honestly.</h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Every figure below comes from activity we can show you photographs
              of. We publish what we did, where we did it, and what still needs
              support.
            </p>
          </div>
          <p className="max-w-xs shrink-0 rounded-2xl border border-dashed border-gold-500/50 bg-gold-500/5 p-4 text-xs leading-relaxed text-navy-700/65">
            <strong className="font-display text-gold-700">Data note:</strong>{" "}
            verified counts from our field records, September 2026 — school by
            school, nursery by nursery. Targets join each figure as programmes
            grow.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <article
              key={s.key}
              className="stat-card group"
              style={{ borderTopColor: i % 2 === 0 ? "#22C55E" : "#D89B32" }}
              data-reveal
            >
              <p className="font-display text-4xl font-extrabold tracking-tight text-forest-800 tabular-nums">
                {s.value !== null ? s.value.toLocaleString() : `${s.percent ?? 0}%`}
              </p>
              <p className="mt-2 font-display text-[0.9375rem] font-bold leading-snug text-navy-700">
                {s.label}
              </p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-navy-700/55">{s.note}</p>

              {s.percent != null ? (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sage-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-forest-500 to-leaf-500 transition-[width] duration-1000 ease-out"
                    style={{ width: `${Math.min(s.percent, 100)}%` }}
                  />
                </div>
              ) : (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-forest-700">
                  ✓ verified count
                </p>
              )}
            </article>
          ))}
          {rows === null &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-[1.25rem] bg-sage-200" />
            ))}
        </div>
      </div>
    </section>
  );
}
