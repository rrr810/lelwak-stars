import Link from "next/link";
import Hero from "@/components/home/Hero";
import ImpactStats from "@/components/home/ImpactStats";
import ProgramsSection from "@/components/home/ProgramsSection";
import FrameworkSection from "@/components/home/FrameworkSection";
import StoriesPreview from "@/components/home/StoriesPreview";
import PartnerCTA from "@/components/home/PartnerCTA";
import GalleryGrid from "@/components/GalleryGrid";
import InquiryForm from "@/components/InquiryForm";
import { getGalleryImages } from "@/lib/gallery";
import { galleryCategories } from "@/lib/site";
import { ArrowRightIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";

/**
 * Homepage — built around the sponsor journey:
 *   who we are → what we do → proof it works → how you can help → contact
 */
export default async function HomePage() {
  const images = await getGalleryImages({ limit: 12 });

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

          {images.length > 0 ? (
            <div className="mt-10">
              <GalleryGrid images={images} columns={4} showFilters limit={12} />
            </div>
          ) : (
            <ArchivePlaceholder />
          )}
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
                value="info@lelwakstars.org"
                href="mailto:info@lelwakstars.org"
                note="Best for proposals and formal enquiries"
                pending
              />
              <ContactRow
                icon={<PhoneIcon className="h-5 w-5" />}
                label="Phone"
                value="To be confirmed"
                pending
              />
              <ContactRow
                icon={<WhatsAppIcon className="h-5 w-5" />}
                label="WhatsApp"
                value="To be confirmed"
                note="Fastest way to reach us"
                pending
              />
              <ContactRow
                icon={<PinIcon className="h-5 w-5" />}
                label="Based in"
                value="Kenya"
                note="County, sub-county and office address to be added"
                pending
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

/** Shown until the real photo archive is uploaded to Supabase Storage. */
function ArchivePlaceholder() {
  return (
    <div className="mt-10" data-reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {galleryCategories.map((c) => (
          <div
            key={c.id}
            className="group relative flex min-h-[11rem] flex-col justify-end overflow-hidden rounded-2xl bg-forest-800 p-5 shadow-soft"
          >
            <div
              className="absolute inset-0 opacity-25 transition-opacity duration-500 group-hover:opacity-40"
              style={{
                background:
                  "radial-gradient(120% 100% at 20% 0%, #22C55E 0%, transparent 55%), radial-gradient(100% 100% at 100% 100%, #D89B32 0%, transparent 50%)",
              }}
            />
            <div className="relative">
              <p className="font-display text-[0.625rem] font-bold uppercase tracking-[0.18em] text-leaf-300">
                Collection
              </p>
              <p className="mt-1.5 font-display text-lg font-extrabold text-white">
                {c.label}
              </p>
              <p className="mt-1 text-[0.75rem] text-cream-200/60">
                Awaiting upload
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-2xl border border-dashed border-forest-300 bg-sage-100 p-5 text-center text-sm leading-relaxed text-navy-700/70">
        <strong className="font-display text-forest-800">
          The photo archive isn&apos;t connected yet.
        </strong>{" "}
        Once the Lelwak Stars photographs are uploaded, they are automatically
        compressed to WebP, thumbnailed, tagged by activity and displayed here
        with captions and a full-screen lightbox.
      </p>
    </div>
  );
}
