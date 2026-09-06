import Link from "next/link";
import Hero from "@/components/home/Hero";
import ImpactStats from "@/components/home/ImpactStats";
import ProgramsSection from "@/components/home/ProgramsSection";
import FrameworkSection from "@/components/home/FrameworkSection";
import StoriesPreview from "@/components/home/StoriesPreview";
import PartnerCTA from "@/components/home/PartnerCTA";
import InquiryForm from "@/components/InquiryForm";
import HomeGallery from "@/components/data/HomeGallery";
import { ArrowRightIcon, FacebookIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";

/**
 * Homepage — built around the sponsor journey:
 *   who we are → what we do → proof it works → how you can help → contact
 */
export default async function HomePage() {
  return (
    <>
      <Hero />
      <ImpactStats />
      <ProgramsSection />
      <FrameworkSection />
      <StoriesPreview />

      {/* ---------------- GALLERY ---------------- */}
      <section id="gallery" className="section bg-cream-50">
        <div className="shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
            <div className="max-w-2xl">
              <span className="eyebrow">Photo Archive</span>
              <h2 className="mt-4 font-display text-h2">
                The work, in photographs.
              </h2>
              <p className="mt-4 text-lead text-navy-700/70">
                Nurseries, planting days, classroom mentorship, training
                sessions and meetings with local administration — sorted by
                activity so you can see exactly where support goes.
              </p>
            </div>
            <Link href="/gallery" className="btn btn-ghost shrink-0">
              Open full gallery
              <ArrowRightIcon />
            </Link>
          </div>

          <HomeGallery />
        </div>
      </section>

      <PartnerCTA />

      {/* ---------------- CONTACT ---------------- */}
      <section id="contact" className="section bg-cream-200">
        <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div data-reveal>
            <span className="eyebrow">Get In Touch</span>
            <h2 className="mt-4 font-display text-h2">
              Let&apos;s talk about working together.
            </h2>
            <p className="mt-4 text-lead text-navy-700/70">
              Whether you represent a foundation, a company, a school, a county
              office or you simply want to volunteer — reach out. A real member
              of our team reads every message.
            </p>

            <ul className="mt-8 space-y-4">
              <ContactRow
                icon={<MailIcon className="h-5 w-5" />}
                label="Email"
                value={site.contact.email}
                href={`mailto:${site.contact.email}`}
                note="Best for proposals and formal enquiries"
              />
              <ContactRow
                icon={<PhoneIcon className="h-5 w-5" />}
                label="Phone"
                value={site.contact.phone || "To be confirmed"}
                href={site.contact.phone ? `tel:${site.contact.phone}` : undefined}
                pending={!site.contact.phone}
              />
              <ContactRow
                icon={<WhatsAppIcon className="h-5 w-5" />}
                label="WhatsApp"
                value={site.contact.whatsapp || "To be confirmed"}
                note="Fastest way to reach us"
                pending={!site.contact.whatsapp}
              />
              {site.socials.facebook ? (
                <ContactRow
                  icon={<FacebookIcon className="h-5 w-5" />}
                  label="Facebook"
                  value="Lelwak Stars CBO"
                  href={site.socials.facebook}
                  note="Follow field updates and community calls"
                />
              ) : null}
              <ContactRow
                icon={<PinIcon className="h-5 w-5" />}
                label="Based in"
                value={site.location.region}
                note={site.location.addressLine || "Ward and office address to be added"}
                pending={!site.location.addressLine}
              />
            </ul>

            <div className="mt-8 rounded-2xl border border-gold-500/30 bg-gold-500/[0.07] p-5">
              <p className="font-display text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-gold-700">
                Requesting a proposal pack?
              </p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-navy-700/75">
                Tell us in the form which programme interests you and your
                likely budget range. We&apos;ll send our registration details,
                programme budgets, monitoring approach and recent activity
                reports.
              </p>
            </div>
          </div>

          <div className="card p-7 md:p-9" data-reveal>
            <h3 className="font-display text-h3">Send us a message</h3>
            <p className="mt-1.5 text-sm text-navy-700/60">
              We reply within two working days.
            </p>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  note,
  pending,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  note?: string;
  pending?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          pending ? "bg-sage-200 text-forest-600" : "bg-forest-800 text-white"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-navy-700/45">
          {label}
        </span>
        <span
          className={`block truncate font-display text-[0.9375rem] font-bold ${
            pending ? "text-navy-700/45" : "text-forest-800"
          }`}
        >
          {value}
        </span>
        {note && (
          <span className="mt-0.5 block text-[0.75rem] text-navy-700/55">
            {note}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li>
      {href && !pending ? (
        <a href={href} className="flex items-center gap-4 transition-opacity hover:opacity-80">
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-4">{inner}</div>
      )}
    </li>
  );
}
