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

- Calendar grid UX; appointment edit; patient detail screen; visits + media.
