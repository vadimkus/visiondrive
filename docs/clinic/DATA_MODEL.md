# Practice OS — data model (quick reference)

Authoritative detail lives in **`prisma/schema.prisma`** and [ARCHITECTURE.md](./ARCHITECTURE.md). This page is a **short map** for builders.

## Core entities

| Table | Purpose |
|-------|---------|
| `tenants` | Practice / organization boundary. |
| `users` + `tenant_memberships` | Staff accounts; clinic login uses `users.defaultTenantId` in JWT. |
| `clinic_patients` | Demographics, contacts, client `category` and `tags`, **internal_notes** (staff only), optional **`anamnesis_json`** (v1 JSON: allergies, medications, conditions, social). |
| `clinic_procedures` | Service catalog (duration, hidden buffer, price, currency). |
| `clinic_appointments` | Scheduled slots; richer status; source; optional procedure; hidden buffer; lifecycle timestamps; **internal_notes**; optional override reason for intentional conflict/out-of-hours bookings. |
| `clinic_appointment_events` | Appointment audit/change history for reschedules, reminders, visit actions, payments, and follow-ups. |
| `clinic_availability_rules` | Tenant working-hours rules by weekday: start/end, `slot_mode` (`FIXED`/`DYNAMIC`), slot interval, minimum lead time, active/closed day, optional `procedure_id` for service-specific overrides. |
| `clinic_blocked_times` | Manual private time / lunch / leave blocks that remove availability slots. |
| `clinic_reminder_templates` | Tenant WhatsApp/email/SMS templates for appointment reminders, no-show follow-up, rebooking follow-up, and review requests. |
| `clinic_reminder_deliveries` | Reminder schedule and preparation log: status, scheduled time, body, WhatsApp URL, errors. |
| `clinic_patient_reviews` | Internal review/reputation workflow: request status, rating, private note, candidate public text, requested/replied/published timestamps. |
| `clinic_visits` | Completed encounters; **next_steps** drives “what to do next” on the chart; **inventory_consumed_at** prevents repeated auto-deduct. |
| `clinic_patient_media` | Before/after images: Postgres **`BYTEA`** and/or optional **Vercel Blob** (`blob_pathname`); mime + caption. |
| `clinic_patient_payments` | Payments; optional `visit_id`. |
| `clinic_crm_activities` | CRM timeline (type + body + occurred_at). |
| `clinic_stock_items` | Inventory SKU: name, unit, `quantity_on_hand`, `reorder_point`, optional `procedure_id`, optional `barcode`, `consume_per_visit`, low-stock cooldown. |
| `clinic_stock_movements` | Receipt / adjustment / consumption / return; signed `quantity_delta`; never allows negative on-hand. |
| `clinic_purchase_orders` + `clinic_purchase_order_lines` | Supplier ordering and receiving; receipts create `RECEIPT` stock movements. |
| `clinic_web_push_subscriptions` | Browser push subscriptions for low-stock alerts. |

## API surface (high level)

- `GET/POST /api/clinic/patients` — list (+ `?q=`, `?category=`, `?tag=` filters), create.
- `GET/PATCH /api/clinic/patients/[id]` — full chart for GET (includes related collections).
- `GET /api/clinic/patients/[id]/summary-pdf` — **patient-safe** PDF (demographics, anamnesis, appointment/visit dates only; no internal notes, CRM, payments, media, clinical visit text).
- `GET/POST /api/clinic/inventory` — list (`?lowStock=1`, `?includeInactive=1`), create (optional opening `RECEIPT` movement).
- `GET/PATCH /api/clinic/inventory/[id]` — detail + metadata; `GET/POST .../movements` — history + record movement (transactional qty update).
- `GET /api/clinic/inventory/lookup?q=` — scanner lookup by barcode, SKU, or exact item name.
- `GET/POST /api/clinic/purchase-orders`; `GET/PATCH /api/clinic/purchase-orders/[id]`; `POST /api/clinic/purchase-orders/[id]/receive`.
- `GET /api/clinic/push/vapid-public`; `POST/DELETE /api/clinic/push/subscribe`.
- `GET/POST /api/clinic/appointments` — range query + conflict-safe create; create checks existing appointments, blocked time, working hours, and minimum lead time.
- `GET/PATCH /api/clinic/appointments/[id]` — read/update one appointment, including drawer context and event history; schedule changes require override reason when they violate scheduling rules.
- `POST /api/clinic/appointments/[id]/actions` — reminder, start/complete visit, follow-up, and review-request actions.
- `GET/PATCH /api/clinic/availability` — read/save general and service-specific working-hour rules.
- `GET /api/clinic/availability/slots` — generate bookable slots from working hours, service-specific overrides, fixed/dynamic slot mode, blocked time, appointments, service duration, and buffers.
- `GET/POST /api/clinic/blocked-times`; `DELETE /api/clinic/blocked-times/[id]` — manual private/closed time.
- `GET/PATCH /api/clinic/reminders/templates` — read/save reminder templates.
- `GET /api/clinic/reminders/deliveries` — delivery/preparation log.
- `GET/POST /api/clinic/reminders/run` — prepare due scheduled reminders; cron may use `CRON_SECRET`.
- `GET /api/clinic/reviews`; `PATCH /api/clinic/reviews/[id]` — reputation inbox and internal rating/reply updates.
- `GET/POST /api/clinic/public-booking/[slug]` — public service/slot lookup and online appointment creation by enabled tenant slug.
- `GET/PATCH /api/clinic/public-booking/settings` — staff on/off control stored in `tenant_settings.thresholds.publicBooking.enabled`.
- `POST /api/clinic/visits`, `PATCH /api/clinic/visits/[id]`.
- `POST /api/clinic/patients/[id]/media`, `GET /api/clinic/media/[id]`.
- `POST .../payments`, `POST .../crm`.
- `GET/PATCH /api/clinic/me` — profile + password.

All routes require **clinic session** (`getClinicSession`): `authToken` cookie + `portal=clinic`.
