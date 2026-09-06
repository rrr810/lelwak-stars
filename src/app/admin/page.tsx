"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin-client";
import { Badge, Card, DayBars, PageHead, RankBars, Spinner, StatCard } from "@/components/admin/ui";

type View = { path: string; referrer: string | null; view_day: string; session_id: string | null; viewport_w: number | null };
type Inquiry = { id: string; name: string; organisation: string | null; inquiry_type: string; status: string; submitted_at: string; is_priority: boolean };

const days30 = () => {
  const out: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const host = (r: string | null) => {
  if (!r) return "";
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export default function OverviewPage() {
  const { sb } = useAdmin();
  const [views, setViews] = useState<View[] | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [counts, setCounts] = useState<{ photos: number; stories: number; partners: number; held: number } | null>(null);

  useEffect(() => {
    let alive = true;
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    Promise.all([
      sb.from("page_views").select("path,referrer,view_day,session_id,viewport_w").gte("created_at", since),
      sb.from("inquiries").select("id,name,organisation,inquiry_type,status,submitted_at,is_priority").order("submitted_at", { ascending: false }),
      sb.from("gallery").select("id,is_published", { count: "exact", head: true }).eq("is_published", true),
      sb.from("gallery").select("id", { count: "exact", head: true }).eq("is_published", false),
      sb.from("stories").select("id", { count: "exact", head: true }).eq("is_published", true),
      sb.from("partners").select("id", { count: "exact", head: true }).eq("is_published", true),
    ]).then(([v, q, g, held, s, p]) => {
      if (!alive) return;
      setViews((v.data ?? []) as View[]);
      setInquiries((q.data ?? []) as Inquiry[]);
      setCounts({
        photos: g.count ?? 0,
        held: held.count ?? 0,
        stories: s.count ?? 0,
        partners: p.count ?? 0,
      });
    });
    return () => {
      alive = false;
    };
  }, [sb]);

  const stats = useMemo(() => {
    const list = views ?? [];
    const byDay = new Map(days30().map((d) => [d, 0]));
    const byPath = new Map<string, number>();
    const byRef = new Map<string, number>();
    let mobile = 0;
    const sessions = new Set<string>();
    for (const v of list) {
      byDay.set(v.view_day, (byDay.get(v.view_day) ?? 0) + 1);
      byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1);
      const h = host(v.referrer);
      if (h) byRef.set(h, (byRef.get(h) ?? 0) + 1);
      if (v.session_id) sessions.add(v.session_id);
      if (v.viewport_w && v.viewport_w < 768) mobile++;
    }
    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));
    return {
      series: days30().map((day) => ({ day, count: byDay.get(day) ?? 0 })),
      total: list.length,
      sessions: sessions.size,
      mobilePct: list.length ? Math.round((mobile / list.length) * 100) : 0,
      topPaths: top(byPath, 6),
      topRefs: top(byRef, 5),
      newInquiries: (inquiries ?? []).filter((i) => i.status === "new").length,
      byType: top(new Map((inquiries ?? []).map((i) => [i.inquiry_type, 0]).concat([] as [string, number][]).map(([k]) => [k, (inquiries ?? []).filter((i) => i.inquiry_type === k).length] as [string, number])), 7),
    };
  }, [views, inquiries]);

  if (!views || !inquiries || !counts) return <Spinner />;

  return (
    <>
      <PageHead
        title="Overview"
        sub="Traffic, enquiries and content health — last 30 days."
        action={
          <Link href="/admin/inquiries" className="rounded-xl bg-forest-700 px-4 py-2 text-[0.8125rem] font-bold text-white hover:bg-forest-800">
            {stats.newInquiries > 0 ? `${stats.newInquiries} new enquiries →` : "Open enquiries →"}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Page views" value={stats.total} hint="last 30 days" />
        <StatCard label="Visitors (sessions)" value={stats.sessions} hint={`${stats.mobilePct}% on phones`} />
        <StatCard label="New enquiries" value={stats.newInquiries} hint={`${inquiries.length} all-time`} />
        <StatCard label="Live content" value={`${counts.photos}·${counts.stories}·${counts.partners}`} hint="photos · stories · partners" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="mb-4 font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Views per day
          </h2>
          <DayBars data={stats.series} />
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Top pages
          </h2>
          <RankBars items={stats.topPaths} />
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Where visitors come from
          </h2>
          <RankBars items={stats.topRefs} />
          <p className="mt-3 text-[0.6875rem] text-navy-700/45">
            Direct visits (no referrer) are not listed.
          </p>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Enquiries by type
          </h2>
          <RankBars items={stats.byType} />
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-navy-700/60">
            Latest enquiries
          </h2>
          {counts.held > 0 ? <Badge tone="gold">{counts.held} photos awaiting review</Badge> : null}
        </div>
        <ul className="mt-4 divide-y divide-navy-700/8">
          {inquiries.slice(0, 5).map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[0.8125rem]">
              <span className="font-bold text-navy-900">{i.name}</span>
              {i.organisation ? <span className="text-navy-700/60">{i.organisation}</span> : null}
              <Badge tone="navy">{i.inquiry_type}</Badge>
              {i.is_priority ? <Badge tone="gold">priority</Badge> : null}
              <span className="ml-auto text-[0.75rem] text-navy-700/45">
                {new Date(i.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </li>
          ))}
          {inquiries.length === 0 ? (
            <li className="py-3 text-[0.8125rem] text-navy-700/50">No enquiries yet — the form is live and waiting.</li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}
