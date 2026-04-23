# Practice OS — data model (quick reference)

Authoritative detail lives in **`prisma/schema.prisma`** and [ARCHITECTURE.md](./ARCHITECTURE.md). This page is a **short map** for builders.

## Core entities

| Table | Purpose |
|-------|---------|
| `tenants` | Practice / organization boundary. |
| `users` + `tenant_memberships` | Staff accounts; clinic login uses `users.defaultTenantId` in JWT. |
| `clinic_patients` | Demographics, contacts, **internal_notes** (staff only). |
| `clinic_procedures` | Service catalog (duration, price, currency). |
| `clinic_appointments` | Scheduled slots; status; optional procedure; **internal_notes**. |
| `clinic_visits` | Completed encounters; **next_steps** drives “what to do next” on the chart. |
| `clinic_patient_media` | Before/after images (`BYTEA` + mime type). |
| `clinic_patient_payments` | Payments; optional `visit_id`. |
| `clinic_crm_activities` | CRM timeline (type + body + occurred_at). |

## API surface (high level)

- `GET/POST /api/clinic/patients` — list (+ `?q=` search), create.
- `GET/PATCH /api/clinic/patients/[id]` — full chart for GET (includes related collections).
- `GET/POST /api/clinic/appointments` — range query + create.
- `GET/PATCH /api/clinic/appointments/[id]` — read/update one appointment.
- `POST /api/clinic/visits`, `PATCH /api/clinic/visits/[id]`.
- `POST /api/clinic/patients/[id]/media`, `GET /api/clinic/media/[id]`.
- `POST .../payments`, `POST .../crm`.
- `GET/PATCH /api/clinic/me` — profile + password.

All routes require **clinic session** (`getClinicSession`): `authToken` cookie + `portal=clinic`.
