import { stats } from "@/lib/site";

/**
 * Impact strip.
 *
 * NOTE FOR THE TEAM: the portfolio document gives percentages (48%, 45%…).
 * Percentages without a base number read as vague to a funder. As soon as you
 * can, fill in absolute counts — "12,400 seedlings raised", "340 youth
 * trained", "18 schools visited". The layout below already supports both, and
 * swaps to a progress bar once `target_value` exists in Supabase.
 */
export default function ImpactStats() {
  return (
    <section id="impact" className="section bg-cream-200">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">Our Impact</span>
            <h2 className="mt-4 font-display text-h2">
              Real work, measured honestly.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Every figure below comes from activity we can show you photographs
              of. We publish what we did, where we did it, and what still needs
              support.
            </p>
          </div>
          <p className="max-w-xs shrink-0 rounded-2xl border border-dashed border-gold-500/50 bg-gold-500/5 p-4 text-xs leading-relaxed text-navy-700/65">
            <strong className="font-display text-gold-700">Data note:</strong>{" "}
            figures shown are from the current portfolio. Verified totals and
            targets load live from our impact database.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => (
            <article
              key={s.id}
              className="stat-card group"
              style={{ borderTopColor: i % 2 === 0 ? "#22C55E" : "#D89B32" }}
              data-reveal
            >
              <p className="font-display text-4xl font-extrabold tracking-tight text-forest-800 tabular-nums">
                {s.value !== null
                  ? s.value.toLocaleString()
                  : `${s.percent ?? 0}%`}
              </p>
              <p className="mt-2 font-display text-[0.9375rem] font-bold leading-snug text-navy-700">
                {s.label}
              </p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-navy-700/55">
                {s.note}
              </p>

              {/* progress track — fills once a target exists */}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sage-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-forest-500 to-leaf-500 transition-[width] duration-1000 ease-out"
                  style={{ width: `${Math.min(s.percent ?? 0, 100)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
