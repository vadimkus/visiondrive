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

---

## Chunk 3 — 2026-04-23

**Shipped**

- **i18n:** English / Arabic for practice shell, patients, appointments calendar, patient record tabs & “what’s next”; `dir="rtl"` + `lang` when Arabic selected; persisted in `localStorage`.
- **Appointments:** Week **grid** (Mon–Sun), prev/next week, today, tap card → **edit**; `GET` + `PATCH /api/clinic/appointments/[id]`.
- **Patients:** **Sort** (name A–Z / Z–A / newest), shared loading/error/empty components, `ps` layout-friendly search field (`start`/`end`).
- **Timeline:** `buildTimelineItems` / `filterTimelineItems` in `lib/clinic/timeline.ts`; filter chips on patient record.
- **Shared UI:** `ClinicSpinner`, `ClinicAlert`, `ClinicEmptyState`; touch-friendly `min-h-11` patterns; safe-area padding on shell.
- **Local dev:** root `docker-compose.yml` + `docs/clinic/SETUP_LOCAL.md`; **Vitest** (`npm test`) for `week` + `timeline` helpers.
- **Docs:** `RUNBOOK.md`, `IRYNA_FLOWS.md`, `DATA_MODEL.md`; `.env.example` Docker URL hint.

**Tests**

- `npm test` — no database required.

**Follow-ups**

- Translate remaining English-only copy (dashboard blurb, forms in Overview/Photos/Payments/CRM, account page).
- API integration tests (optional) with Docker Postgres + scripted fetch.

---

## Chunk 4 — 2026-04-23 (session follow-on)

**Shipped (detail: `docs/clinic/CLINIC_SESSION_CHANGELOG.md`)**

- **i18n:** Remaining EN-only copy moved into `lib/clinic/strings.ts` and wired across dashboard, account, patient record (all tabs + forms), procedures, appointment create/edit, shared errors; AR strings added in parallel.
- **Appointments:** **Week | Month** toggle; month grid; **drag-and-drop** reschedule between days (`PATCH` `startsAt`, preserve local time); helpers in `lib/clinic/week.ts`, `lib/clinic/appointment-dnd.ts`; Vitest for month grid + reschedule math.
- **Media:** Optional **Vercel Blob** (`@vercel/blob` v2): `ClinicPatientMedia` gains nullable `data` + optional `blobPathname`; upload and `GET /api/clinic/media/[id]` support both BYTEA and private blob; `BLOB_READ_WRITE_TOKEN` documented in `.env.example`.

**Operational**

- `npx prisma db push` (and `prisma generate`) after schema change.
- Blob is **optional**; omit token to keep Postgres BYTEA-only behavior for new uploads.

**Follow-ups**

- ~~Refresh `ARCHITECTURE.md` / `DATA_MODEL.md` media rows for dual storage.~~ (done in Chunk 5)
- API integration tests; iPad-native reschedule UX if HTML5 DnD is insufficient on target devices.

---

## Chunk 5 — 2026-04-23 (anamnesis)

**Shipped**

- **Schema:** `ClinicPatient.anamnesisJson` (`Json?`) — v1 object: `allergies`, `medications`, `conditions`, `social` (+ `v: 1`).
- **API:** `PATCH /api/clinic/patients/[id]` accepts `anamnesisJson` (object or `null` to clear); validated max length per field (8k). GET chart includes the field.
- **UI:** Patient **Overview** — read-only anamnesis card; **Edit** form — four text areas + save with demographics.
- **i18n:** EN/AR strings for anamnesis labels and hints.
- **Lib:** `lib/clinic/anamnesis.ts` + Vitest; **`scripts/clinic-business-flow.ts`** asserts PATCH anamnesis.
- **Docs:** `ARCHITECTURE.md`, `DATA_MODEL.md` updated (media dual storage + anamnesis).

**Operational**

- `npx prisma db push` after pull.

---

## Chunk 8 — 2026-04-26 (inventory follow-ups hardening)

**Shipped**

- **Low-stock alerts:** Email via Resend and optional Web Push (`ClinicWebPushSubscription`), with 24h cooldown only after a notification channel succeeds.
- **Auto-deduct:** Completing a visit linked to an appointment/procedure deducts `consumePerVisit` from matching active stock items and stamps `inventoryConsumedAt` for idempotency.
- **Barcode:** `barcode` field, browser `BarcodeDetector` scanning helper, and `GET /api/clinic/inventory/lookup?q=` for barcode/SKU/name lookup.
- **Purchase orders:** PO header/lines, list/new/detail UI, receive flow, atomic stock `RECEIPT` movements, and status transitions.
- **Auth/deploy support:** Case-insensitive login lookup, fallback tenant from active membership, safer DB-unreachable login error, and `scripts/list-users.ts` for DB sanity checks.

**Hardening**

- Invalid visit statuses now return `400` instead of defaulting to completed.
- Stock mutations use atomic increment/decrement updates to avoid stale read/write races.
- Visit edit flow claims `inventoryConsumedAt` before deduction to prevent double consumption under repeated PATCHes.
- Barcode camera streams are stopped on unmount; push enable reuses existing browser subscriptions.

**Validation**

- `npm run type-check`
- `npm test -- --run`
- IDE lints on touched files: clean

**Operational**

- Run `npx prisma db push` on the target database.
- Production must set a working `VISIONDRIVE_DATABASE_URL` and stable `JWT_SECRET`; optional alert env is documented in `.env.example`.

---

## Chunk 9 — 2026-04-26 (RU locale + clinic finance)

**Shipped**

- **Locale:** Practice OS active secondary locale changed from Arabic to Russian (`ru`), including shell language toggle, page date formatting, brand slogan, and high-traffic clinic strings.
- **Navigation:** New **Finance** sidebar tab at `/clinic/finance`.
- **API:** `GET /api/clinic/finance/overview` calculates tenant-scoped paid revenue, refunds, net revenue, pending revenue, expenses, profit, and margin.
- **API:** `GET/POST /api/clinic/finance/expenses` lists and records tenant-scoped expenses using the existing `Expense` ledger.
- **UI:** Finance page with current month / last 30 days filters, KPI cards, expense category breakdown, recent expenses, and expense entry form.

**Design decision**

- Reused the existing `expenses` table and `ExpenseCategory` enum instead of adding a separate clinic expense model. This keeps practice profitability and portal finance on one ledger while remaining tenant-scoped.

**Validation**

- `npm run type-check`
- `npm test`
- `npm run build`

**Operational**

- No schema push required for this chunk.

---

## Chunk 10 — 2026-04-26 (appointments command center)

**Shipped**

- **Schema:** `ClinicAppointmentStatus` now includes `CONFIRMED` and `ARRIVED`; `ClinicProcedure` and `ClinicAppointment` support `bufferAfterMinutes`; appointments gain lifecycle timestamps and `source`.
- **History:** `ClinicAppointmentEvent` records created/updated/rescheduled/status/reminder/visit/payment/follow-up events.
- **Conflict safety:** Appointment create/update APIs block overlapping active appointments using service duration plus hidden buffer time.
- **Calendar:** `/clinic/appointments` now has day agenda, week, and month modes; active-only filtering; month-day click into agenda; visible technical-break/buffer hints.
- **Drawer:** Right-side appointment drawer shows schedule, patient context, payment snapshot, visit snapshot, quick statuses, WhatsApp reminder action, follow-up shortcuts, and appointment history.
- **Solo flow:** Start/complete visit from the drawer; completion updates appointment status and preserves inventory auto-consumption behavior.

**Validation**

- Added focused tests for appointment buffer/range helpers.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 11 — 2026-04-26 (availability + knowledge base)

**Shipped**

- **Schema:** `ClinicAvailabilityRule` for working hours, slot interval, and minimum lead time; `ClinicBlockedTime` for lunch/private/leave/training blocks.
- **Availability engine:** `lib/clinic/availability.ts` generates bookable slots from working hours, blocked time, existing appointments, service duration, and hidden buffers.
- **API:** `GET/PATCH /api/clinic/availability`; `GET /api/clinic/availability/slots`; `GET/POST /api/clinic/blocked-times`; `DELETE /api/clinic/blocked-times/[id]`.
- **UI:** `/clinic/appointments/availability` manages working hours, blocked time, and previews available slots.
- **Knowledge base:** New `/clinic/knowledge-base` panel tab populated with Practice OS articles in EN/RU: appointments, availability, patients, photos/PDF, inventory, purchase orders, finance, and reminders.

**Validation**

- Added focused availability helper tests.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 12 — 2026-04-26 (conflict-safe scheduling completion)

**Shipped**

- **Schema:** `ClinicAppointment.overrideReason` stores why staff intentionally booked through a scheduling rule.
- **Scheduling guard:** Appointment create/reschedule now checks existing appointment overlap, blocked time, working hours, and minimum lead time.
- **Override rule:** Staff can override only with `allowConflictOverride=true` plus a non-empty reason; otherwise the API returns `409` with conflict details.
- **UI:** Appointment create/edit pages expose an override checkbox + reason field; the appointment drawer shows stored override reason.

**Validation**

- Added focused tests for blocked-time conflict, outside-hours conflict, and override reason enforcement.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 13 — 2026-04-26 (client reminders + portal polish)

**Shipped**

- **Schema:** `ClinicReminderTemplate` and `ClinicReminderDelivery` for WhatsApp-first reminders, no-show follow-ups, and rebooking nudges.
- **Templates:** `/clinic/reminders` lets staff edit reminder templates with variables: `{{firstName}}`, `{{lastName}}`, `{{service}}`, `{{date}}`, `{{time}}`.
- **Delivery log:** Reminder records store schedule time, rendered body, status, generated WhatsApp URL, and missing-phone errors.
- **Runner:** `GET/POST /api/clinic/reminders/run` prepares due scheduled reminders; cron can use `CRON_SECRET`.
- **Appointment drawer:** Send WhatsApp now, schedule 24h reminder, and prepare no-show follow-up from the appointment.
- **UI polish:** Clinic shell and dashboard now use responsive glass/gradient styling, stronger mobile/iPad touch targets, wider desktop canvas, and clearer primary actions.

**Validation**

- Added focused reminder template/scheduling/WhatsApp URL tests.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 14 — 2026-04-26 (private public-booking link)

**Shipped**

- **Public route:** `/book/[tenant-slug]` provides a mobile-first private booking page outside the staff panel.
- **Public API:** `GET/POST /api/clinic/public-booking/[slug]` exposes active services, generated availability slots, and online appointment creation.
- **On/off control:** public booking is disabled by default and controlled from the dashboard via `tenant_settings.thresholds.publicBooking.enabled`.
- **Flow:** Client chooses service, picks an available slot, enters name/DOB/contact/notes, accepts consent, and receives confirmation.
- **Safety:** Booking creation uses the same scheduling guard (appointments, buffers, blocked time, working hours, minimum lead time). No public override is allowed.
- **Records:** Public bookings create/reuse a patient, create an `ONLINE` appointment, store consent/notes in event/internal notes, and schedule a 24h WhatsApp reminder.
- **Panel:** Dashboard exposes the private booking link; Knowledge Base explains how to share it.

**Validation**

- Added focused tests for public booking input normalization/validation.
- No schema change in this chunk.

---

## Chunk 15 — 2026-04-26 (service-specific availability)

**Shipped**

- **Schema:** `ClinicAvailabilityRule.procedureId` supports optional service-specific working-hour overrides.
- **Engine:** Slot generation falls back to general rules, but uses procedure-specific rules for a day when they exist.
- **Slot modes:** `FIXED` keeps fixed interval slots; `DYNAMIC` spaces slots by selected service duration plus buffer for tighter packing.
- **Scheduling guard:** Manual create/edit, public booking, and follow-up creation now validate against the selected procedure's availability rules.
- **UI:** `/clinic/appointments/availability` can add/remove service-specific rules, choose fixed/dynamic slot mode, and preview slots for a selected service.

**Validation**

- Added focused tests for procedure-specific slot generation, dynamic slot mode, and scheduling guard behavior.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 16 — 2026-04-27 (follow-up automation)

**Shipped**

- **Drawer:** Appointment drawer now has a Follow-up automation panel with 2/4/6/8 week repeat booking shortcuts and matching rebooking reminder shortcuts.
- **Rebooking guard:** `schedule_rebooking_follow_up` only schedules a WhatsApp nudge when the patient has no future scheduled/confirmed/arrived appointment.
- **Runner safety:** Due rebooking reminders are skipped if the patient books a future appointment after the reminder was scheduled.
- **Knowledge Base:** Reminder/follow-up article now explains repeat bookings and rebooking nudges in EN/RU.

**Validation**

- Added focused helper tests for follow-up week normalization and reminder scheduling dates.
- No schema change in this chunk.

---

## Chunk 17 — 2026-04-27 (reviews and reputation)

**Shipped**

- **Schema:** `ClinicPatientReview` stores internal review workflow state, rating, private note, candidate public text, and request/reply/publish timestamps.
- **Templates:** reminder templates now include `REVIEW_REQUEST` WhatsApp copy.
- **Appointment drawer:** completed appointments can prepare a WhatsApp review request and create a tracked review row.
- **Reputation tab:** `/clinic/reputation` lists requested/replied/published reviews, average rating, WhatsApp links, and editable rating/notes.
- **Knowledge Base:** added EN/RU guidance for collecting reviews before publishing.

**Validation**

- Added focused helper tests for rating/status normalization and average rating.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 18 — 2026-04-27 (client categories and tags)

**Shipped**

- **Schema:** `ClinicPatient.category` and `ClinicPatient.tags` store client segmentation directly on the patient.
- **Helpers:** category/tag normalization keeps a controlled solo-practice vocabulary: VIP, regular, new, sensitive, high-risk, follow-up due, late payer.
- **API:** patient list supports `?category=` and `?tag=` filters; create/edit persists category and tags.
- **UI:** patient create/edit forms can assign category/tags; patient list and appointment drawer show segmentation chips.
- **Knowledge Base:** added EN/RU guidance for using client categories and tags.

**Validation**

- Added focused helper tests for category/tag normalization.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 6 — 2026-04-23 (patient summary PDF)

**Shipped**

- **`GET /api/clinic/patients/[id]/summary-pdf`** — authenticated, tenant-scoped; `application/pdf` attachment.
- **Content:** practice name, patient demographics, anamnesis v1, upcoming scheduled appointments, past appointment rows (date + procedure/title label only), visit dates (no chief complaint / staff notes / `nextSteps`).
- **Lib:** `lib/clinic/patient-summary-pdf.ts` (jsPDF, matches smart-kitchen stack) + Vitest (PDF magic bytes).
- **UI:** Patient record header — download link + hint (EN/AR).
- **E2E:** `npm run test:clinic-flow` asserts PDF response.

**Operational**

- No schema change.

---

## Chunk 7 — 2026-04-23 (inventory)

**Shipped**

- **Schema:** `ClinicStockItem`, `ClinicStockMovement`, `ClinicStockMovementType`; `Tenant` + optional `ClinicProcedure` relations.
- **API:** `GET/POST /api/clinic/inventory`; `GET/PATCH /api/clinic/inventory/[id]`; `GET/POST .../movements`; stats gain **`lowStockCount`**.
- **UI:** `/clinic/inventory` (filters: low-stock, inactive), `/clinic/inventory/new`, `/clinic/inventory/[id]` (movements + edit); nav + dashboard card (amber when count &gt; 0); quick action **Add stock item**.
- **i18n:** EN/AR inventory strings.
- **Lib:** `lib/clinic/inventory.ts` (`isClinicStockLow`) + Vitest.
- **E2E:** `test:clinic-flow` step 15 — create item, consumption, low-stock list.

**Operational**

- `npx prisma db push` after pull.
