"use server";

import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { Database, InquiryType } from "@/lib/database.types";
import { inquiryTypes } from "@/lib/site";

export type InquiryState = {
  ok: boolean;
  message: string;
  /** true when Supabase isn't wired up yet — we show a mailto fallback */
  fallback?: boolean;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const VALID_TYPES = new Set(inquiryTypes.map((t) => t.id));
const MAX_MESSAGE = 4000;

export async function submitInquiry(
  _prev: InquiryState | null,
  formData: FormData,
): Promise<InquiryState> {
  // --- honeypot: real humans never fill this ---
  const hp = String(formData.get("hp") ?? "").trim();
  if (hp) {
    return { ok: false, message: "Submission rejected." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const rawType = String(formData.get("inquiry_type") ?? "other");
  const inquiryType = (VALID_TYPES.has(rawType as InquiryType)
    ? rawType
    : "other") as InquiryType;

  const fieldErrors: InquiryState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    fieldErrors.email = "Please enter a valid email address.";
  if (message.length < 12)
    fieldErrors.message = "Please add a little more detail (12+ characters).";
  if (message.length > MAX_MESSAGE)
    fieldErrors.message = `Message is too long (max ${MAX_MESSAGE} characters).`;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const supabase = await db();

  if (!supabase) {
    // Supabase not connected yet — don't silently drop the enquiry.
    return {
      ok: false,
      fallback: true,
      message:
        "Our enquiry database isn't connected yet. Please email us directly and we'll respond within 2 working days.",
    };
  }

  const hdrs = await headers();
  const ua = hdrs.get("user-agent") ?? "";
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "";
  // Privacy: we store a hash, never the raw IP.
  const ipHash = ip
    ? createHash("sha256")
      .update(ip + (process.env.IP_SALT ?? "lelwak"))
      .digest("hex")
    : null;

  // Basic rate limit: max 3 submissions per hash per 10 minutes.
  if (ipHash) {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("submitted_at", since);

    if ((count ?? 0) >= 3) {
      return {
        ok: false,
        message: "Too many submissions from your network. Please try again shortly.",
      };
    }
  }

  const { error } = await supabase.from("inquiries").insert({
    inquiry_type: inquiryType,
    name: name.slice(0, 160),
    email: email.slice(0, 200),
    phone: String(formData.get("phone") ?? "").trim().slice(0, 40) || null,
    organisation:
      String(formData.get("organisation") ?? "").trim().slice(0, 160) || null,
    role: String(formData.get("role") ?? "").trim().slice(0, 120) || null,
    country: String(formData.get("country") ?? "").trim().slice(0, 80) || null,
    budget_range:
      String(formData.get("budget_range") ?? "").trim().slice(0, 80) || null,
    message: message.slice(0, MAX_MESSAGE),
    user_agent: ua.slice(0, 300),
    ip_hash: ipHash,
    // NOTE: is_priority is NOT sent. Migration 0005 derives it in a BEFORE
    // INSERT trigger from inquiry_type, so no caller — not even this code —
    // can forge an enquiry's place in the pipeline.
  } as Database["public"]["Tables"]["inquiries"]["Insert"]);

  if (error) {
    console.error("[inquiry] insert failed:", error.message);
    return {
      ok: false,
      message: "Something went wrong on our side. Please email us directly.",
    };
  }

  return {
    ok: true,
    message:
      "Asante sana! Your message is with the Lelwak Stars team. We reply within 2 working days.",
  };
}
