# Practice OS — architecture

## Tenancy

- Reuses existing **`Tenant`** row as the **practice / organization** boundary.
- Clinic users authenticate via `/api/auth/login` with `portal: 'clinic'`; JWT includes **`tenantId`** (`users.defaultTenantId`).
- Every `Clinic*` row has **`tenantId`**; all queries MUST filter by `session.tenantId`. API handlers use **`getClinicSession(request)`** from `lib/clinic/session.ts`.

## Data model (Chunk 1–2)

| Model | Purpose |
|-------|---------|
| `ClinicPatient` | Demographics + home-visit address/area/access notes + client `category`/`tags`, simple referral tracking (`referredByName`, `referralNote`), **`internalNotes`** (staff-only; never on patient PDF) + optional **`anamnesisJson`** (v1 structured intake: allergies, medications, conditions, social). |
| `ClinicProcedure` | Catalog: name, duration, hidden **`bufferAfterMinutes`** (cleanup/prep/travel), base price, currency (default AED), procedure materials/BOM, intake questions, and aftercare templates. |
| `ClinicAppointment` | Scheduled visit intent: patient, optional procedure, start/end, status, source, hidden buffer, home-visit location/travel buffers, lifecycle timestamps, **`internalNotes`**, and optional `overrideReason` for intentional scheduling exceptions. |
| `ClinicAppointmentEvent` | Appointment change history: create/update/reschedule/status/reminder/visit/payment/follow-up events. |
| `ClinicAvailabilityRule` | Working-hours and booking cadence per weekday: open/closed, start/end, fixed/dynamic slot mode, slot interval, minimum lead time, and optional procedure-specific overrides. |
| `ClinicBlockedTime` | Manual availability removals for lunch, leave, training, private time, or supplier errands. |
| `ClinicReminderTemplate` | Tenant-scoped WhatsApp/email/SMS template text for appointment reminders, no-show follow-ups, and rebooking nudges. |
| `ClinicReminderDelivery` | Reminder schedule and delivery/preparation log; stores scheduled time, rendered body, WhatsApp URL, status, and errors. |
| `ClinicBookingFunnelEvent` | Anonymous tenant-scoped public booking analytics events for link views, service/slot selection, form activity, completed online booking, source/UTM metadata, and recoverable submitted-contact metadata for abandoned booking follow-up. |
| `ClinicPatientPortalLink` | Hashed private patient portal token with expiry/revocation and last-access tracking; plaintext link is only returned at creation time. |
| `ClinicPatientPortalRequest` | Patient-submitted portal requests for reschedule, cancellation, or message, attached to patient and optional appointment. |
| `ClinicIntakeQuestion` | Procedure-scoped public booking question with type, help text, required/active flags, and sort order. |
| `ClinicIntakeResponse` | Appointment-linked intake answer snapshot from public booking, preserving prompt/type even if the question changes later. |
| `ClinicPatientReview` | Internal reputation workflow: review request status, rating, private note, candidate public text, and request/reply/publish timestamps. |
| `ClinicVisit` | Completed (or in-progress) encounter: **`nextSteps`** (follow-up / what to do next), clinical text fields, optional links to an appointment and treatment plan, aftercare template snapshots, and **`inventoryConsumedAt`** idempotency marker for auto-consumption. |
| `ClinicPatientMedia` | Before/after/other photos; **`data`** (`Bytes`, optional) and/or **`blobPathname`** (private Vercel Blob); optional protocol checklist JSON and marketing-consent marker; served/deleted via **`GET/DELETE /api/clinic/media/[id]`** (tenant-scoped). |
| `ClinicPatientPayment` | Patient-level payments (amount, patient-facing discount/fee, optional discount rule/name/reason snapshot, internal **`processorFeeCents`**, method, status, optional **`visitId`** / **`appointmentId`**). Refund corrections create separate `REFUNDED` adjustment rows instead of overwriting the original paid row. |
| `ClinicPriceQuote` / `ClinicPriceQuoteLine` | Patient treatment estimates for repeated price questions: quote number, status, validity, note/terms, totals, service/custom line items, PDF export, and WhatsApp/email text handoff. |
| `ClinicPaymentCorrection` | Audit trail for payment corrections: original payment, optional refund adjustment payment, type (`REFUND`/`VOID`), amount, method, reason, note, actor, and timestamp. |
| `ClinicPaymentFeeRule` | Tenant payment acquiring rules by method: percent bps, fixed fee, active flag. New paid payments snapshot the calculated processor fee. |
| `ClinicDiscountRule` | Tenant named promotion/discount rules for visits and packages: percent/fixed value, active flag, and notes. Applying a non-zero discount requires a reason and snapshots the rule name. |
| `ClinicGiftCard` / `ClinicGiftCardRedemption` | Prepaid voucher ledger: sale/buyer/recipient/code/original balance, remaining liability, expiry/status, and patient redemptions that create `GIFT_CARD:*` patient payment rows. |
| `ClinicDailyClose` | Tenant daily reconciliation snapshot: business date, expected payment totals by method, counted totals, discrepancies, pending/refund/payment counts, processor fees, note, and draft/finalized status. |
| `ClinicProductSale` / `ClinicProductSaleLine` | Retail / aftercare products sold from a visit: line items, stock deduction movements, optional appointment/visit link, and a payment row for finance revenue. |
| `ClinicPatientPackage` / `ClinicPackageRedemption` | Prepaid treatment packages sold to a patient, with list price, discount snapshot/reason, final sale price, remaining session balance, optional service restriction, expiry, and automatic redemption rows when a completed visit consumes a session. |
| `ClinicConsentTemplate` / `ClinicConsentRecord` | Reusable procedure-specific consent templates and immutable signed patient consent snapshots with contraindication checklist, aftercare acknowledgement, and optional visit/appointment links. |
| `ClinicAftercareTemplate` | Procedure-specific aftercare library: reusable message body plus optional PDF/document reference. Visit completion snapshots title/message/document fields and can prepare WhatsApp handoff. |
| `ClinicTreatmentPlan` | Planned patient course of care with expected sessions, cadence, target dates, service, goals, next steps, photo milestones, status, and linked visits. |
| `ClinicCrmActivity` | CRM timeline: type (call, WhatsApp, note, …), **`body`**, **`occurredAt`**. Patient-card voice dictation saves reviewed transcript text here; no separate voice table. |
| `ClinicStockItem` | Inventory line: **`quantityOnHand`**, **`reorderPoint`** (low-stock when on-hand <= point and point &gt; 0), optional **`procedureId`**, `barcode`, `consumePerVisit`, and low-stock notification cooldown. |
| `ClinicProcedureMaterial` | Bill of materials row linking a procedure to a stock item with quantity per visit, unit material cost, active flag, note, and sort order. |
| `ClinicStockMovement` | **`RECEIPT` / `ADJUSTMENT` / `CONSUMPTION` / `RETURN`** with signed **`quantityDelta`**; updates item atomically in a transaction. |
| `ClinicStockCountSession` / `ClinicStockCountLine` | Physical stock-taking workflow: count session snapshot, expected vs counted quantities, variance reason, note, and movement reference after finalization. |
| `ClinicSupplier` / `ClinicSupplierSettlement` | Supplier profiles with contact/payment terms/reorder notes plus settlement rows; unpaid balance is derived from received PO line cost minus settlements. |
| `ClinicPurchaseOrder` / `ClinicPurchaseOrderLine` | Supplier orders and receipts; receiving creates `RECEIPT` stock movements and increments item quantities. POs can link to a supplier profile while preserving the supplier name snapshot. |
| `ClinicUserPreference` | Tenant-scoped practitioner preferences for saved UI language and notification channels/types. |
| `ClinicWebPushSubscription` | Browser push endpoints for opted-in clinic alerts, scoped to user + tenant. |
| `ClinicPractitionerPushDelivery` | Per-user idempotency log so cron/manual push scans do not resend the same operational alert. |

Relationships: `ClinicAppointment` → `ClinicPatient`, optional → `ClinicProcedure`; **`ClinicVisit`** optionally → `ClinicAppointment`; `ClinicAppointmentEvent` → `ClinicAppointment`; media and payments optionally → **`ClinicVisit`**. Cascade deletes are tenant-safe because patient belongs to tenant.

Availability: `/api/clinic/availability/slots` combines `ClinicAvailabilityRule`, `ClinicBlockedTime`, existing active appointments, service duration, and hidden buffers. General rules apply to all services; if a procedure has rules for a given day, those service-specific rules override the general day rules. `FIXED` rules step by `slotIntervalMinutes`; `DYNAMIC` rules step by selected service duration plus buffer for tighter packing. It returns candidate slots only; appointment creation still goes through the conflict-safe appointment API.

Scheduling guard: appointment create/reschedule checks existing appointment occupancy, blocked time, working hours, and minimum lead time. Staff can override a violation only when `allowConflictOverride=true` and a non-empty `overrideReason` is provided; the reason is stored on the appointment and visible in the drawer.

Home visits: patient records store the default address, area, and parking/access notes. Appointments snapshot the visit location and `travelBufferBeforeMinutes` / `travelBufferAfterMinutes`; these buffers expand the occupied scheduling window so route time is protected from overlaps.

Reminder system: WhatsApp is first-class but browser apps cannot truly auto-send WhatsApp messages. The runner prepares due messages and logs them; staff opens the generated `wa.me` link to send. Rebooking follow-up nudges can be scheduled from completed appointments and are skipped at runner time if the patient already has a future appointment. Review requests create internal `ClinicPatientReview` rows so ratings/replies can be captured before publishing externally. Future WhatsApp Business API integration can mark deliveries as sent automatically.

Public booking: `/book/[tenant.slug]` is a private branded link, not a marketplace. It is disabled by default and controlled from the clinic dashboard using `tenant_settings.thresholds.publicBooking.enabled`. When enabled, the public API exposes active services, generated slots, and active service-specific intake questions. Booking creation stores DOB/contact/consent as a real patient + `ONLINE` appointment, validates required intake answers, snapshots answers into `ClinicIntakeResponse`, and still uses the scheduling guard. No public override is allowed.

Patient portal lite: `/patient-portal/[token]` is a private, token-based patient view. Tokens are stored as SHA-256 hashes, expire, and can be revoked from the patient chart. The portal exposes patient-safe operational data only: upcoming appointments, aftercare/next steps, aftercare document links, package balances, receipts, accepted consent titles, and treatment-plan progress. Requests from the portal do not mutate appointments directly; they create a `ClinicPatientPortalRequest`, CRM note, and appointment event for staff review.

PWA practitioner mode: `/site.webmanifest` starts installed app sessions at `/clinic`, exposes shortcuts for Today/New appointment/Patients, and uses the clinic app icon. The clinic dashboard registers `/clinic-push-sw.js` and shows an installable mobile-first practitioner card with online/offline status, today's agenda, quick actions, and a device-local offline note draft. Patient visit forms autosave patient-scoped local drafts and can import the dashboard scratchpad; the local draft is cleared only after the standard `/api/clinic/visits` save succeeds. Patient photo uploads that happen offline or fail due to connectivity are queued in browser IndexedDB and synced manually from the Photos tab. The first pass does not cache authenticated clinic routes or run background sync; those remain later features.

Mobile portal shell: `app/clinic/ClinicShell.tsx` is optimized for iPhone/iPad use because solo practitioners often work without a PC. Mobile uses a compact top bar for logo/language/logout and a separate full-width swipeable navigation row; desktop keeps the persistent sidebar. The main clinic canvas includes extra mobile bottom padding for safe-area controls.

WhatsApp assistant: `/clinic/whatsapp-assistant` is a manual, practitioner-controlled first pass for bot-like intake replies. It fetches patients, procedures, and booking-link status to generate booking, price, intake, appointment-status, and reminder/follow-up messages, then copies text or opens `wa.me`. When a patient is selected, the reviewed outgoing message can be saved into `ClinicCrmActivity` as a `WHATSAPP` record; `Open WhatsApp + save` logs it before handoff. It does not receive inbound WhatsApp messages or auto-send; full WhatsApp Business API automation remains a later integration.

Message history: patient profiles reuse `ClinicCrmActivity` instead of introducing a separate chat table in the first pass. The patient CRM tab shows WhatsApp/email activity as a dedicated Message history section above the full interaction log, while manual history capture still uses the existing CRM form with `WHATSAPP` or `EMAIL` type. This keeps the current source of truth simple and tenant-scoped while leaving room for later inbound/delivery sync fields.

Call log: patient profiles also reuse `ClinicCrmActivity` for a manual call-log first pass. The CRM tab provides a structured call form for direction, outcome, summary, and next action, formats those fields into a `CALL` activity body, and shows recent calls separately above message history. A `tel:` link is offered when the patient has a phone number, but there is no call recording, device call-log import, or telephony integration yet.

Service analytics: `/clinic/service-analytics` is a focused view over the existing Finance / P&L v2 procedure profitability data. It calls `GET /api/clinic/finance/overview` and presents procedure-level revenue, completed visit count, average price, material cost, booked time, gross profit, margin, and profit per hour with sort controls. It does not introduce a separate analytics table; `lib/clinic/profitability.ts` remains the source for procedure calculations.

Revenue plan: `/clinic/revenue-plan` stores a tenant's monthly target and optional expected average visit value in `tenant_settings.thresholds.revenuePlan` via `GET/PATCH /api/clinic/revenue-plan`. The page calculates current-month achieved revenue from paid patient payments minus refunds, then derives gap, required visits, daily pace, required daily pace, projected month, and completed visits. No new table is introduced in the first pass.

## API conventions

- Base path: **`/api/clinic/*`**.
- **Patient media:** `POST .../patients/[id]/media` uploads before/after/other images from camera or file picker with optional visit links, capture-protocol checklist, procedure snapshot, and marketing-consent marker; `GET/DELETE /api/clinic/media/[id]` serves/removes private tenant-scoped media.
- **Patient-safe PDFs:** `GET .../patients/[id]/summary-pdf` returns a minimal English handout; `GET .../patients/[id]/patient-safe-export` returns a fuller patient-facing treatment export with summaries, aftercare, receipts, and accepted consent snapshots. Staff-only fields are excluded by construction (not redacted — never loaded).
- **Patient quotes:** `GET/POST .../patients/[id]/quotes`, `PATCH .../quotes/[quoteId]`, and `GET .../quotes/[quoteId]/pdf` create and share patient treatment estimates. Quotes are tenant-scoped, can use procedure catalog prices or custom lines, and expose PDF plus WhatsApp/email-ready text from the patient card.
- **Patient data portability/deletion:** `GET .../patients/[id]/export` returns a full tenant-scoped JSON archive for internal portability; `DELETE .../patients/[id]` requires an exact typed confirmation and deletes the patient plus linked rows, with best-effort private blob cleanup.
- **Patient import:** `POST /api/clinic/patients/import` accepts `.xlsx`/`.csv` uploads for preview, detects invalid rows and phone/email duplicates, and commits only clean patient rows when called with `action=commit`.
- **Inventory:** `GET/POST /api/clinic/inventory`, `GET/PATCH /api/clinic/inventory/[id]`, `POST .../movements`, `GET .../lookup?q=`.
- **Product import:** `POST /api/clinic/inventory/import` accepts `.xlsx`/`.csv` uploads for preview, detects invalid rows and barcode/SKU/name duplicates, and commits only clean stock items when called with `action=commit`.
- **Procedure materials:** `GET/POST /api/clinic/procedures/[id]/materials`, `PATCH/DELETE .../materials/[materialId]`; visit completion deducts active material rows before falling back to legacy stock-item procedure links.
- **Procedure intake questions:** `GET/POST /api/clinic/procedures/[id]/intake-questions`, `PATCH/DELETE .../intake-questions/[questionId]`; active questions are shown on public booking for that service and required answers block submission until completed.
- **Aftercare library:** `GET/POST /api/clinic/aftercare-templates`, `PATCH .../[id]`; procedure pages manage reusable post-visit messages and document links. Appointment/visit completion snapshots the selected aftercare fields onto `ClinicVisit`, copies/opens WhatsApp when prepared, and exposes the patient-safe snapshot in the portal.
- **Stock-taking:** `GET/POST /api/clinic/stock-takes`, `GET/PATCH .../stock-takes/[id]`, `PATCH .../lines/[lineId]`, `POST .../finalize`; finalization posts audited `ADJUSTMENT` stock movements and updates on-hand quantities to the physical count.
- **Suppliers:** `GET/POST /api/clinic/suppliers`, `GET/PATCH /api/clinic/suppliers/[id]`, `POST .../[id]/settlements`; supplier profiles aggregate linked purchase history, received value, settlements, and unpaid amount.
- **Purchase orders:** `GET/POST /api/clinic/purchase-orders`, `GET/PATCH /api/clinic/purchase-orders/[id]`, `POST .../[id]/receive`; new POs may pass `supplierId`, with `supplierName` kept as a snapshot.
- **Availability:** `GET/PATCH /api/clinic/availability`, `GET /api/clinic/availability/slots`, `GET/POST /api/clinic/blocked-times`, `DELETE .../blocked-times/[id]`.
- **Reminders/reputation:** `GET/PATCH /api/clinic/reminders/templates`, `GET /api/clinic/reminders/deliveries`, `GET/POST /api/clinic/reminders/run`, `GET /api/clinic/reviews`, `PATCH /api/clinic/reviews/[id]`; appointment actions support `send_reminder`, `schedule_reminder`, `no_show_follow_up`, `schedule_rebooking_follow_up`, and `send_review_request`.
- **Client balance:** patient list/detail and appointment detail responses include computed `clientBalance` from `lib/clinic/client-balance.ts`. `ARRIVED`/`COMPLETED` procedure prices are expected charges; linked paid/refunded/pending payments adjust due/credit; payment discounts reduce expected charge and patient-facing fees increase it; standalone paid payments are treated as deposits/credit. Package-sale payments are excluded from deposit credit to avoid double-counting prepaid course revenue as open balance.
- **Inline payments/receipts:** appointment drawers can record appointment-linked payments, discounts, fees, method/status/reference/note, and download receipt PDFs from `GET /api/clinic/patients/[id]/payments/[paymentId]/receipt`.
- **Refund/correction workflow:** `PATCH /api/clinic/patients/[id]/payments/[paymentId]` records required-reason refunds and voids. Refunds preserve the original payment and create a linked `REFUNDED` adjustment payment plus `ClinicPaymentCorrection`; voids mark the original as `VOID` and store the reason.
- **Product sales:** `GET/POST /api/clinic/patients/[id]/product-sales` records aftercare product sale lines from a visit, deducts stock with `CONSUMPTION` movements, and creates a `PRODUCT_SALE:*` payment reference for finance revenue without treating it as client balance credit.
- **Discount rules:** `GET/POST/PATCH /api/clinic/discount-rules` manages tenant named percent/fixed discounts. Visit payments and package sales can reference a rule, store the discount amount/name/reason snapshot, and reject non-zero discounts without a reason.
- **Gift cards:** `GET/POST /api/clinic/gift-cards` sells and lists prepaid vouchers with buyer/recipient details and remaining balance. `POST /api/clinic/gift-cards/redeem` validates active/paid/not-expired balance, decrements it transactionally, creates a `ClinicGiftCardRedemption`, and records a `GIFT_CARD:*` patient payment.
- **Payment fee rules:** `GET/PATCH /api/clinic/payment-fee-rules` manages method-level acquiring costs; new paid payments store `processorFeeCents` without changing patient balance.
- **Daily close:** `GET/POST /api/clinic/daily-close` previews one business date from payment rows plus gift-card sales, then saves or finalizes counted cash/card/transfer/POS/Stripe/other totals and discrepancies.
- **Finance / P&L v2:** `GET /api/clinic/finance/overview` returns net revenue, discounts, gift-card sales/redemptions/outstanding liability, refunds, pending payments, product-sale revenue, direct material/product/payment-processing costs, gross profit, operating expenses, operating profit, expense categories, and procedure profitability rows derived from completed visits, linked payments, and procedure BOM rows.
- **Treatment packages:** `GET/POST /api/clinic/patients/[id]/packages` lists and sells prepaid packages, including optional discount rule/reason snapshots. Completing a visit with a matching service automatically creates a package redemption and decrements one remaining session via `lib/clinic/patient-packages.ts`.
- **Consents:** `GET/POST /api/clinic/consents/templates` manages reusable consent templates. `GET/POST /api/clinic/patients/[id]/consents` lists and signs consent snapshots for a patient, optionally linked to a visit or appointment.
- **Treatment plans:** `GET/POST /api/clinic/patients/[id]/treatment-plans` and `PATCH .../treatment-plans/[planId]` manage planned care courses. Visit create/update accepts `treatmentPlanId`, and patient charts compute plan progress from linked completed visits.
- **Notification center:** `GET /api/clinic/inbox` returns derived operational tasks for reminders due, online bookings, recent reschedules, review requests, unpaid visits, and low-stock inventory. It does not persist notifications; it aggregates live source-of-truth rows.
- **Practitioner push:** `GET/POST /api/clinic/practitioner-push/run` derives the same operational tasks plus cancellations and expiring packages, filters by saved user preferences, sends browser push to active subscriptions, deletes stale subscriptions, and records `ClinicPractitionerPushDelivery` rows for idempotency. Cron can call it with `CRON_SECRET`; signed-in users run their own tenant.
- **Retention analytics/reactivation:** `GET /api/clinic/retention/overview` derives rebook rate, returning-client rate, no-show rate, follow-up conversion, repeat interval by procedure, and 60/90/120-day dormant patient reactivation rows with localized WhatsApp message links.
- **Booking funnel analytics:** `POST /api/clinic/public-booking/[slug]/funnel` records public booking step events with source/UTM metadata for enabled tenant links; `GET /api/clinic/booking-funnel/overview` summarizes conversion by stage, day, procedure, source, and abandoned sessions with localized WhatsApp follow-up copy.
- **Occasion messages:** `GET /api/clinic/occasions/overview` derives upcoming birthdays from patient DOBs for 7/30/90-day windows and returns localized EN/RU WhatsApp greeting copy.
- **Referral tracking:** patient create/edit stores `referredByName` and `referralNote`; `GET /api/clinic/referrals/overview` groups referred patients by source/person for 30/90/365-day and all-time windows.
- **Patient portal lite:** `GET/POST/PATCH /api/clinic/patients/[id]/portal-link` manages private portal links; `GET/POST /api/patient-portal/[token]` returns patient-safe portal data and creates reschedule/cancel/message requests; `GET /api/patient-portal/[token]/payments/[paymentId]/receipt` downloads receipt PDFs for that patient only.
- **Public booking:** `GET/POST /api/clinic/public-booking/[slug]` — unauthenticated service/slot/intake discovery and online appointment request for an enabled tenant slug. `GET/PATCH /api/clinic/public-booking/settings` controls the on/off switch for staff.
- **Account/preferences:** `GET/PATCH /api/clinic/me` returns and updates practitioner profile, saved language, password, and notification preferences. Low-stock push/email delivery respects `ClinicUserPreference`; tenants with no preference rows keep the legacy env-recipient fallback.
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
