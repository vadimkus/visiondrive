# Practice OS — architecture

## Tenancy

- Reuses existing **`Tenant`** row as the **practice / organization** boundary.
- Clinic users authenticate via `/api/auth/login` with `portal: 'clinic'`; JWT includes **`tenantId`** (`users.defaultTenantId`).
- Every `Clinic*` row has **`tenantId`**; all queries MUST filter by `session.tenantId`. API handlers use **`getClinicSession(request)`** from `lib/clinic/session.ts`.

## Data model (Chunk 1–2)

| Model | Purpose |
|-------|---------|
| `ClinicPatient` | Demographics + **`internalNotes`** (staff-only; never on patient PDF) + optional **`anamnesisJson`** (v1 structured intake: allergies, medications, conditions, social). |
| `ClinicProcedure` | Catalog: name, duration, hidden **`bufferAfterMinutes`** (cleanup/prep/travel), base price, currency (default AED). |
| `ClinicAppointment` | Scheduled visit intent: patient, optional procedure, start/end, status, source, hidden buffer, lifecycle timestamps, **`internalNotes`**. |
| `ClinicAppointmentEvent` | Appointment change history: create/update/reschedule/status/reminder/visit/payment/follow-up events. |
| `ClinicAvailabilityRule` | Working-hours and booking cadence per weekday: open/closed, start/end, slot interval, and minimum lead time. |
| `ClinicBlockedTime` | Manual availability removals for lunch, leave, training, private time, or supplier errands. |
| `ClinicVisit` | Completed (or in-progress) encounter: **`nextSteps`** (follow-up / what to do next), clinical text fields, optional link to an appointment, **`inventoryConsumedAt`** idempotency marker for auto-consumption. |
| `ClinicPatientMedia` | Before/after/other photos; **`data`** (`Bytes`, optional) and/or **`blobPathname`** (private Vercel Blob); served via **`GET /api/clinic/media/[id]`** (tenant-scoped). |
| `ClinicPatientPayment` | Patient-level payments (amount, method, status, optional **`visitId`**). |
| `ClinicCrmActivity` | CRM timeline: type (call, WhatsApp, note, …), **`body`**, **`occurredAt`**. |
| `ClinicStockItem` | Inventory line: **`quantityOnHand`**, **`reorderPoint`** (low-stock when on-hand <= point and point &gt; 0), optional **`procedureId`**, `barcode`, `consumePerVisit`, and low-stock notification cooldown. |
| `ClinicStockMovement` | **`RECEIPT` / `ADJUSTMENT` / `CONSUMPTION` / `RETURN`** with signed **`quantityDelta`**; updates item atomically in a transaction. |
| `ClinicPurchaseOrder` / `ClinicPurchaseOrderLine` | Supplier orders and receipts; receiving creates `RECEIPT` stock movements and increments item quantities. |
| `ClinicWebPushSubscription` | Browser push endpoints for low-stock alerts, scoped to user + tenant. |

Relationships: `ClinicAppointment` → `ClinicPatient`, optional → `ClinicProcedure`; **`ClinicVisit`** optionally → `ClinicAppointment`; `ClinicAppointmentEvent` → `ClinicAppointment`; media and payments optionally → **`ClinicVisit`**. Cascade deletes are tenant-safe because patient belongs to tenant.

Availability: `/api/clinic/availability/slots` combines `ClinicAvailabilityRule`, `ClinicBlockedTime`, existing active appointments, service duration, and hidden buffers. It returns candidate slots only; appointment creation still goes through the conflict-safe appointment API.

## API conventions

- Base path: **`/api/clinic/*`**.
- **Patient-safe PDF:** `GET .../patients/[id]/summary-pdf` returns a minimal English summary for handout; staff-only fields are excluded by construction (not redacted — never loaded).
- **Inventory:** `GET/POST /api/clinic/inventory`, `GET/PATCH /api/clinic/inventory/[id]`, `POST .../movements`, `GET .../lookup?q=`.
- **Purchase orders:** `GET/POST /api/clinic/purchase-orders`, `GET/PATCH /api/clinic/purchase-orders/[id]`, `POST .../[id]/receive`.
- **Availability:** `GET/PATCH /api/clinic/availability`, `GET /api/clinic/availability/slots`, `GET/POST /api/clinic/blocked-times`, `DELETE .../blocked-times/[id]`.
- **Push alerts:** `GET /api/clinic/push/vapid-public`, `POST/DELETE /api/clinic/push/subscribe`.
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
