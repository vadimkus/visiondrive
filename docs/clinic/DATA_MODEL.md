# Practice OS — data model (quick reference)

Authoritative detail lives in **`prisma/schema.prisma`** and [ARCHITECTURE.md](./ARCHITECTURE.md). This page is a **short map** for builders.

## Core entities

| Table | Purpose |
|-------|---------|
| `tenants` | Practice / organization boundary. |
| `users` + `tenant_memberships` | Staff accounts; clinic login uses `users.defaultTenantId` in JWT. |
| `clinic_patients` | Demographics, contacts, home address / area / access notes, client `category` and `tags`, simple referral fields (`referred_by_name`, `referral_note`), **internal_notes** (staff only), optional **`anamnesis_json`** (v1 JSON: allergies, medications, conditions, social). |
| `clinic_procedures` | Service catalog (duration, hidden buffer, price, currency). |
| `clinic_appointments` | Scheduled slots; richer status; source; optional procedure; hidden buffer; home-visit location and travel buffers; lifecycle timestamps; **internal_notes**; optional override reason for intentional conflict/out-of-hours bookings. |
| `clinic_appointment_events` | Appointment audit/change history for reschedules, reminders, visit actions, payments, and follow-ups. |
| `clinic_availability_rules` | Tenant working-hours rules by weekday: start/end, `slot_mode` (`FIXED`/`DYNAMIC`), slot interval, minimum lead time, active/closed day, optional `procedure_id` for service-specific overrides. |
| `clinic_blocked_times` | Manual private time / lunch / leave blocks that remove availability slots. |
| `clinic_reminder_templates` | Tenant WhatsApp/email/SMS templates for appointment reminders, no-show follow-up, rebooking follow-up, and review requests. |
| `clinic_reminder_deliveries` | Reminder schedule and preparation log: status, scheduled time, body, WhatsApp URL, errors. |
| `clinic_booking_funnel_events` | Public booking funnel events: link views, service selection, slot selection, form start/submission, booking completion, source/UTM metadata, and minimal submitted-contact metadata for abandoned booking recovery. |
| `clinic_patient_portal_links` | Hashed private patient portal links with expiry, revocation, last-access metadata, and no stored plaintext token. |
| `clinic_patient_portal_requests` | Patient-submitted portal requests for reschedule, cancellation, or message; mirrored into CRM notes for staff follow-up. |
| `clinic_intake_questions` | Service-specific public booking questions configured per procedure: prompt, help text, type, required flag, active flag, and sort order. |
| `clinic_intake_responses` | Appointment-linked intake answer snapshots from public booking, preserving the original prompt/type for clinical context. |
| `clinic_patient_reviews` | Internal review/reputation workflow: request status, rating, private note, candidate public text, requested/replied/published timestamps. |
| `clinic_visits` | Completed encounters; optional `treatment_plan_id`; **next_steps** drives “what to do next” on the chart; **inventory_consumed_at** prevents repeated auto-deduct. |
| `clinic_patient_media` | Before/after/other images captured from camera or uploaded from file picker: Postgres **`BYTEA`** and/or optional **Vercel Blob** (`blob_pathname`); mime + caption. |
| `clinic_patient_payments` | Payments; optional `visit_id` / `appointment_id`, discount, patient-facing fee, internal `processor_fee_cents`, method, status, reference, note. Refunds are separate `REFUNDED` adjustment payment rows that point back to the original via correction records. |
| `clinic_payment_corrections` | Audit trail for refunds and voids: original payment, optional adjustment payment, type, amount, method, reason, note, actor, and timestamp. |
| `clinic_payment_fee_rules` | Tenant method-level acquiring rules: payment method, percent bps, fixed fee, active flag. New paid payments snapshot processing fees automatically. |
| `clinic_daily_closes` | Daily reconciliation snapshots: expected payment totals by method, counted totals, discrepancies, pending/refund totals, payment/appointment counts, notes, and draft/finalized status. |
| `clinic_product_sales` + `clinic_product_sale_lines` | Retail / aftercare product sales linked to patient, optional visit/appointment, stock item lines, sale totals, and payment reference. |
| `clinic_patient_packages` + `clinic_package_redemptions` | Prepaid patient packages/courses: total/remaining sessions, optional service restriction, expiry, payment reference, and visit-linked session usage rows. |
| `clinic_consent_templates` + `clinic_consent_records` | Consent template library plus signed patient snapshots with contraindications, signature name, aftercare acknowledgement, and optional visit/appointment links. |
| `clinic_treatment_plans` | Planned courses of care for a patient: expected sessions, cadence, target dates, procedure, goals, next steps, photo milestones, status, and linked visits. |
| `clinic_crm_activities` | CRM timeline (type + body + occurred_at). |
| `clinic_stock_items` | Inventory SKU: name, unit, `quantity_on_hand`, `reorder_point`, optional legacy `procedure_id`, optional `barcode`, `consume_per_visit`, low-stock cooldown. |
| `clinic_procedure_materials` | Bill of materials rows: procedure + stock item + quantity per visit + unit material cost + active flag. |
| `clinic_stock_movements` | Receipt / adjustment / consumption / return; signed `quantity_delta`; never allows negative on-hand. |
| `clinic_stock_count_sessions` + `clinic_stock_count_lines` | Physical stock counts with expected vs counted quantities, variance reason/note, status, finalization timestamp, and adjustment movement references. |
| `clinic_suppliers` + `clinic_supplier_settlements` | Supplier profiles, contact/payment terms/reorder notes, settlement history, and derived unpaid balance. |
| `clinic_purchase_orders` + `clinic_purchase_order_lines` | Supplier ordering and receiving; receipts create `RECEIPT` stock movements; orders can link to supplier profiles while preserving the supplier name snapshot. |
| `clinic_web_push_subscriptions` | Browser push subscriptions for low-stock alerts. |

## API surface (high level)

- `GET/POST /api/clinic/patients` — list (+ `?q=`, `?category=`, `?tag=` filters), create; list rows include computed `clientBalance`.
- `GET/PATCH/DELETE /api/clinic/patients/[id]` — full chart for GET (includes related collections and computed `clientBalance`); DELETE requires exact typed confirmation and hard-deletes the tenant-scoped patient with linked records.
- `POST /api/clinic/patients/import` — preview and commit client spreadsheet imports from `.xlsx` / `.csv`; duplicate rows are detected by phone/email before creation.
- `GET /api/clinic/patients/[id]/summary-pdf` — **patient-safe** PDF (demographics, anamnesis, appointment/visit dates only; no internal notes, CRM, payments, media, clinical visit text).
- `GET /api/clinic/patients/[id]/export` — internal full JSON archive for portability, including clinical/finance/consent/package/portal/CRM data and media metadata (media binaries are downloaded separately via authenticated media paths).
- `GET/POST /api/clinic/inventory` — list (`?lowStock=1`, `?includeInactive=1`), create (optional opening `RECEIPT` movement).
- `GET/PATCH /api/clinic/inventory/[id]` — detail + metadata; `GET/POST .../movements` — history + record movement (transactional qty update).
- `GET /api/clinic/inventory/lookup?q=` — scanner lookup by barcode, SKU, or exact item name.
- `POST /api/clinic/inventory/import` — preview and commit product spreadsheet imports from `.xlsx` / `.csv`; duplicate rows are detected by barcode, SKU, or name before creation.
- `GET/POST /api/clinic/procedures/[id]/materials`; `PATCH/DELETE .../materials/[materialId]` — manage procedure bill-of-material rows.
- `GET/POST /api/clinic/procedures/[id]/intake-questions`; `PATCH/DELETE .../intake-questions/[questionId]` — manage service-specific public intake questions.
- `GET/POST /api/clinic/stock-takes`; `GET/PATCH /api/clinic/stock-takes/[id]`; `PATCH .../lines/[lineId]`; `POST .../finalize` — create/count/finalize stock-taking sessions and post variance adjustments.
- `GET/POST /api/clinic/suppliers`; `GET/PATCH /api/clinic/suppliers/[id]`; `POST /api/clinic/suppliers/[id]/settlements` — supplier contacts, purchase history, received value, payments, and unpaid balance.
- `GET/POST /api/clinic/purchase-orders`; `GET/PATCH /api/clinic/purchase-orders/[id]`; `POST /api/clinic/purchase-orders/[id]/receive`.
- `GET /api/clinic/push/vapid-public`; `POST/DELETE /api/clinic/push/subscribe`.
- `GET/POST /api/clinic/appointments` — range query + conflict-safe create; create checks existing appointments, blocked time, working hours, and minimum lead time.
- `GET/PATCH /api/clinic/appointments/[id]` — read/update one appointment, including drawer context, patient balance, and event history; schedule changes require override reason when they violate scheduling rules.
- `POST /api/clinic/appointments/[id]/actions` — reminder, start/complete visit, follow-up, and review-request actions.
- `GET/PATCH /api/clinic/availability` — read/save general and service-specific working-hour rules.
- `GET /api/clinic/availability/slots` — generate bookable slots from working hours, service-specific overrides, fixed/dynamic slot mode, blocked time, appointments, service duration, and buffers.
- `GET/POST /api/clinic/blocked-times`; `DELETE /api/clinic/blocked-times/[id]` — manual private/closed time.
- `GET/PATCH /api/clinic/reminders/templates` — read/save reminder templates.
- `GET /api/clinic/reminders/deliveries` — delivery/preparation log.
- `GET/POST /api/clinic/reminders/run` — prepare due scheduled reminders; cron may use `CRON_SECRET`.
- `GET /api/clinic/reviews`; `PATCH /api/clinic/reviews/[id]` — reputation inbox and internal rating/reply updates.
- `GET/POST /api/clinic/public-booking/[slug]` — public service/slot lookup, service-specific intake questions, and online appointment creation by enabled tenant slug.
- `GET/PATCH /api/clinic/public-booking/settings` — staff on/off control stored in `tenant_settings.thresholds.publicBooking.enabled`.
- `POST /api/clinic/visits`, `PATCH /api/clinic/visits/[id]` — visits may link to a treatment plan.
- `POST /api/clinic/patients/[id]/media`, `GET/DELETE /api/clinic/media/[id]` — attach, serve, and delete private patient photos.
- `POST .../payments`, `POST .../crm`.
- `GET/PATCH /api/clinic/payment-fee-rules` — configure method-level acquiring costs used to snapshot `processor_fee_cents` on new paid payments.
- `GET/POST /api/clinic/daily-close` — preview, save, and finalize one-day payment reconciliation by method.
- `PATCH .../payments/[paymentId]`, `GET .../payments/[paymentId]/receipt` — record refund/void corrections with required reason and export patient-safe receipt PDF.
- `GET/POST .../product-sales` — record aftercare retail products from a visit, deduct inventory, and create finance revenue payment rows.
- `GET /api/clinic/finance/overview` — finance dashboard data including P&L v2, direct material/product/payment-processing costs, product sales, operating expenses, and procedure profitability.
- `GET/POST .../packages` — list/sell prepaid treatment packages; completed visits auto-debit one matching session.
- `GET/POST /api/clinic/consents/templates`; `GET/POST .../patients/[id]/consents` — manage consent templates and signed patient consent records.
- `GET/POST .../patients/[id]/treatment-plans`; `PATCH .../treatment-plans/[planId]` — create/update planned care courses and show progress from linked visits.
- `GET /api/clinic/inbox` — derived notification center for reminders due, online bookings, recent reschedules, review requests, unpaid visits, and low-stock items.
- `GET /api/clinic/retention/overview` — derived retention analytics for rebook rate, returning clients, no-shows, follow-up conversion, repeat intervals, and 60/90/120-day dormant patient reactivation rows with localized WhatsApp links.
- `POST /api/clinic/public-booking/[slug]/funnel` — public booking step tracking for enabled tenant booking links, including source/UTM metadata from shared links.
- `GET /api/clinic/booking-funnel/overview` — staff analytics for public booking conversion by stage, day, procedure, source, and abandoned sessions with localized WhatsApp follow-up messages.
- `GET /api/clinic/occasions/overview` — derived birthday/occasion workflow from existing patient DOBs, returning 7/30/90-day birthday rows with localized WhatsApp greeting copy.
- `GET /api/clinic/referrals/overview` — derived referral report from patient `referred_by_name`, grouped by source/person for 30/90/365-day and all-time windows.
- `GET/POST/PATCH /api/clinic/patients/[id]/portal-link` — staff creates, lists, and revokes private patient portal links.
- `GET/POST /api/patient-portal/[token]` — public patient-safe portal data and reschedule/cancel/message request creation by private token.
- `GET /api/patient-portal/[token]/payments/[paymentId]/receipt` — patient-safe receipt PDF download through an active portal token.
- `GET/PATCH /api/clinic/me` — profile + password.

All routes require **clinic session** (`getClinicSession`): `authToken` cookie + `portal=clinic`.
