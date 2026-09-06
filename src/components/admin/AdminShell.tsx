"use client";

/**
 * Admin shell: login gate + sidebar navigation.
 *
 * The whole dashboard is client-rendered; on GitHub Pages it ships as static
 * HTML that boots into a Supabase Auth session. Nothing renders and no data
 * is fetched until a signed-in session exists, and every query then runs with
 * the user's JWT against Row-Level-Security policies limited to members of
 * public.admin_members / public.admin_users.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAdmin } from "@/lib/admin-client";
import { Btn, Field, inputCls, Notice, Spinner } from "@/components/admin/ui";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◔" },
  { href: "/admin/inquiries", label: "Enquiries", icon: "✉" },
  { href: "/admin/gallery", label: "Gallery", icon: "▤" },
  { href: "/admin/stories", label: "Stories", icon: "❡" },
  { href: "/admin/partners", label: "Partners", icon: "⚭" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

function Login({ onSignIn }: { onSignIn: (e: string, p: string) => Promise<string | null> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-forest-950 px-4">
      <form
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const error = await onSignIn(email, password);
          setErr(error);
          setBusy(false);
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-lg text-white">
            🌱
          </span>
          <div>
            <p className="font-display text-lg font-extrabold text-navy-900">Lelwak Stars Admin</p>
            <p className="text-[0.75rem] text-navy-700/55">Content & analytics dashboard</p>
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lelwakstars.org"
            />
          </Field>
          <Field label="Password">
            <input
              className={inputCls}
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          {err ? <Notice tone="err">{err}</Notice> : null}
          <Btn type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Btn>
        </div>
        <p className="mt-5 text-[0.6875rem] leading-relaxed text-navy-700/45">
          Access is limited to organisation accounts. Forgot a password? Reset
          it from Settings after signing in, or ask the dashboard owner.
        </p>
      </form>
    </main>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const { session, loading, signIn, signOut } = useAdmin();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100">
        <Spinner />
      </div>
    );
  }
  if (!session) return <Login onSignIn={signIn} />;

  return (
    <div className="min-h-screen bg-cream-100 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* ------------------------------------------------------- sidebar */}
      <aside className="flex flex-col gap-6 border-b border-navy-700/10 bg-forest-950 px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500 text-base">🌱</span>
          <span>
            <span className="block font-display text-[0.9375rem] font-extrabold text-white">
              Lelwak Stars
            </span>
            <span className="block text-[0.625rem] font-bold uppercase tracking-[0.18em] text-leaf-500">
              Admin
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] font-bold transition ${
                  active ? "bg-leaf-500 text-forest-950" : "text-cream-200/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span aria-hidden className="w-4 text-center">
                  {n.icon}
                </span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            href="/"
            className="block text-[0.75rem] font-medium text-cream-200/60 underline-offset-2 hover:text-white hover:underline"
          >
            View public site ↗
          </Link>
          <p className="truncate text-[0.6875rem] text-cream-200/45">{session.user.email}</p>
          <button
            onClick={() => void signOut()}
            className="rounded-xl border border-white/15 px-3 py-1.5 text-[0.75rem] font-bold text-cream-200/80 transition hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------------- content */}
      <main className="px-4 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
