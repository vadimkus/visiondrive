# Practice OS — architecture

## Tenancy

- Reuses existing **`Tenant`** row as the **practice / organization** boundary.
- Clinic users authenticate via `/api/auth/login` with `portal: 'clinic'`; JWT includes **`tenantId`** (`users.defaultTenantId`).
- Every `Clinic*` row has **`tenantId`**; all queries MUST filter by `session.tenantId`. API handlers use **`getClinicSession(request)`** from `lib/clinic/session.ts`.

## Data model (Chunk 1–2)

| Model | Purpose |
|-------|---------|
| `ClinicPatient` | Demographics + **`internalNotes`** (staff-only; never on patient PDF). |
| `ClinicProcedure` | Catalog: name, duration, base price, currency (default AED). |
| `ClinicAppointment` | Scheduled visit intent: patient, optional procedure, start/end, status, **`internalNotes`**. |
| `ClinicVisit` | Completed (or in-progress) encounter: **`nextSteps`** (follow-up / what to do next), clinical text fields, optional link to an appointment. |
| `ClinicPatientMedia` | Before/after/other photos; **`data`** as `Bytes` in Postgres; served via **`GET /api/clinic/media/[id]`** (tenant-scoped). |
| `ClinicPatientPayment` | Patient-level payments (amount, method, status, optional **`visitId`**). |
| `ClinicCrmActivity` | CRM timeline: type (call, WhatsApp, note, …), **`body`**, **`occurredAt`**. |

Relationships: `ClinicAppointment` → `ClinicPatient`, optional → `ClinicProcedure`; **`ClinicVisit`** optionally → `ClinicAppointment`; media and payments optionally → **`ClinicVisit`**. Cascade deletes are tenant-safe because patient belongs to tenant.

## API conventions

- Base path: **`/api/clinic/*`**.
- Auth: **`Cookie` `authToken`** + **`portal=clinic`**; validated in each route (middleware does not cover API — handlers enforce).
- Errors: JSON `{ error: string, code?: string }` with appropriate HTTP status.

## Security notes (UAE / PDPL / health-adjacent)

- Treat **internal notes, DOB, contact details, appointment notes, clinical photos, and payment rows** as sensitive.
- Production: **TLS**, **httpOnly** session cookie (existing), **least privilege** DB credentials.
- Prefer **UAE region** Postgres when offering to UAE patients; document subprocessors in privacy policy.

## Prisma vs legacy SQL

- **New clinic module** uses **`lib/prisma.ts`** with the official **PostgreSQL driver adapter** (`pg` + `@prisma/adapter-pg`), required by Prisma 7 in this project.
- Legacy portal code may still use `lib/sql.ts` (`postgres` package); both can share the same `VISIONDRIVE_DATABASE_URL` / `POSTGRES_URL`.

## Related docs

- [PLAN.md](./PLAN.md) — chunk order.
- [CHUNKS.md](./CHUNKS.md) — implementation log.
