import Link from "next/link";
import { nav, programs, site } from "@/lib/site";
import {
  ArrowRightIcon,
  Logo,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/icons";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="grain relative mt-auto overflow-hidden bg-forest-900 text-cream-200">
      {/* Top CTA strip */}
      <div className="border-b border-white/10 bg-forest-800">
        <div className="shell flex flex-col items-start justify-between gap-5 py-9 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-white md:text-3xl">
              Partner with Lelwak Stars
            </p>
            <p className="mt-1.5 max-w-xl text-[0.9375rem] text-cream-200/75">
              Support young people. Restore communities. Grow a greener future.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/partner-with-us" className="btn btn-primary">
              Become a Partner
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="btn !text-white"
              style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.35)" }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <Logo className="h-11 w-11" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold tracking-tight text-white">
                LELWAK <span className="text-gold-500">STARS</span>
              </span>
              <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-leaf-300">
                Community Based Organisation
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-cream-200/70">
            {site.description}
          </p>

          <ul className="mt-6 space-y-2.5 text-[0.875rem]">
            {site.contact.email && (
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-4 w-4 text-leaf-400" />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  {site.contact.email}
                </a>
              </li>
            )}
            {site.contact.phone && (
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 text-leaf-400" />
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  {site.contact.phone}
                </a>
              </li>
            )}
            {site.contact.whatsapp && (
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-4 w-4 text-leaf-400" />
                <a
                  href={`https://wa.me/${site.contact.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  WhatsApp us
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" />
              <span className="text-cream-200/70">
                {site.location.region}
                {!site.location.addressLine && (
                  <span className="ml-1 italic opacity-60">(address TBC)</span>
                )}
              </span>
            </li>
          </ul>
        </div>

        {/* Explore */}
        <div className="lg:col-span-2">
          <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-500">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-[0.875rem]">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-cream-200/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="text-cream-200/70 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Our work */}
        <div className="lg:col-span-3">
          <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-500">
            Our Work
          </h3>
          <ul className="mt-4 space-y-2.5 text-[0.875rem]">
            {programs.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/programs#${p.id}`}
                  className="text-cream-200/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {p.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For partners */}
        <div className="lg:col-span-3">
          <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-500">
            For Partners & Sponsors
          </h3>
          <ul className="mt-4 space-y-2.5 text-[0.875rem] text-cream-200/70">
            <li>
              <Link href="/partners" className="underline-offset-4 hover:text-white hover:underline">
                Partnership tiers
              </Link>
            </li>
            <li>
              <Link href="/impact" className="underline-offset-4 hover:text-white hover:underline">
                Impact & reporting
              </Link>
            </li>
            <li>
              <Link href="/stories" className="underline-offset-4 hover:text-white hover:underline">
                Activity stories
              </Link>
            </li>
            <li>
              <Link href="/about" className="underline-offset-4 hover:text-white hover:underline">
                Governance & registration
              </Link>
            </li>
            <li>
              <Link href="/contact" className="underline-offset-4 hover:text-white hover:underline">
                Request a proposal pack
              </Link>
            </li>
          </ul>

          {site.registration.number ? (
            <p className="mt-5 rounded-xl bg-white/5 p-3 text-[0.75rem] leading-relaxed text-cream-200/60">
              Registered CBO · {site.registration.number}
              {site.registration.issuedBy && <><br />{site.registration.issuedBy}</>}
            </p>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-white/15 p-3 text-[0.75rem] leading-relaxed text-cream-200/45">
              CBO registration number to be added — sponsors usually ask for this.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-[0.75rem] text-cream-200/50 sm:flex-row">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-leaf-500" />
            Youth-led · Community-rooted · Accountable
          </p>
        </div>
      </div>
    </footer>
  );
}
