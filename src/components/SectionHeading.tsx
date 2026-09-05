import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  tone = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: { href: string; label: string };
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-6 ${
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
      data-reveal
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        <span className={`eyebrow ${tone === "light" ? "eyebrow--light" : ""}`}>
          {eyebrow}
        </span>
        <h2
          className={`mt-4 font-display text-h2 ${
            tone === "light" ? "!text-white" : "!text-forest-800"
          }`}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={`mt-4 text-lead ${
              tone === "light" ? "text-cream-200/75" : "text-navy-700/70"
            }`}
          >
            {lead}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={`btn shrink-0 ${tone === "light" ? "btn-primary" : "btn-ghost"}`}
        >
          {action.label}
          <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}
