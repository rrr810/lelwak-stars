"use client";

import { useEffect, useState } from "react";
import { fetchImpactStats } from "@/lib/data";
import { stats as seedStats, type Stat } from "@/lib/site";

type Row = {
  key: string;
  label: string;
  value: number | null;
  percent: number | null;
  note: string;
};

/** Impact figures: live from Supabase when present, otherwise the portfolio seed. */
export default function ImpactGrid() {
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
        setRows(
          seedStats.map((s: Stat) => ({
            key: s.id,
            label: s.label,
            value: s.value,
            percent: s.percent,
            note: s.note,
          })),
        );
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const items = rows ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(rows === null ? [] : items).map((s) => (
        <article key={s.key} className="stat-card" data-reveal>
          <p className="font-display text-5xl font-extrabold tracking-tight text-forest-800 tabular-nums">
            {s.value != null ? s.value.toLocaleString() : `${s.percent ?? 0}%`}
          </p>
          <h2 className="mt-2.5 font-display text-base font-bold text-navy-700">{s.label}</h2>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-navy-700/60">{s.note}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-sage-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-600 to-leaf-500"
              style={{ width: `${Math.min(Number(s.percent ?? 0), 100)}%` }}
            />
          </div>
        </article>
      ))}
      {rows === null &&
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-[1.25rem] bg-sage-200" />
        ))}
    </div>
  );
}
