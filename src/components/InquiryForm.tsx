"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import { inquiryTypes, site } from "@/lib/site";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";

const initialState: InquiryState = { ok: false, message: "" };

export default function InquiryForm({
  defaultType = "sponsorship",
  compact = false,
}: {
  defaultType?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) setSubmitted(true);
  }, [state.ok]);

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
            {state.message}
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
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="hp">Leave this empty</label>
        <input id="hp" name="hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={compact ? "" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="name">
            Your name *
          </label>
          <input
            id="name"
            name="name"
            className="field"
            placeholder="e.g. Achieng' Otieno"
            autoComplete="name"
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
          {state.fieldErrors?.name && (
            <p className="mt-1.5 text-xs font-medium text-clay-500">
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            placeholder="you@organisation.org"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1.5 text-xs font-medium text-clay-500">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="organisation">
              Organisation
            </label>
            <input
              id="organisation"
              name="organisation"
              className="field"
              placeholder="Company, foundation, school or NGO"
              autoComplete="organization"
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Phone / WhatsApp
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="field"
              placeholder="+254 7XX XXX XXX"
              autoComplete="tel"
            />
          </div>
        </div>
      )}

      <div className={compact ? "" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className="label" htmlFor="inquiry_type">
            I&apos;m interested in *
          </label>
          <select
            id="inquiry_type"
            name="inquiry_type"
            className="field"
            defaultValue={defaultType}
          >
            {inquiryTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {!compact && (
          <div>
            <label className="label" htmlFor="budget_range">
              Indicative support (optional)
            </label>
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
        <label className="label" htmlFor="message">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={compact ? 4 : 5}
          className="field resize-y"
          placeholder="Tell us what you'd like to support, or ask us anything about our work."
          required
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1.5 text-xs font-medium text-clay-500">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {!state.ok && state.message && (
        <div
          role="alert"
          className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4 text-sm text-navy-700"
        >
          {state.message}{" "}
          {state.fallback && (
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
