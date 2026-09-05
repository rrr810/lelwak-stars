import { framework } from "@/lib/site";

export default function FrameworkSection() {
  return (
    <section className="grain relative overflow-hidden bg-navy-700 py-20 text-cream-200 md:py-28">
      {/* decorative topographic lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 1200 600"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M-50 ${80 + i * 62} C 250 ${20 + i * 62}, 520 ${150 + i * 58}, 800 ${
              70 + i * 62
            } S 1150 ${160 + i * 55}, 1260 ${90 + i * 62}`}
            fill="none"
            stroke="#22C55E"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="shell relative">
        <div className="max-w-2xl" data-reveal>
          <span className="eyebrow eyebrow--light">How We Work</span>
          <h2 className="mt-4 font-display text-h2 !text-white">
            A framework partners can audit.
          </h2>
          <p className="mt-4 text-lead text-cream-200/70">
            We don&apos;t run activities at random. Every programme moves through
            four stages — and we report on each of them.
          </p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {framework.map((f, i) => (
            <li
              key={f.step}
              className="group relative bg-navy-700 p-7 transition-colors duration-300 hover:bg-navy-600"
              data-reveal
            >
              <span className="font-display text-[3.5rem] font-extrabold leading-none text-white/10 transition-colors duration-300 group-hover:text-leaf-500/30">
                {f.step}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold !text-white">
                {f.title}
              </h3>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-cream-200/65">
                {f.text}
              </p>
              {i < framework.length - 1 && (
                <span className="absolute right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-gold-500 to-transparent lg:block" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
