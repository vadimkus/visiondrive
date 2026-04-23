# Practice OS — delivery plan (chunked)

Principles: **tenant-isolated data**, **doctor-only fields** clearly marked in schema, **patient-safe exports** as a separate projection (later chunk), **UAE-friendly hosting** on Vercel + Postgres.

## Chunk 1 — Foundation (current)

- [x] Documentation tree under `docs/clinic/` + archive legacy marketing docs.
- [x] Prisma models: `ClinicPatient`, `ClinicProcedure`, `ClinicAppointment` scoped by `tenantId`.
- [x] `lib/prisma.ts`, `lib/clinic/session.ts` (cookie + JWT + `portal=clinic`).
- [x] APIs: patients, procedures, appointments (list/create; appointments range query), stats.
- [x] UI: `/clinic` layout with nav; dashboard, patients list + create, procedures list + create, appointments week list + create.

**Deploy note:** run `npx prisma db push` after deploy when schema changes.

## Chunk 2 — Patient record & calendar UX

- Patient detail page: demographics, internal notes (staff only in UI).
- Week calendar grid for appointments (timezone: `Asia/Dubai` default per tenant setting later).
- Edit / cancel appointment; status transitions.

## Chunk 3 — Visits (encounters)

- `ClinicVisit` separate from `ClinicAppointment` (FHIR-style: appointment vs encounter).
- Visit line items: procedures, discounts, retail line items (basic).
- Photo attachments metadata + private object storage (Vercel Blob / S3-compatible) — URLs never public.

## Chunk 4 — Anamnesis & patient PDF

- Structured anamnesis (versioned JSON or normalized tables).
- Server-generated PDF: **minimal** fields only (no internal notes).

## Chunk 5 — Inventory

- Stock items, movements, low-stock alerts; link consumption to procedures where possible.

## Chunk 6 — Finance & analytics

- Monthly P&amp;L-style rollups, procedure popularity, revenue by category.

## Cross-cutting (ongoing)

- Audit log for chart access and exports (recommended before broader rollout).
- Optional: second staff role with reduced permissions (finance-only).
