"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site";
import { ArrowRightIcon, CloseIcon, Logo, MenuIcon } from "@/components/icons";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <>
      {/* Utility bar — only once scrolled or on inner pages */}
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? "bg-forest-900 text-cream-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="shell flex h-9 items-center justify-between text-[0.75rem] font-medium">
          <span className="truncate opacity-90">
            Youth-led CBO · Tree nurseries · Agripreneurship · School mentorship
          </span>
          <a
            href={`mailto:${site.contact.email}`}
            className="hidden shrink-0 underline-offset-4 hover:underline sm:block"
          >
            {site.contact.email}
          </a>
        </div>
      </div>

      <header
        className={`fixed inset-x-0 z-50 transition-all duration-300 ${
          scrolled || !isHome ? "top-9" : "top-0"
        }`}
      >
        <div
          className={`transition-all duration-300 ${
            transparent
              ? "bg-transparent"
              : "border-b border-cream-300 bg-cream-50/85 shadow-soft backdrop-blur-xl"
          }`}
        >
          <div className="shell flex h-[4.5rem] items-center justify-between gap-4">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              aria-label={`${site.name} — home`}
            >
              <Logo className="h-10 w-10 transition-transform duration-300 group-hover:-rotate-6" />
              <span className="flex flex-col leading-none">
                <span
                  className={`font-display text-[1.0625rem] font-extrabold tracking-tight ${
                    transparent ? "text-white" : "text-forest-800"
                  }`}
                >
                  LELWAK <span className="text-gold-500">STARS</span>
                </span>
                <span
                  className={`mt-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.22em] ${
                    transparent ? "text-leaf-300" : "text-forest-600"
                  }`}
                >
                  CBO
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative rounded-full px-3.5 py-2 text-[0.875rem] font-semibold transition-colors ${
                      transparent
                        ? active
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                        : active
                          ? "text-forest-800"
                          : "text-navy-700/70 hover:text-forest-700"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-gold-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/partner-with-us"
                className={`btn btn-primary hidden !px-5 !py-2.5 !text-[0.8125rem] md:inline-flex ${
                  transparent ? "" : ""
                }`}
              >
                Partner With Us
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
                  transparent
                    ? "text-white hover:bg-white/15"
                    : "text-forest-800 hover:bg-sage-100"
                }`}
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-navy-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 top-0 origin-top rounded-b-[2rem] bg-cream-50 px-5 pb-8 pt-24 shadow-lift transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between border-b border-cream-300 py-4 font-display text-lg font-bold transition-colors ${
                    active ? "text-forest-800" : "text-navy-700"
                  }`}
                >
                  {item.label}
                  <ArrowRightIcon
                    className={`h-4 w-4 ${active ? "text-gold-500" : "text-cream-400"}`}
                  />
                </Link>
              );
            })}
          </nav>
          <Link href="/partner-with-us" className="btn btn-primary mt-6 w-full">
            Partner With Us
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <div className="mt-5 text-center text-sm text-navy-700/70">
            <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
              {site.contact.email}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
