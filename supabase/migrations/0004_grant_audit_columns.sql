-- ============================================================================
--  0004 — grant anon INSERT on the two audit columns
--
--  WHY
--  ---
--  Migration 0003 revoked table-level INSERT from anon and re-granted it per
--  column to stop anonymous mass assignment. It listed ten columns but omitted
--  `user_agent` and `ip_hash`.
--
--  src/app/actions/inquiry.ts writes both: ip_hash drives the rate limiter and
--  user_agent is kept for spam diagnostics. Postgres rejects an INSERT that
--  names any column the role lacks INSERT on, so every real form submission
--  failed with:
--
--      [inquiry] insert failed: permission denied for table inquiries
--
--  The omission went unnoticed because the direct REST test used to validate
--  0003 didn't send those two columns. Only an end-to-end test through the
--  actual form caught it.
--
--  RESIDUAL RISK (accepted, deliberately)
--  --------------------------------------
--  A caller who bypasses our form and hits the REST API directly can now
--  supply a forged user_agent / ip_hash. Consequences:
--    * a spoofed ip_hash could evade the per-IP rate limit
--    * a spoofed user_agent could pollute spam diagnostics
--  Neither reaches a human, changes enquiry status, nor exposes any data, so
--  the trade is worth making to keep the write in one atomic insert.
--
--  Still NOT writable by anon — these remain server-set only:
--    status, is_priority, notes, handled_by, handled_at
--
--  Safe to re-run.
-- ============================================================================

grant insert (user_agent, ip_hash) on public.inquiries to anon, authenticated;

-- Re-state the full anonymous write surface in one place so it is auditable
-- without reading three migrations. Grants are additive in Postgres, so this
-- is idempotent and self-documenting.
comment on table public.inquiries is
  'Partner/sponsor/volunteer enquiries. '
  'Anonymous INSERT is column-restricted (migrations 0003 + 0004). '
  'Writable by anon: inquiry_type, name, email, phone, organisation, role, '
  'country, message, budget_range, hp, user_agent, ip_hash. '
  'Server-set only: status, is_priority, notes, handled_by, handled_at. '
  'Never chain .select() after an anonymous insert - RETURNING needs SELECT '
  'privilege under RLS and is rejected.';
