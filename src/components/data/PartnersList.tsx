"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPartners } from "@/lib/data";
import { ArrowRightIcon } from "@/components/icons";

type Partner = { id: string; name: string; contribution: string | null };

/** Named partners from Supabase, or the community-stakeholders placeholder. */
export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPartners().then((rows) => alive && setPartners(rows));
    return () => {
      alive = false;
    };
  }, []);

  if (partners === null) {
    return <div className="mt-10 h-40 animate-pulse rounded-[1.75rem] bg-sage-200" />;
  }

  if (partners.length > 0) {
    return (
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {partners.map((p) => (
          <li key={p.id} className="card p-6 text-center" data-reveal>
            <p className="font-display text-base font-bold text-forest-800">{p.name}</p>
            {p.contribution && (
              <p className="mt-2 text-[0.75rem] leading-relaxed text-navy-700/60">{p.contribution}</p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="mt-10 rounded-[1.75rem] border border-dashed border-forest-300 bg-cream-50 p-10 text-center"
      data-reveal
    >
      <p className="font-display text-lg font-bold text-forest-800">
        Local administration, schools and community stakeholders
      </p>
      <p className="mx-auto mt-3 max-w-xl text-[0.875rem] leading-relaxed text-navy-700/65">
        We work alongside the chief&apos;s office, local schools and community
        groups. Named institutional partners and their logos will be listed here
        as those relationships are formalised — including yours.
      </p>
      <Link href="/partner-with-us" className="btn btn-forest mt-6">
        Be our next named partner
        <ArrowRightIcon />
      </Link>
    </div>
  );
}
