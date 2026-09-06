"use client";

/** Small shared UI kit for the admin dashboard. Brand tokens, no libraries. */

import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-navy-700/10 bg-white p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-navy-700/50">
        {label}
      </span>
      <span className="font-display text-3xl font-extrabold text-forest-800">{value}</span>
      {hint ? <span className="text-[0.75rem] text-navy-700/55">{hint}</span> : null}
    </Card>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900">{title}</h1>
        {sub ? <p className="mt-1 text-[0.8125rem] text-navy-700/60">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ charts */

/** 30-day vertical bar chart, pure SVG. */
export function DayBars({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 600;
  const H = 140;
  const bw = W / Math.max(1, data.length);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Views per day, last 30 days">
        {data.map((d, i) => {
          const h = (d.count / max) * (H - 18);
          return (
            <g key={d.day}>
              <rect
                x={i * bw + 1.5}
                y={H - 16 - h}
                width={bw - 3}
                height={Math.max(h, d.count > 0 ? 2 : 0.75)}
                rx={2}
                fill={d.count > 0 ? "#22C55E" : "#DDEBDD"}
              />
              <title>{`${d.day}: ${d.count} views`}</title>
            </g>
          );
        })}
        <line x1={0} y1={H - 15.5} x2={W} y2={H - 15.5} stroke="#12304722" />
      </svg>
      <div className="mt-1 flex justify-between text-[0.6875rem] text-navy-700/50">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}

/** Horizontal ranked bars (top pages, referrers, inquiry types). */
export function RankBars({ items, unit = "" }: { items: { label: string; count: number }[]; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex justify-between text-[0.75rem] text-navy-700/75">
            <span className="truncate pr-3">{i.label}</span>
            <span className="shrink-0 font-bold text-navy-900">
              {i.count}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-sage-100">
            <div
              className="h-1.5 rounded-full bg-forest-600"
              style={{ width: `${Math.max(3, (i.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
      {items.length === 0 ? <li className="text-[0.8125rem] text-navy-700/50">No data yet.</li> : null}
    </ul>
  );
}

/* ------------------------------------------------------------------ forms */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[0.6875rem] text-navy-700/45">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-navy-700/15 bg-white px-3 py-2 text-[0.875rem] text-navy-900 outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-forest-600" : "bg-navy-700/25"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[1.125rem]" : "left-0.5"}`}
        />
      </span>
      <span className="text-[0.8125rem] font-medium text-navy-700/80">{label}</span>
    </button>
  );
}

export function Badge({ tone, children }: { tone: "green" | "gold" | "clay" | "navy"; children: ReactNode }) {
  const tones = {
    green: "bg-sage-100 text-forest-800",
    gold: "bg-gold-600/15 text-gold-600",
    clay: "bg-clay-500/15 text-clay-500",
    navy: "bg-navy-700/10 text-navy-700",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  kind = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const kinds = {
    primary: "bg-forest-700 text-white hover:bg-forest-800",
    ghost: "border border-navy-700/20 text-navy-700 hover:bg-navy-700/5",
    danger: "bg-clay-500/10 text-clay-500 hover:bg-clay-500/20",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-[0.8125rem] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${kinds[kind]}`}
    >
      {children}
    </button>
  );
}

export function Notice({ tone, children }: { tone: "ok" | "err" | "info"; children: ReactNode }) {
  const tones = {
    ok: "bg-sage-100 text-forest-900",
    err: "bg-clay-500/10 text-clay-500",
    info: "bg-navy-700/5 text-navy-700",
  } as const;
  return <p className={`rounded-xl px-3.5 py-2.5 text-[0.8125rem] font-medium ${tones[tone]}`}>{children}</p>;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-navy-700/50">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-700/30 border-t-forest-600" />
      <span className="text-[0.8125rem] font-medium">Loading…</span>
    </div>
  );
}
