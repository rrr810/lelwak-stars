import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { inquiryTypes, site } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Lelwak Stars CBO about sponsorship, partnership, volunteering, school mentorship visits or media enquiries.",
};

export default function ContactPage() {
  return (
    <div className="pt-[7.5rem]">
      <header className="grain relative overflow-hidden bg-navy-700 py-20 text-cream-200 md:py-24">
        <div className="shell relative max-w-3xl">
          <span className="eyebrow eyebrow--light">Contact</span>
          <h1 className="mt-5 font-display text-display !text-white">
            Talk to us.
          </h1>
          <p className="mt-6 text-lead text-cream-200/80">
            Sponsorship, partnership, volunteering, a school that wants a
            mentorship visit, or a media request — pick the route that suits you.
          </p>
        </div>
      </header>

      <section className="section bg-cream-200">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Contact details */}
          <div className="space-y-4">
            {[
              {
                icon: <MailIcon className="h-5 w-5" />,
                label: "Email",
                value: site.contact.email,
                href: `mailto:${site.contact.email}`,
                note: "Best for proposals, grant enquiries and formal requests.",
                live: true,
              },
              {
                icon: <PhoneIcon className="h-5 w-5" />,
                label: "Phone",
                value: site.contact.phone || "To be confirmed",
                note: "Add the main line so partners can call directly.",
                live: Boolean(site.contact.phone),
              },
              {
                icon: <WhatsAppIcon className="h-5 w-5" />,
                label: "WhatsApp",
                value: site.contact.whatsapp || "To be confirmed",
                note: "Usually the fastest way to reach the team.",
                live: Boolean(site.contact.whatsapp),
              },
              {
                icon: <PinIcon className="h-5 w-5" />,
                label: "Based in",
                value: site.location.region,
                note: "County, sub-county, ward and office address to be added.",
                live: false,
              },
            ].map((c) => (
              <div key={c.label} className="card flex gap-4 p-6" data-reveal>
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    c.live ? "bg-forest-800 text-white" : "bg-sage-200 text-forest-600"
                  }`}
                >
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-navy-700/45">
                    {c.label}
                  </p>
                  {c.href && c.live ? (
                    <a
                      href={c.href}
                      className="mt-0.5 block truncate font-display text-[0.9375rem] font-bold text-forest-800 underline-offset-4 hover:underline"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p
                      className={`mt-0.5 truncate font-display text-[0.9375rem] font-bold ${
                        c.live ? "text-forest-800" : "text-navy-700/40"
                      }`}
                    >
                      {c.value}
                    </p>
                  )}
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-navy-700/55">
                    {c.note}
                  </p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-sage-100 p-6" data-reveal>
              <p className="font-display text-[0.75rem] font-bold uppercase tracking-[0.14em] text-forest-700">
                What are you enquiring about?
              </p>
              <ul className="mt-3 space-y-1.5">
                {inquiryTypes.map((t) => (
                  <li key={t.id} className="text-[0.8125rem] text-navy-700/70">
                    · {t.label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-navy-700/55">
                Select the closest option in the form — it routes your message to
                the right person on our team.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card p-7 md:p-9" data-reveal>
            <h2 className="font-display text-h3">Send a message</h2>
            <p className="mt-1.5 text-sm text-navy-700/60">
              We reply within two working days.
            </p>
            <div className="mt-7">
              <InquiryForm defaultType="other" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
