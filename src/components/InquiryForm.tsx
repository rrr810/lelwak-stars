"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { configured } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { inquiryTypes, site } from "@/lib/site";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

/**
 * Partner / sponsor / volunteer enquiry form.
 *
 * STATIC-EXPORT SAFE: submits from the browser through the anon key.
 * That is safe here because the database, not the client, is the authority:
 *   - migration 0003/0004: anon may INSERT only the listed columns, so
 *     status / is_priority / notes / handled_by / handled_at cannot be sent
 *   - the honeypot WITH CHECK rejects rows where `hp` is filled
 *   - migration 0005's BEFORE INSERT trigger pins status='new' and derives
 *     is_priority from inquiry_type
 * What the client adds is UX-level protection only: field validation and a
 * per-browser rate limit. Real spam defence lives in RLS.
 */

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const RATE_KEY = "lelwak_inquiry_submissions";
const RATE_MAX = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export default function InquiryForm({
  defaultType = "sponsorship",
  compact = false,
}: {
  defaultType?: string;
  compact?: boolean;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ tone: "error" | "info"; text: string; mailto?: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // no-op: keeps the component client-mounted for consistency
  }, []);

  function rateLimited(): boolean {
    try {
      const now = Date.now();
      const hits = (JSON.parse(localStorage.getItem(RATE_KEY) ?? "[]") as number[])
        .filter((t) => now - t < RATE_WINDOW_MS);
      if (hits.length >= RATE_MAX) return true;
      hits.push(now);
      localStorage.setItem(RATE_KEY, JSON.stringify(hits));
      return false;
    } catch {
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setErrors({});

    const fd = new FormData(e.currentTarget);

    // Honeypot: humans never fill this. The DB would reject it anyway.
    if (String(fd.get("hp") ?? "").trim()) {
      setBanner({ tone: "error", text: "Submission rejected." });
      return;
    }

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const message = String(fd.get("message") ?? "").trim();
    const rawType = String(fd.get("inquiry_type") ?? "other");
    const type = (inquiryTypes.some((t) => t.id === rawType) ? rawType : "other") as
      | (typeof inquiryTypes)[number]["id"];

    const nextErrors: Errors = {};
    if (name.length < 2) nextErrors.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      nextErrors.email = "Please enter a valid email address.";
    if (message.length < 12)
      nextErrors.message = "Please add a little more detail (12+ characters).";
    if (message.length > 4000) nextErrors.message = "Message is too long (max 4000 characters).";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setBanner({ tone: "error", text: "Please check the highlighted fields." });
      return;
    }

    if (!configured()) {
      setBanner({
        tone: "info",
        text: "Our enquiry database isn't connected on this deployment. Please email us directly and we'll respond within 2 working days.",
        mailto: true,
      });
      return;
    }

    if (rateLimited()) {
      setBanner({
        tone: "error",
        text: "Too many submissions from this browser. Please try again shortly, or email us.",
        mailto: true,
      });
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert({
        inquiry_type: type,
        name: name.slice(0, 160),
        email: email.slice(0, 200),
        phone: String(fd.get("phone") ?? "").trim().slice(0, 40) || null,
        organisation: String(fd.get("organisation") ?? "").trim().slice(0, 160) || null,
        role: String(fd.get("role") ?? "").trim().slice(0, 120) || null,
        country: String(fd.get("country") ?? "").trim().slice(0, 80) || null,
        budget_range: String(fd.get("budget_range") ?? "").trim().slice(0, 80) || null,
        message: message.slice(0, 4000),
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
        // hp intentionally NOT sent when empty; a filled honeypot never reaches here.
      });

      if (error) {
        console.error("[inquiry] insert failed:", error.message);
        setBanner({
          tone: "error",
          text: "Something went wrong on our side. Please email us directly.",
          mailto: true,
        });
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("[inquiry] unexpected:", err);
      setBanner({
        tone: "error",
        text: "Something went wrong on our side. Please email us directly.",
        mailto: true,
      });
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-start gap-4 border-l-4 !border-l-leaf-500 p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-leaf-500/15 text-forest-700">
          <CheckIcon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-xl font-extrabold text-forest-800">
            Message received
          </h3>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-navy-700/75">
            Asante sana! Your message is with the Lelwak Stars team. We reply
            within 2 working days.
          </p>
        </div>
        <Link href="/stories" className="btn btn-ghost mt-1">
          Read our activity stories
          <ArrowRightIcon />
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* honeypot — visually hidden, empty on every genuine submission */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="hp">Leave this empty</label>
        <input id="hp" name="hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={compact ? "" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="name">Your name *</label>
          <input
            id="name" name="name" className="field" placeholder="e.g. Achieng' Otieno"
            autoComplete="name" required aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="mt-1.5 text-xs font-medium text-clay-500">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input
            id="email" name="email" type="email" className="field" placeholder="you@organisation.org"
            autoComplete="email" required aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="mt-1.5 text-xs font-medium text-clay-500">{errors.email}</p>}
        </div>
      </div>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="organisation">Organisation</label>
            <input
              id="organisation" name="organisation" className="field"
              placeholder="Company, foundation, school or NGO" autoComplete="organization"
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone / WhatsApp</label>
            <input
              id="phone" name="phone" type="tel" className="field"
              placeholder="+254 7XX XXX XXX" autoComplete="tel"
            />
          </div>
        </div>
      )}

      <div className={compact ? "" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="inquiry_type">I&apos;m interested in *</label>
          <select id="inquiry_type" name="inquiry_type" className="field" defaultValue={defaultType}>
            {inquiryTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        {!compact && (
          <div>
            <label className="label" htmlFor="budget_range">Indicative support (optional)</label>
            <select id="budget_range" name="budget_range" className="field">
              <option value="">Prefer not to say</option>
              <option value="in-kind">In-kind donation</option>
              <option value="under-100k">Under KES 100,000</option>
              <option value="100k-500k">KES 100,000 – 500,000</option>
              <option value="500k-2m">KES 500,000 – 2,000,000</option>
              <option value="2m-plus">Above KES 2,000,000</option>
              <option value="grant">Grant / multi-year funding</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="message">Message *</label>
        <textarea
          id="message" name="message" rows={compact ? 4 : 5} className="field resize-y"
          placeholder="Tell us what you'd like to support, or ask us anything about our work."
          required aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <p className="mt-1.5 text-xs font-medium text-clay-500">{errors.message}</p>}
      </div>

      {banner && (
        <div
          role="alert"
          className={`rounded-xl p-4 text-sm text-navy-700 ${
            banner.tone === "error"
              ? "border border-gold-500/30 bg-gold-500/10"
              : "border border-forest-300 bg-sage-100"
          }`}
        >
          {banner.text}{" "}
          {banner.mailto && (
            <a
              href={`mailto:${site.contact.email}?subject=Partnership%20enquiry`}
              className="font-bold underline underline-offset-4"
            >
              {site.contact.email}
            </a>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" className="btn btn-forest" disabled={pending}>
          {pending ? "Sending…" : "Send Message"}
          {!pending && <ArrowRightIcon />}
        </button>
        <p className="max-w-xs text-xs leading-relaxed text-navy-700/55">
          We never share your details. Read every enquiry ourselves.
        </p>
      </div>
    </form>
  );
}
