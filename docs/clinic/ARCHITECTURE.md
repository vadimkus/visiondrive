# Practice OS — architecture

## Tenancy

- Reuses existing **`Tenant`** row as the **practice / organization** boundary.
- Clinic users authenticate via `/api/auth/login` with `portal: 'clinic'`; JWT includes **`tenantId`** (`users.defaultTenantId`).
- Every `Clinic*` row has **`tenantId`**; all queries MUST filter by `session.tenantId`. API handlers use **`getClinicSession(request)`** from `lib/clinic/session.ts`.

## Data model (Chunk 1–2)

| Model | Purpose |
|-------|---------|
| `ClinicPatient` | Demographics + home-visit address/area/access notes + client `category`/`tags` + **`internalNotes`** (staff-only; never on patient PDF) + optional **`anamnesisJson`** (v1 structured intake: allergies, medications, conditions, social). |
| `ClinicProcedure` | Catalog: name, duration, hidden **`bufferAfterMinutes`** (cleanup/prep/travel), base price, currency (default AED). |
| `ClinicAppointment` | Scheduled visit intent: patient, optional procedure, start/end, status, source, hidden buffer, home-visit location/travel buffers, lifecycle timestamps, **`internalNotes`**, and optional `overrideReason` for intentional scheduling exceptions. |
| `ClinicAppointmentEvent` | Appointment change history: create/update/reschedule/status/reminder/visit/payment/follow-up events. |
| `ClinicAvailabilityRule` | Working-hours and booking cadence per weekday: open/closed, start/end, fixed/dynamic slot mode, slot interval, minimum lead time, and optional procedure-specific overrides. |
| `ClinicBlockedTime` | Manual availability removals for lunch, leave, training, private time, or supplier errands. |
| `ClinicReminderTemplate` | Tenant-scoped WhatsApp/email/SMS template text for appointment reminders, no-show follow-ups, and rebooking nudges. |
| `ClinicReminderDelivery` | Reminder schedule and delivery/preparation log; stores scheduled time, rendered body, WhatsApp URL, status, and errors. |
| `ClinicPatientReview` | Internal reputation workflow: review request status, rating, private note, candidate public text, and request/reply/publish timestamps. |
| `ClinicVisit` | Completed (or in-progress) encounter: **`nextSteps`** (follow-up / what to do next), clinical text fields, optional link to an appointment, **`inventoryConsumedAt`** idempotency marker for auto-consumption. |
| `ClinicPatientMedia` | Before/after/other photos; **`data`** (`Bytes`, optional) and/or **`blobPathname`** (private Vercel Blob); served via **`GET /api/clinic/media/[id]`** (tenant-scoped). |
| `ClinicPatientPayment` | Patient-level payments (amount, method, status, optional **`visitId`**). Client balance is derived from billable appointments plus linked/standalone payment rows; no separate ledger table yet. |
| `ClinicPatientPackage` / `ClinicPackageRedemption` | Prepaid treatment packages sold to a patient, with remaining session balance, optional service restriction, expiry, and automatic redemption rows when a completed visit consumes a session. |
| `ClinicConsentTemplate` / `ClinicConsentRecord` | Reusable procedure-specific consent templates and immutable signed patient consent snapshots with contraindication checklist, aftercare acknowledgement, and optional visit/appointment links. |
| `ClinicCrmActivity` | CRM timeline: type (call, WhatsApp, note, …), **`body`**, **`occurredAt`**. |
| `ClinicStockItem` | Inventory line: **`quantityOnHand`**, **`reorderPoint`** (low-stock when on-hand <= point and point &gt; 0), optional **`procedureId`**, `barcode`, `consumePerVisit`, and low-stock notification cooldown. |
| `ClinicStockMovement` | **`RECEIPT` / `ADJUSTMENT` / `CONSUMPTION` / `RETURN`** with signed **`quantityDelta`**; updates item atomically in a transaction. |
| `ClinicPurchaseOrder` / `ClinicPurchaseOrderLine` | Supplier orders and receipts; receiving creates `RECEIPT` stock movements and increments item quantities. |
| `ClinicWebPushSubscription` | Browser push endpoints for low-stock alerts, scoped to user + tenant. |

Relationships: `ClinicAppointment` → `ClinicPatient`, optional → `ClinicProcedure`; **`ClinicVisit`** optionally → `ClinicAppointment`; `ClinicAppointmentEvent` → `ClinicAppointment`; media and payments optionally → **`ClinicVisit`**. Cascade deletes are tenant-safe because patient belongs to tenant.

Availability: `/api/clinic/availability/slots` combines `ClinicAvailabilityRule`, `ClinicBlockedTime`, existing active appointments, service duration, and hidden buffers. General rules apply to all services; if a procedure has rules for a given day, those service-specific rules override the general day rules. `FIXED` rules step by `slotIntervalMinutes`; `DYNAMIC` rules step by selected service duration plus buffer for tighter packing. It returns candidate slots only; appointment creation still goes through the conflict-safe appointment API.

Scheduling guard: appointment create/reschedule checks existing appointment occupancy, blocked time, working hours, and minimum lead time. Staff can override a violation only when `allowConflictOverride=true` and a non-empty `overrideReason` is provided; the reason is stored on the appointment and visible in the drawer.

Home visits: patient records store the default address, area, and parking/access notes. Appointments snapshot the visit location and `travelBufferBeforeMinutes` / `travelBufferAfterMinutes`; these buffers expand the occupied scheduling window so route time is protected from overlaps.

Reminder system: WhatsApp is first-class but browser apps cannot truly auto-send WhatsApp messages. The runner prepares due messages and logs them; staff opens the generated `wa.me` link to send. Rebooking follow-up nudges can be scheduled from completed appointments and are skipped at runner time if the patient already has a future appointment. Review requests create internal `ClinicPatientReview` rows so ratings/replies can be captured before publishing externally. Future WhatsApp Business API integration can mark deliveries as sent automatically.

Public booking: `/book/[tenant.slug]` is a private branded link, not a marketplace. It is disabled by default and controlled from the clinic dashboard using `tenant_settings.thresholds.publicBooking.enabled`. When enabled, the public API exposes active services and generated slots only; booking creation stores DOB/contact/consent as a real patient + `ONLINE` appointment and still uses the scheduling guard. No public override is allowed.

## API conventions

- Base path: **`/api/clinic/*`**.
- **Patient-safe PDF:** `GET .../patients/[id]/summary-pdf` returns a minimal English summary for handout; staff-only fields are excluded by construction (not redacted — never loaded).
- **Inventory:** `GET/POST /api/clinic/inventory`, `GET/PATCH /api/clinic/inventory/[id]`, `POST .../movements`, `GET .../lookup?q=`.
- **Purchase orders:** `GET/POST /api/clinic/purchase-orders`, `GET/PATCH /api/clinic/purchase-orders/[id]`, `POST .../[id]/receive`.
- **Availability:** `GET/PATCH /api/clinic/availability`, `GET /api/clinic/availability/slots`, `GET/POST /api/clinic/blocked-times`, `DELETE .../blocked-times/[id]`.
- **Reminders/reputation:** `GET/PATCH /api/clinic/reminders/templates`, `GET /api/clinic/reminders/deliveries`, `GET/POST /api/clinic/reminders/run`, `GET /api/clinic/reviews`, `PATCH /api/clinic/reviews/[id]`; appointment actions support `send_reminder`, `schedule_reminder`, `no_show_follow_up`, `schedule_rebooking_follow_up`, and `send_review_request`.
- **Client balance:** patient list/detail and appointment detail responses include computed `clientBalance` from `lib/clinic/client-balance.ts`. `ARRIVED`/`COMPLETED` procedure prices are expected charges; linked paid/refunded/pending payments adjust due/credit; standalone paid payments are treated as deposits/credit. Package-sale payments are excluded from deposit credit to avoid double-counting prepaid course revenue as open balance.
- **Treatment packages:** `GET/POST /api/clinic/patients/[id]/packages` lists and sells prepaid packages. Completing a visit with a matching service automatically creates a package redemption and decrements one remaining session via `lib/clinic/patient-packages.ts`.
- **Consents:** `GET/POST /api/clinic/consents/templates` manages reusable consent templates. `GET/POST /api/clinic/patients/[id]/consents` lists and signs consent snapshots for a patient, optionally linked to a visit or appointment.
- **Public booking:** `GET/POST /api/clinic/public-booking/[slug]` — unauthenticated service/slot discovery and online appointment request for an enabled tenant slug. `GET/PATCH /api/clinic/public-booking/settings` controls the on/off switch for staff.
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
