# Practice OS — architecture

## Tenancy

- Reuses existing **`Tenant`** row as the **practice / organization** boundary.
- Clinic users authenticate via `/api/auth/login` with `portal: 'clinic'`; JWT includes **`tenantId`** (`users.defaultTenantId`).
- Every `Clinic*` row has **`tenantId`**; all queries MUST filter by `session.tenantId`. API handlers use **`getClinicSession(request)`** from `lib/clinic/session.ts`.

## Data model (Chunk 1–2)

| Model | Purpose |
|-------|---------|
| `ClinicPatient` | Demographics + home-visit address/area/access notes + client `category`/`tags` + **`internalNotes`** (staff-only; never on patient PDF) + optional **`anamnesisJson`** (v1 structured intake: allergies, medications, conditions, social). |
| `ClinicProcedure` | Catalog: name, duration, hidden **`bufferAfterMinutes`** (cleanup/prep/travel), base price, currency (default AED), and procedure materials/BOM. |
| `ClinicAppointment` | Scheduled visit intent: patient, optional procedure, start/end, status, source, hidden buffer, home-visit location/travel buffers, lifecycle timestamps, **`internalNotes`**, and optional `overrideReason` for intentional scheduling exceptions. |
| `ClinicAppointmentEvent` | Appointment change history: create/update/reschedule/status/reminder/visit/payment/follow-up events. |
| `ClinicAvailabilityRule` | Working-hours and booking cadence per weekday: open/closed, start/end, fixed/dynamic slot mode, slot interval, minimum lead time, and optional procedure-specific overrides. |
| `ClinicBlockedTime` | Manual availability removals for lunch, leave, training, private time, or supplier errands. |
| `ClinicReminderTemplate` | Tenant-scoped WhatsApp/email/SMS template text for appointment reminders, no-show follow-ups, and rebooking nudges. |
| `ClinicReminderDelivery` | Reminder schedule and delivery/preparation log; stores scheduled time, rendered body, WhatsApp URL, status, and errors. |
| `ClinicBookingFunnelEvent` | Anonymous tenant-scoped public booking analytics events for link views, service/slot selection, form activity, and completed online booking. |
| `ClinicPatientPortalLink` | Hashed private patient portal token with expiry/revocation and last-access tracking; plaintext link is only returned at creation time. |
| `ClinicPatientPortalRequest` | Patient-submitted portal requests for reschedule, cancellation, or message, attached to patient and optional appointment. |
| `ClinicIntakeQuestion` | Procedure-scoped public booking question with type, help text, required/active flags, and sort order. |
| `ClinicIntakeResponse` | Appointment-linked intake answer snapshot from public booking, preserving prompt/type even if the question changes later. |
| `ClinicPatientReview` | Internal reputation workflow: review request status, rating, private note, candidate public text, and request/reply/publish timestamps. |
| `ClinicVisit` | Completed (or in-progress) encounter: **`nextSteps`** (follow-up / what to do next), clinical text fields, optional links to an appointment and treatment plan, **`inventoryConsumedAt`** idempotency marker for auto-consumption. |
| `ClinicPatientMedia` | Before/after/other photos; **`data`** (`Bytes`, optional) and/or **`blobPathname`** (private Vercel Blob); served/deleted via **`GET/DELETE /api/clinic/media/[id]`** (tenant-scoped). |
| `ClinicPatientPayment` | Patient-level payments (amount, discount, fee, method, status, optional **`visitId`** / **`appointmentId`**). Client balance is derived from billable appointments plus linked/standalone payment rows; no separate ledger table yet. |
| `ClinicProductSale` / `ClinicProductSaleLine` | Retail / aftercare products sold from a visit: line items, stock deduction movements, optional appointment/visit link, and a payment row for finance revenue. |
| `ClinicPatientPackage` / `ClinicPackageRedemption` | Prepaid treatment packages sold to a patient, with remaining session balance, optional service restriction, expiry, and automatic redemption rows when a completed visit consumes a session. |
| `ClinicConsentTemplate` / `ClinicConsentRecord` | Reusable procedure-specific consent templates and immutable signed patient consent snapshots with contraindication checklist, aftercare acknowledgement, and optional visit/appointment links. |
| `ClinicTreatmentPlan` | Planned patient course of care with expected sessions, cadence, target dates, service, goals, next steps, photo milestones, status, and linked visits. |
| `ClinicCrmActivity` | CRM timeline: type (call, WhatsApp, note, …), **`body`**, **`occurredAt`**. |
| `ClinicStockItem` | Inventory line: **`quantityOnHand`**, **`reorderPoint`** (low-stock when on-hand <= point and point &gt; 0), optional **`procedureId`**, `barcode`, `consumePerVisit`, and low-stock notification cooldown. |
| `ClinicProcedureMaterial` | Bill of materials row linking a procedure to a stock item with quantity per visit, unit material cost, active flag, note, and sort order. |
| `ClinicStockMovement` | **`RECEIPT` / `ADJUSTMENT` / `CONSUMPTION` / `RETURN`** with signed **`quantityDelta`**; updates item atomically in a transaction. |
| `ClinicStockCountSession` / `ClinicStockCountLine` | Physical stock-taking workflow: count session snapshot, expected vs counted quantities, variance reason, note, and movement reference after finalization. |
| `ClinicPurchaseOrder` / `ClinicPurchaseOrderLine` | Supplier orders and receipts; receiving creates `RECEIPT` stock movements and increments item quantities. |
| `ClinicWebPushSubscription` | Browser push endpoints for low-stock alerts, scoped to user + tenant. |

Relationships: `ClinicAppointment` → `ClinicPatient`, optional → `ClinicProcedure`; **`ClinicVisit`** optionally → `ClinicAppointment`; `ClinicAppointmentEvent` → `ClinicAppointment`; media and payments optionally → **`ClinicVisit`**. Cascade deletes are tenant-safe because patient belongs to tenant.

Availability: `/api/clinic/availability/slots` combines `ClinicAvailabilityRule`, `ClinicBlockedTime`, existing active appointments, service duration, and hidden buffers. General rules apply to all services; if a procedure has rules for a given day, those service-specific rules override the general day rules. `FIXED` rules step by `slotIntervalMinutes`; `DYNAMIC` rules step by selected service duration plus buffer for tighter packing. It returns candidate slots only; appointment creation still goes through the conflict-safe appointment API.

Scheduling guard: appointment create/reschedule checks existing appointment occupancy, blocked time, working hours, and minimum lead time. Staff can override a violation only when `allowConflictOverride=true` and a non-empty `overrideReason` is provided; the reason is stored on the appointment and visible in the drawer.

Home visits: patient records store the default address, area, and parking/access notes. Appointments snapshot the visit location and `travelBufferBeforeMinutes` / `travelBufferAfterMinutes`; these buffers expand the occupied scheduling window so route time is protected from overlaps.

Reminder system: WhatsApp is first-class but browser apps cannot truly auto-send WhatsApp messages. The runner prepares due messages and logs them; staff opens the generated `wa.me` link to send. Rebooking follow-up nudges can be scheduled from completed appointments and are skipped at runner time if the patient already has a future appointment. Review requests create internal `ClinicPatientReview` rows so ratings/replies can be captured before publishing externally. Future WhatsApp Business API integration can mark deliveries as sent automatically.

Public booking: `/book/[tenant.slug]` is a private branded link, not a marketplace. It is disabled by default and controlled from the clinic dashboard using `tenant_settings.thresholds.publicBooking.enabled`. When enabled, the public API exposes active services, generated slots, and active service-specific intake questions. Booking creation stores DOB/contact/consent as a real patient + `ONLINE` appointment, validates required intake answers, snapshots answers into `ClinicIntakeResponse`, and still uses the scheduling guard. No public override is allowed.

Patient portal lite: `/patient-portal/[token]` is a private, token-based patient view. Tokens are stored as SHA-256 hashes, expire, and can be revoked from the patient chart. The portal exposes patient-safe operational data only: upcoming appointments, aftercare/next steps, package balances, receipts, accepted consent titles, and treatment-plan progress. Requests from the portal do not mutate appointments directly; they create a `ClinicPatientPortalRequest`, CRM note, and appointment event for staff review.

## API conventions

- Base path: **`/api/clinic/*`**.
- **Patient media:** `POST .../patients/[id]/media` uploads before/after/other images from camera or file picker and optional visit links; `GET/DELETE /api/clinic/media/[id]` serves/removes private tenant-scoped media.
- **Patient-safe PDF:** `GET .../patients/[id]/summary-pdf` returns a minimal English summary for handout; staff-only fields are excluded by construction (not redacted — never loaded).
- **Inventory:** `GET/POST /api/clinic/inventory`, `GET/PATCH /api/clinic/inventory/[id]`, `POST .../movements`, `GET .../lookup?q=`.
- **Procedure materials:** `GET/POST /api/clinic/procedures/[id]/materials`, `PATCH/DELETE .../materials/[materialId]`; visit completion deducts active material rows before falling back to legacy stock-item procedure links.
- **Procedure intake questions:** `GET/POST /api/clinic/procedures/[id]/intake-questions`, `PATCH/DELETE .../intake-questions/[questionId]`; active questions are shown on public booking for that service and required answers block submission until completed.
- **Stock-taking:** `GET/POST /api/clinic/stock-takes`, `GET/PATCH .../stock-takes/[id]`, `PATCH .../lines/[lineId]`, `POST .../finalize`; finalization posts audited `ADJUSTMENT` stock movements and updates on-hand quantities to the physical count.
- **Purchase orders:** `GET/POST /api/clinic/purchase-orders`, `GET/PATCH /api/clinic/purchase-orders/[id]`, `POST .../[id]/receive`.
- **Availability:** `GET/PATCH /api/clinic/availability`, `GET /api/clinic/availability/slots`, `GET/POST /api/clinic/blocked-times`, `DELETE .../blocked-times/[id]`.
- **Reminders/reputation:** `GET/PATCH /api/clinic/reminders/templates`, `GET /api/clinic/reminders/deliveries`, `GET/POST /api/clinic/reminders/run`, `GET /api/clinic/reviews`, `PATCH /api/clinic/reviews/[id]`; appointment actions support `send_reminder`, `schedule_reminder`, `no_show_follow_up`, `schedule_rebooking_follow_up`, and `send_review_request`.
- **Client balance:** patient list/detail and appointment detail responses include computed `clientBalance` from `lib/clinic/client-balance.ts`. `ARRIVED`/`COMPLETED` procedure prices are expected charges; linked paid/refunded/pending payments adjust due/credit; payment discounts reduce expected charge and patient-facing fees increase it; standalone paid payments are treated as deposits/credit. Package-sale payments are excluded from deposit credit to avoid double-counting prepaid course revenue as open balance.
- **Inline payments/receipts:** appointment drawers can record appointment-linked payments, discounts, fees, method/status/reference/note, and download receipt PDFs from `GET /api/clinic/patients/[id]/payments/[paymentId]/receipt`. `PATCH /api/clinic/patients/[id]/payments/[paymentId]` supports refund/void status updates.
- **Product sales:** `GET/POST /api/clinic/patients/[id]/product-sales` records aftercare product sale lines from a visit, deducts stock with `CONSUMPTION` movements, and creates a `PRODUCT_SALE:*` payment reference for finance revenue without treating it as client balance credit.
- **Finance / P&L v2:** `GET /api/clinic/finance/overview` returns net revenue, refunds, pending payments, product-sale revenue, direct material/product costs, gross profit, operating expenses, operating profit, expense categories, and procedure profitability rows derived from completed visits, linked payments, and procedure BOM rows.
- **Treatment packages:** `GET/POST /api/clinic/patients/[id]/packages` lists and sells prepaid packages. Completing a visit with a matching service automatically creates a package redemption and decrements one remaining session via `lib/clinic/patient-packages.ts`.
- **Consents:** `GET/POST /api/clinic/consents/templates` manages reusable consent templates. `GET/POST /api/clinic/patients/[id]/consents` lists and signs consent snapshots for a patient, optionally linked to a visit or appointment.
- **Treatment plans:** `GET/POST /api/clinic/patients/[id]/treatment-plans` and `PATCH .../treatment-plans/[planId]` manage planned care courses. Visit create/update accepts `treatmentPlanId`, and patient charts compute plan progress from linked completed visits.
- **Notification center:** `GET /api/clinic/inbox` returns derived operational tasks for reminders due, online bookings, recent reschedules, review requests, unpaid visits, and low-stock inventory. It does not persist notifications; it aggregates live source-of-truth rows.
- **Retention analytics:** `GET /api/clinic/retention/overview` derives rebook rate, returning-client rate, no-show rate, follow-up conversion, lost patients, and repeat interval by procedure from appointments and rebooking reminders.
- **Booking funnel analytics:** `POST /api/clinic/public-booking/[slug]/funnel` records anonymous public booking step events; `GET /api/clinic/booking-funnel/overview` summarizes conversion by stage, day, and procedure.
- **Patient portal lite:** `GET/POST/PATCH /api/clinic/patients/[id]/portal-link` manages private portal links; `GET/POST /api/patient-portal/[token]` returns patient-safe portal data and creates reschedule/cancel/message requests; `GET /api/patient-portal/[token]/payments/[paymentId]/receipt` downloads receipt PDFs for that patient only.
- **Public booking:** `GET/POST /api/clinic/public-booking/[slug]` — unauthenticated service/slot/intake discovery and online appointment request for an enabled tenant slug. `GET/PATCH /api/clinic/public-booking/settings` controls the on/off switch for staff.
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
