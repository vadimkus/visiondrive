# Implementation log (clinic)

## Chunk 1 — 2026-04-23

**Shipped**

- `docs/clinic/*` documentation set; `docs/archive/*` for legacy parking / kitchen docs (moved, not deleted).
- Prisma: `ClinicPatient`, `ClinicProcedure`, `ClinicAppointment`, `ClinicAppointmentStatus`, relations on `Tenant`.
- `lib/prisma.ts`, `lib/clinic/session.ts`.
- Routes:
  - `GET/POST /api/clinic/patients`
  - `GET/PATCH /api/clinic/patients/[id]`
  - `GET/POST /api/clinic/procedures`
  - `GET/POST /api/clinic/appointments` (GET supports `from`, `to` ISO datetimes)
  - `GET /api/clinic/stats`
- UI: `app/clinic/layout.tsx` + `ClinicShell.tsx`; pages: dashboard, patients, procedures, appointments.

**Operational**

- After schema change: `npx prisma db push` on target database (e.g. Vercel Postgres).

**Follow-ups (Chunk 2+)**

- Calendar grid UX; appointment edit; richer visit editing; optional Vercel Blob for large media.

---

## Chunk 2 — 2026-04-23

**Shipped**

- **Schema:** `ClinicVisit`, `ClinicPatientMedia` (before/after/other, binary in Postgres, ~8MB cap in API), `ClinicPatientPayment`, `ClinicCrmActivity`; indexes for patient search (`phone`).
- **Account:** `/clinic/account` — profile name + change password (`GET/PATCH /api/clinic/me`).
- **Patient search:** `GET /api/clinic/patients?q=` (name, phone, email, first+last split).
- **Full chart:** `GET /api/clinic/patients/[id]` returns appointments, visits, media metadata, payments, CRM activities.
- **APIs:** `POST /api/clinic/visits`, `PATCH /api/clinic/visits/[id]`; `POST /api/clinic/patients/[id]/media` (multipart); `GET /api/clinic/media/[id]`; `POST .../payments`, `POST .../crm`.
- **UI:** Patients list with debounced search (iPad-friendly); patient record with **What to do next** (upcoming appointment + last visit `nextSteps` + internal notes); tabs Overview / Timeline / Photos / Payments / CRM; visit logging; photo upload with `capture="environment"`; payments + CRM forms.
- **Security:** `Permissions-Policy` `camera=(self)` for practice photos (see `next.config.ts`).

**Operational**

- After pull: `npx prisma db push` on the practice database.
