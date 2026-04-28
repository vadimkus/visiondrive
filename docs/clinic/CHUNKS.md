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

## Chunk 19 — 2026-04-27 (client balance and debt)

**Shipped**

- **Helper:** `lib/clinic/client-balance.ts` computes patient balance from existing rows without a schema change.
- **Rules:** `ARRIVED`/`COMPLETED` appointment procedure prices are expected charges; linked `PAID`/`REFUNDED`/`PENDING` payments adjust due and credit; standalone paid payments count as deposits/credit.
- **API:** patient list, patient detail, and appointment detail now include computed `clientBalance`.
- **UI:** patient list shows debt/credit/clear chips; patient chart and payments tab show a balance summary card; appointment drawer shows global client balance next to the current appointment payment snapshot.

**Validation**

- Added focused helper tests for debt, clear balance, credit, pending payment, and billable appointment filtering.
- No schema change in this chunk.

---

## Chunk 20 — 2026-04-27 (prepaid treatment packages)

**Shipped**

- **Schema:** `ClinicPatientPackage` stores prepaid course/package state; `ClinicPackageRedemption` stores visit-linked session usage.
- **Helpers:** `lib/clinic/patient-packages.ts` normalizes package input, identifies package-sale payments, and auto-deducts one eligible session on completed visits.
- **API:** `GET/POST /api/clinic/patients/[id]/packages` lists and sells patient packages; patient detail includes packages and redemption history.
- **Automation:** appointment completion and direct visit completion now create package redemption events when a matching active package exists.
- **UI:** patient chart has a Packages tab with sale form, service restriction, expiry, remaining-session cards, redemption history, and one-session-left warning.
- **Finance safety:** package-sale payments are excluded from client balance deposit credit to avoid double-counting prepaid revenue.

**Validation**

- Added focused helper tests for package normalization, package payment references, and status derivation.
- `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build` pass. Existing unrelated lint/build warnings remain.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 21 — 2026-04-27 (home visit route and travel buffer)

**Shipped**

- **Schema:** patient records now store default `homeAddress`, `area`, and `accessNotes`; appointments snapshot `locationAddress`, `locationArea`, `locationNotes`, `travelBufferBeforeMinutes`, and `travelBufferAfterMinutes`.
- **Scheduling:** travel buffers expand the occupied appointment window before/after the clinical slot, so route time participates in conflict, blocked-time, and working-hours checks.
- **API:** patient create/edit and appointment create/edit persist home-visit location fields. New appointments default to the patient address when no appointment-specific location is provided.
- **UI:** patient create/edit supports home address, area, and parking/access notes; appointment create/edit supports visit location and travel buffers.
- **Day route:** Day view on `/clinic/appointments` now shows an ordered home-visit route card with map links and travel buffer context.
- **Drawer:** appointment drawer shows visit location and travel buffers beside the appointment details.

**Validation**

- Added helper test coverage for travel buffer normalization and occupied-window calculation.
- `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build` pass. Existing unrelated lint/build warnings remain.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 22 — 2026-04-27 (consent and contraindication forms)

**Shipped**

- **Schema:** added `ClinicConsentTemplate` and `ClinicConsentRecord` with tenant scope, optional procedure/visit/appointment links, contraindication arrays, signature name, accepted timestamp, and aftercare acknowledgement.
- **API:** `GET/POST /api/clinic/consents/templates` for reusable templates; `GET/POST /api/clinic/patients/[id]/consents` for signed patient consent records.
- **UI:** patient record now has a Consents tab for creating templates, reviewing contraindications, signing consent, linking to visits, and viewing immutable patient-safe snapshots.
- **i18n/Knowledge Base:** EN/RU strings and a Knowledge Base article for consent and contraindication workflows.
- **Lib:** `lib/clinic/consents.ts` normalizes consent text, contraindications, accepted timestamps, and signed snapshots.

**Validation**

- Added Vitest coverage for consent helper normalization and snapshot logic.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 23 — 2026-04-27 (inline payments and receipts)

**Shipped**

- **Schema:** `ClinicPatientPayment` now supports optional `appointmentId`, `discountCents`, and `feeCents` in addition to existing visit links.
- **Balance math:** client balance includes appointment-linked payments, deduplicates visit+appointment linked rows, reduces expected charge by discounts, and increases expected charge by patient-facing fees.
- **API:** payment creation accepts appointment links, discounts, fees, method/status/reference/note; `PATCH /api/clinic/patients/[id]/payments/[paymentId]` marks payments refunded or void; `GET .../receipt` exports a receipt PDF.
- **UI:** appointment drawer payment snapshot now records payment inline, shows payment history, downloads receipts, and exposes refund/void actions.
- **i18n/Knowledge Base:** EN/RU strings and a Knowledge Base article for closing visits with payment and receipt.
- **Lib:** `lib/clinic/payment-receipt-pdf.ts` builds patient-safe receipt PDFs.

**Validation**

- Added Vitest coverage for receipt PDF generation and discount/fee balance math.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 24 — 2026-04-27 (treatment plans)

**Shipped**

- **Schema:** added `ClinicTreatmentPlan` and `ClinicTreatmentPlanStatus`; `ClinicVisit` now has optional `treatmentPlanId`.
- **API:** `GET/POST /api/clinic/patients/[id]/treatment-plans` creates/list planned care courses; `PATCH .../treatment-plans/[planId]` updates status and plan details; visit create/update accepts `treatmentPlanId`.
- **UI:** patient record now has a Treatment plans tab with expected sessions, cadence, target dates, service restriction, goals, next steps, photo milestones, status actions, linked visits, and progress from completed visits.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article for treatment-plan workflows.
- **Lib:** `lib/clinic/treatment-plans.ts` normalizes sessions, cadence, statuses, photo milestones, and progress.

**Validation**

- Added Vitest coverage for treatment-plan helper normalization and progress logic.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 25 — 2026-04-27 (notification center)

**Shipped**

- **API:** `GET /api/clinic/inbox` aggregates live operational items from reminders, online bookings, reschedule events, review requests, billable appointments/payments, and inventory.
- **UI:** `/clinic/inbox` shows totals, severity counts, filters by item type, localized item labels, and action links to the source workflow.
- **Navigation:** added Inbox to the clinic shell.
- **i18n/Knowledge Base:** EN/RU strings and a Knowledge Base article for the daily notification-center workflow.
- **Lib:** `lib/clinic/notification-center.ts` handles due calculation, severity sorting, and summary counters.

**Validation**

- Added Vitest coverage for notification summary/sorting and unpaid appointment due math.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 26 — 2026-04-27 (procedure bill of materials)

**Shipped**

- **Schema:** added `ClinicProcedureMaterial` linking procedure + stock item with quantity per visit, unit cost, active flag, note, and sort order.
- **API:** `GET/POST /api/clinic/procedures/[id]/materials` and `PATCH/DELETE .../materials/[materialId]` manage BOM rows.
- **Inventory deduction:** completed linked visits now deduct all active BOM rows when configured; legacy `ClinicStockItem.procedureId + consumePerVisit` remains as fallback for procedures without BOM rows.
- **UI:** procedure catalog now shows material cost per procedure and an inline BOM editor for adding/removing consumables.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article for procedure materials.
- **Lib:** `lib/clinic/procedure-materials.ts` normalizes material quantities/costs and computes material cost.

**Validation**

- Added Vitest coverage for procedure-material helper normalization and cost math.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 27 — 2026-04-27 (stock-taking and variance)

**Shipped**

- **Schema:** added `ClinicStockCountSession`, `ClinicStockCountLine`, `ClinicStockCountStatus`, and `ClinicStockVarianceReason` for physical inventory count sessions.
- **API:** `GET/POST /api/clinic/stock-takes`, `GET/PATCH .../[id]`, `PATCH .../lines/[lineId]`, and `POST .../finalize` create count sessions, save counted quantities/reasons, and finalize variances.
- **Inventory audit:** finalization creates `ADJUSTMENT` stock movements with stock-count references and sets each item on-hand to the physical count.
- **UI/navigation:** added Stock-taking navigation, list/create screen, detail count screen, variance reason workflow, and Inventory shortcut.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article for monthly physical counts and variance adjustment.
- **Lib:** `lib/clinic/stock-taking.ts` normalizes counted quantities, variance reasons, and variance math.

**Validation**

- Added Vitest coverage for stock-taking helper normalization and variance calculation.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 28 — 2026-04-27 (product sales from visit)

**Shipped**

- **Schema:** added `ClinicProductSale` and `ClinicProductSaleLine` for aftercare/retail products sold to patients from a visit.
- **API:** `GET/POST /api/clinic/patients/[id]/product-sales` lists and records product sales with patient, visit, appointment, payment, and stock line context.
- **Inventory/revenue:** recording a sale deducts stock through `CONSUMPTION` movements and creates a `PRODUCT_SALE:*` payment row for finance revenue.
- **Balance safety:** product-sale payments are excluded from client balance/deposit credit, like package-sale payments, so retail revenue does not distort treatment debt.
- **UI:** appointment drawer has a Product sales block after visit start/completion; patient Payments tab shows retail sales history.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article for selling aftercare products from visits.
- **Lib:** `lib/clinic/product-sales.ts` normalizes quantities/prices, totals, and product-sale payment references.

**Validation**

- Added Vitest coverage for product-sale helper calculations and client-balance exclusion.
- Run `npm run db:generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 29 — 2026-04-27 (P&L v2 and procedure profitability)

**Shipped**

- **Helper:** `lib/clinic/profitability.ts` calculates material cost per visit, deduped payment net totals, and procedure-level profit/margin/profit-per-hour rows.
- **API:** `GET /api/clinic/finance/overview` now returns product-sale revenue, direct material/product costs, gross profit, operating expenses, operating profit, completed visit count, and procedure profitability.
- **UI:** `/clinic/finance` has a P&L v2 block with gross profit, direct costs, product sales revenue/cost, operating profit, and a procedure profitability table.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article now explain true profitability instead of only top-line revenue.
- **Docs/canvas:** Altegio backlog and canvas mark Point 19 as shipped and move the next recommendation to retention analytics.

**Validation**

- Added Vitest coverage for profitability helper calculations.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 30 — 2026-04-27 (mobile patient photos and SEO/LLM files)

**Shipped**

- **Patient photos:** Photos tab now separates iPhone/iPad camera capture from existing photo/file attachment, supports captions, visit links, and before/after/other type.
- **Delete flow:** `DELETE /api/clinic/media/[id]` removes tenant-scoped private media and best-effort deletes Vercel Blob storage when used.
- **UI/Knowledge Base:** photo cards show captions and delete controls; EN/RU Knowledge Base explains mobile capture and deleting mistakes.
- **SEO privacy:** robots now blocks private `/clinic`, `/book`, `/portal`, `/login`, and `/api` routes from indexing.
- **LLM files:** `llms.txt` and `llms-full.txt` now describe Practice OS as the primary VisionDrive product and keep Smart Kitchen as secondary/legacy context.
- **Structured data:** public layout includes `PracticeSoftwareSchema` JSON-LD for VisionDrive Practice OS.

**Validation**

- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 31 — 2026-04-27 (retention analytics)

**Shipped**

- **Helper:** `lib/clinic/retention.ts` derives rebook rate, returning-client rate, no-show rate, lost patients, follow-up conversion, and repeat intervals.
- **API:** `GET /api/clinic/retention/overview` aggregates appointment and rebooking reminder data into a retention report.
- **UI/navigation:** added `/clinic/retention` and a Retention nav item with KPI cards, procedure repeat interval table, lost-patient list, chart links, and WhatsApp reactivation actions.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article explain the retention workflow.
- **Docs/canvas:** Altegio backlog and canvas mark Point 20 as shipped and move the next recommendation to booking funnel analytics.

**Validation**

- Added Vitest coverage for retention summary, repeat intervals, and follow-up conversion.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 32 — 2026-04-27 (booking funnel analytics)

**Shipped**

- **Schema:** added `ClinicBookingFunnelEvent` and `ClinicBookingFunnelEventType` for anonymous public booking step events.
- **Public tracking:** `/book/[slug]` now records link view, service selected, slot selected, form started, form submitted, and booking completed events through `POST /api/clinic/public-booking/[slug]/funnel`.
- **Helper/API:** `lib/clinic/booking-funnel.ts` summarizes unique sessions, stage conversion/drop-off, and conversion by procedure; `GET /api/clinic/booking-funnel/overview` exposes the staff report.
- **UI/navigation:** added `/clinic/booking-funnel` with KPI cards, stage conversion table, procedure conversion table, and recent daily view/booking cards.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article explain how to read the booking funnel.
- **Docs/canvas:** Altegio backlog and canvas mark Point 21 as shipped and move the next recommendation to patient portal lite.

**Validation**

- Added Vitest coverage for booking funnel stage and procedure summaries.
- Run `npm run db:generate`, `npm run db:push`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 33 — 2026-04-27 (patient portal lite)

**Shipped**

- **Schema:** added `ClinicPatientPortalLink`, `ClinicPatientPortalRequest`, request type/status enums, and tenant/patient/appointment/user relations.
- **Security:** portal links store only SHA-256 token hashes plus last-four metadata; creating a new link revokes existing active links and sets a 90-day expiry.
- **Staff controls:** patient chart now includes a Patient portal lite card to create/copy/revoke the private link and review recent portal requests.
- **Public portal:** `/patient-portal/[token]` shows upcoming appointments, location notes, aftercare/next steps, package balances, payment receipts, active treatment plans, and accepted consent titles.
- **Requests:** patients can request reschedule/cancellation from the portal; requests create structured portal rows, CRM notes, and appointment events for staff review without changing the appointment automatically.
- **Receipts:** active portal tokens can download patient-safe receipt PDFs for that patient's payments.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article explain secure sharing and request handling.
- **Docs/canvas:** Altegio backlog and canvas mark Point 22 as shipped and move the next recommendation to custom intake fields per service.

**Validation**

- Added Vitest coverage for patient portal token hashing, expiry, active-state, and request normalization.
- Run `npm run db:generate`, `npm run db:push`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 34 — 2026-04-27 (service-specific public intake fields)

**Shipped**

- **Schema:** added `ClinicIntakeQuestion`, `ClinicIntakeResponse`, and `ClinicIntakeQuestionType` for procedure-specific public booking questions and appointment-linked answer snapshots.
- **Staff controls:** procedure catalog now includes Public intake questions per service with short text, long text, and yes/no question types plus required flags.
- **Public booking:** `/book/[slug]` displays active questions for the selected service and sends answers with the booking request.
- **Booking safety:** public booking validates required intake answers server-side, stores answers in `clinic_intake_responses`, and adds a staff-only intake summary to appointment internal notes.
- **i18n/Knowledge Base:** EN/RU copy and a Knowledge Base article explain how to configure and use service-specific intake questions.
- **Docs/canvas:** Altegio backlog and canvas mark Point 23 as shipped and move the next recommendation to client import from Excel.

**Validation**

- Added Vitest coverage for intake question type/answer normalization, required-answer validation, and staff note generation.
- Run `npm run db:generate`, `npm run db:push`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Run `npm run db:push` against the target database before production use because this chunk changes schema.

---

## Chunk 35 — 2026-04-27 (client import from Excel)

**Shipped**

- **Dependency:** added `read-excel-file` for `.xlsx` parsing; CSV is parsed natively.
- **Helper/API:** `lib/clinic/patient-import.ts` maps common EN/RU spreadsheet headers into patient fields, validates required name/DOB/contact, normalizes categories/tags, and flags file/existing duplicates by email or phone. `POST /api/clinic/patients/import` supports upload preview and JSON commit.
- **UI:** added `/clinic/patients/import` plus a Patients page action. Staff can upload `.xlsx`/`.csv`, preview invalid/duplicate rows, and create only clean patient cards.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article explain the client import workflow.
- **Docs/canvas:** Altegio backlog and canvas mark Point 24 as shipped and move the next recommendation to product import from Excel.

**Validation**

- Added Vitest coverage for date parsing, header mapping, duplicate detection, and import summaries.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 36 — 2026-04-27 (product import from Excel)

**Shipped**

- **Helper/API:** `lib/clinic/product-import.ts` maps common EN/RU stock spreadsheet headers into inventory fields, validates required name/unit and linked procedure names, preserves supplier/unit-cost context in notes, and flags barcode/SKU/name duplicates. `POST /api/clinic/inventory/import` supports upload preview and JSON commit.
- **UI:** added `/clinic/inventory/import` plus an Inventory page action. Staff can upload `.xlsx`/`.csv`, preview invalid/duplicate rows, and create only clean stock items.
- **Inventory effects:** imported opening quantities create receipt movements and set `quantityOnHand`; reorder points, barcodes, SKU, unit, consume-per-visit, notes, and procedure links are stored on `ClinicStockItem`.
- **i18n/Knowledge Base:** EN/RU strings and Knowledge Base article explain the product import workflow.
- **Docs/canvas:** Altegio backlog and canvas mark Point 25 as shipped and move the next recommendation to supplier profiles.

**Validation**

- Added Vitest coverage for product import header mapping, procedure matching, duplicate detection, and import summaries.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 37 — 2026-04-27 (supplier profiles and settlement history)

**Shipped**

- **Schema:** `ClinicSupplier` and `ClinicSupplierSettlement`; purchase orders now support optional `supplierId` while keeping `supplierName` as a snapshot for older/free-text orders.
- **API:** `GET/POST /api/clinic/suppliers`, `GET/PATCH /api/clinic/suppliers/[id]`, and `POST .../settlements`; supplier creation links existing purchase orders with a matching supplier name.
- **UI:** `/clinic/suppliers` creates and lists supplier profiles; `/clinic/suppliers/[id]` shows contact details, purchase history, settlement history, received value, paid amount, and unpaid supplier balance.
- **Purchase orders:** new purchase orders can choose an existing supplier profile; PO detail links back to the supplier profile.
- **i18n/Knowledge Base:** EN/RU strings and article explain supplier profiles, settlements, and unpaid stock costs.

**Validation**

- Added Vitest coverage for supplier settlement summaries and payable cost calculations.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Schema change: run `npx prisma db push` on target databases after pull.

---

## Chunk 38 — 2026-04-27 (payment fee rules)

**Shipped**

- **Schema:** `ClinicPaymentFeeRule` stores tenant method-level acquiring rules; `ClinicPatientPayment.processorFeeCents` snapshots the internal processing fee separately from patient-facing `feeCents`.
- **API:** `GET/PATCH /api/clinic/payment-fee-rules`; payment, product-sale, and package-sale creation now calculate processor fees for new paid payments.
- **Finance:** P&L v2 subtracts payment processing fees from direct costs, gross profit, operating profit, and procedure profitability.
- **UI:** Finance page can configure percent/fixed fee rules for Cash, Card, Transfer, POS, Stripe, and Other. Payment history shows stored processing fees where present.
- **i18n/Knowledge Base:** EN/RU strings and article explain that processor fees are internal costs and do not increase patient balance.

**Validation**

- Added Vitest coverage for payment fee rule normalization and fee calculations.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Schema change: run `npx prisma db push` on target databases after pull.

---

## Chunk 39 — 2026-04-27 (daily close)

**Shipped**

- **Schema:** `ClinicDailyClose` stores one reconciliation snapshot per tenant business date with draft/finalized status.
- **Helper:** `lib/clinic/daily-close.ts` calculates net expected totals by payment method, pending/refunded totals, processor fees, and counted-vs-expected discrepancies.
- **API:** `GET/POST /api/clinic/daily-close` previews a day from payment rows, saves draft counted totals, and finalizes a day once reconciled.
- **UI:** Finance page now has a Daily close panel with date selector, method-level counted inputs, discrepancy summary, close notes, recent closes, and finalize action.
- **i18n/Knowledge Base:** EN/RU strings and article explain how to close the day and document discrepancies.

**Validation**

- Added Vitest coverage for daily close date parsing and reconciliation math.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Schema change: run `npx prisma db push` on target databases after pull.

---

## Chunk 40 — 2026-04-27 (refund and correction workflow)

**Shipped**

- **Schema:** `ClinicPaymentCorrection` records required-reason refund/void corrections linked to the original payment and optional refund adjustment payment.
- **Ledger behavior:** refunds preserve the original paid row and create separate `REFUNDED` adjustment payment rows with `REFUND:<originalPaymentId>` references; partial refunds are supported until the remaining refundable amount reaches zero.
- **API:** `PATCH /api/clinic/patients/[id]/payments/[paymentId]` now validates correction reason, refund amount, refund method, and void eligibility; full product-sale refunds/voids update linked product-sale payment status.
- **UI:** Appointment drawer and patient Payments tab prompt for refund/void reason, prompt for refund amount, show remaining refundable amount, and display correction history.
- **i18n/Knowledge Base:** EN/RU strings and article explain corrections, refund adjustment rows, and void rules.

**Validation**

- Added Vitest coverage for refund reference detection, reason/amount normalization, refundable amount calculation, and void eligibility.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Schema change: run `npx prisma db push` on target databases after pull.

---

## Chunk 41 — 2026-04-28 (patient data export and deletion tools)

**Shipped**

- **Helper:** `lib/clinic/data-export.ts` centralizes safe export filenames, patient delete confirmation phrases, and media binary stripping for JSON archives.
- **API:** `GET /api/clinic/patients/[id]/export` returns a tenant-scoped full JSON archive with patient demographics, appointments, visits, clinical text, payments/corrections, product sales, packages, consent records, treatment plans, portal links/requests, reviews, CRM activities, intake responses, and media metadata.
- **Deletion:** `DELETE /api/clinic/patients/[id]` requires the exact typed phrase `DELETE Last First`, hard-deletes the patient and linked rows through existing cascade relations, and performs best-effort cleanup of private Vercel Blob media.
- **UI:** patient record header now offers patient-safe PDF, full internal JSON export, and guarded record deletion.
- **i18n/Knowledge Base:** EN/RU strings and article explain export scope, media handling, and irreversible deletion.

**Validation**

- Added Vitest coverage for data export helper behavior.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 42 — 2026-04-28 (dormant patient reactivation)

**Shipped**

- **Helper:** `lib/clinic/reactivation.ts` normalizes 60/90/120-day dormant thresholds, localizes EN/RU reactivation messages, and builds WhatsApp deep links.
- **API:** `GET /api/clinic/retention/overview` now accepts `lostAfterDays=60|90|120` and `locale=en|ru`, and returns message previews plus WhatsApp links for dormant patients.
- **UI:** `/clinic/retention` now has 60/90/120 dormant filters, localized message preview, copy-message action, WhatsApp open action, missing-phone state, and patient-chart links.
- **i18n/Knowledge Base:** EN/RU strings and article guidance explain how to use dormant reactivation without sounding pushy.
- **Docs/canvas:** Altegio backlog and canvas mark dormant reactivation shipped and move the next recommendation to booking source/UTM attribution and abandoned-booking follow-up.

**Validation**

- Added Vitest coverage for reactivation threshold normalization, localized messages, and WhatsApp link creation.
- Run `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No schema change.

---

## Chunk 43 — 2026-04-28 (booking source attribution and abandoned follow-up)

**Shipped**

- **Helper:** `lib/clinic/booking-funnel.ts` now derives source labels from UTM/source/ref metadata, summarizes source conversion, finds abandoned sessions, and builds localized EN/RU follow-up messages.
- **Tracking:** public booking captures `source`, `utm_source`, `utm_medium`, `utm_campaign`, and `ref` from shared links into funnel event metadata; submitted forms store minimal contact metadata for recovery only.
- **API:** `GET /api/clinic/booking-funnel/overview` now accepts `locale=en|ru` and returns source conversion plus abandoned sessions with message previews and WhatsApp deep links.
- **UI:** `/clinic/booking-funnel` now shows conversion by source, abandoned booking cards, copy-message actions, WhatsApp open actions, locale-aware numbers, and no hardcoded English in the new panel.
- **Portal UI:** post-login clinic shell now uses a VD mark, simplified solo-practitioner slogan, and dashboard copy focused on one-person practices.
- **i18n/Knowledge Base:** EN/RU strings and booking-funnel article explain source tracking and abandoned-session follow-up.

**Validation**

- Added Vitest coverage for source summary, abandoned-session detection, and localized abandoned follow-up copy.
- No schema change.

---

## Chunk 44 — 2026-04-28 (birthday and occasion messages)

**Shipped**

- **Helper:** `lib/clinic/occasions.ts` normalizes 7/30/90-day windows, derives upcoming birthdays from `ClinicPatient.dateOfBirth`, handles Feb 29 birthdays in non-leap years, and builds EN/RU WhatsApp greeting copy.
- **API:** `GET /api/clinic/occasions/overview` returns tenant-scoped birthday rows, WhatsApp availability counts, message previews, and patient chart links.
- **UI:** `/clinic/occasions` adds a lightweight solo-practitioner workflow with range filters, birthday cards, copy-message action, WhatsApp open action, missing-phone state, and patient-chart links.
- **i18n/Knowledge Base:** EN/RU strings and article explain using personal occasion messages without turning them into aggressive promotions.

**Validation**

- Added Vitest coverage for range normalization, next-birthday calculation, leap-day handling, upcoming-row filtering, localized messages, and WhatsApp links.
- No schema change.

---

## Chunk 45 — 2026-04-28 (referral tracking)

**Shipped**

- **Schema:** `ClinicPatient` now stores `referredByName` and `referralNote` for lightweight word-of-mouth tracking.
- **Helper:** `lib/clinic/referrals.ts` normalizes referral fields, report ranges, source keys, and source/person summaries.
- **API:** `GET /api/clinic/referrals/overview` returns 30/90/365-day and all-time referral summaries plus recent referred patients.
- **UI:** patient create/edit forms capture referral details; `/clinic/referrals` shows source/person totals, completed-visit counts, recent referred patients, and patient-chart links.
- **i18n/Knowledge Base:** EN/RU strings and article explain referral tracking without introducing a complex points program.
- **Docs/canvas:** Altegio backlog and canvas mark referral tracking shipped and move the next recommendation to promotions/discount rules.

**Validation**

- Added Vitest coverage for referral text normalization, report ranges, source summaries, and patient-name formatting.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 46 — 2026-04-28 (promotions and discount rules)

**Shipped**

- **Schema:** `ClinicDiscountRule` stores tenant named percent/fixed discounts; visit payments and patient packages now snapshot discount rule, name, amount, and required reason.
- **Helper:** `lib/clinic/discount-rules.ts` normalizes rule inputs, calculates capped percent/fixed discounts, summarizes rules, and validates that non-zero discounts keep a reason.
- **API:** `GET/POST/PATCH /api/clinic/discount-rules`; visit payment and package-sale APIs validate discount reasons and reject unknown inactive rules.
- **UI:** Finance manages discount rules; appointment drawer and patient payment/package forms can apply a named or manual discount with required reason.
- **Finance:** P&L v2 surfaces total discounts, recent discount reasons, package discounts, and procedure-level discount impact alongside expected/net revenue.
- **i18n/Knowledge Base:** EN/RU strings and article explain using promotions sparingly while keeping margin erosion visible.

**Validation**

- Added Vitest coverage for discount normalization, capped calculations, summaries, and required-reason validation.
- Run `npx prisma generate` and `npx prisma db push` because this chunk changes schema.

---

## Chunk 47 — 2026-04-28 (gift cards)

**Shipped**

- **Schema:** `ClinicGiftCard` and `ClinicGiftCardRedemption` store prepaid voucher sales, buyer/recipient details, code, original and remaining balance, sale method/status, expiry, and redemption audit rows.
- **Helper:** `lib/clinic/gift-cards.ts` normalizes codes/amounts, generates human-readable codes, derives status, and validates active/non-expired balances before redemption.
- **API:** `GET/POST /api/clinic/gift-cards` sells/lists vouchers; `POST /api/clinic/gift-cards/redeem` decrements balance transactionally and creates a `GIFT_CARD:*` patient payment.
- **UI:** Finance sells and monitors gift cards; patient Payments tab redeems codes and shows redemption history.
- **Finance/daily close:** Finance reports sold/redeemed/outstanding gift-card balances; daily close includes gift-card sale cash by method.
- **i18n/Knowledge Base/docs:** EN/RU strings, Knowledge Base article, and architecture/data-model docs updated.

**Validation**

- Added Vitest coverage for gift-card helper normalization, references, status derivation, and redemption validation.
- Run `npx prisma generate`, `npm run type-check`, and focused clinic tests.
- Run `npx prisma db push` against the target database before production use because this chunk changes schema.

---

## Chunk 48 — 2026-04-28 (before/after photo protocol)

**Shipped**

- **Schema:** `ClinicPatientMedia` now stores capture-protocol JSON plus a marketing-consent flag/timestamp per image.
- **Helper:** `lib/clinic/photo-protocol.ts` normalizes checklist ids, marketing consent flags, compact protocol JSON, and completion counts.
- **API:** `POST /api/clinic/patients/[id]/media` accepts protocol checklist, procedure snapshot, consent note, and marketing-consent marker alongside image upload.
- **UI:** Patient Photos tab adds same-lighting/angle/distance/background/area-label checklist, procedure-aware prompt from the linked visit, consent marker, and photo-card badges for protocol completion and marketing consent.
- **i18n/Knowledge Base/docs:** EN/RU strings, Knowledge Base article, backlog/canvas, and architecture/data-model docs updated.

**Validation**

- Added Vitest coverage for photo-protocol helper normalization, consent parsing, JSON construction, and completion counts.
- Run `npx prisma generate`, `npm run type-check`, and focused photo-protocol tests.
- Run `npx prisma db push` against the target database before production use because this chunk changes schema.

---

## Chunk 49 — 2026-04-28 (voice comments)

**Shipped**

- **UI:** patient CRM tab now has a microphone control for dictating treatment comments directly into the note textarea.
- **Speech-to-text:** uses browser speech recognition with locale-aware language (`en-US` / `ru-RU`) and live interim transcript preview.
- **CRM storage:** dictated text is reviewed and saved as a normal `ClinicCrmActivity` note, so it appears in CRM history and the patient timeline without a new table.
- **i18n/Knowledge Base/docs:** EN/RU strings, Knowledge Base article, and session note added.

**Validation**

- Run `npm run type-check`.
- No schema change for voice comments.

---

## Chunk 50 — 2026-04-28 (aftercare document library)

**Shipped**

- **Schema:** `ClinicAftercareTemplate` stores procedure-specific aftercare messages plus optional document/PDF references; `ClinicVisit` snapshots selected aftercare title/text/document fields and sent timestamp.
- **Helpers:** `lib/clinic/aftercare.ts` normalizes titles/body/document URLs, renders placeholders, and builds concise WhatsApp text.
- **API:** `GET/POST /api/clinic/aftercare-templates` and `PATCH /api/clinic/aftercare-templates/[id]` manage the library; visit create/update and appointment completion can snapshot a selected template.
- **UI:** Procedures page manages aftercare templates per service; appointment drawer can choose a template while completing the visit and opens/copies WhatsApp aftercare; patient visit logging can attach a template.
- **Portal/Knowledge Base/docs:** Patient portal shows saved aftercare text and document links; EN/RU strings and Knowledge Base article added.

**Validation**

- Added Vitest coverage for aftercare rendering, URL normalization, and WhatsApp text generation.
- Run `npx prisma generate` and `npm run type-check`.
- Run `npx prisma db push` against the target database before production use because this chunk changes schema.

---

## Chunk 51 — 2026-04-28 (patient-safe exports)

**Shipped**

- **PDF:** added `GET /api/clinic/patients/[id]/patient-safe-export` for a richer patient-facing treatment export.
- **Content:** demographics/anamnesis, completed treatment summaries, aftercare text/document references, receipt summaries, and accepted consent snapshots.
- **Privacy:** internal notes, staff visit notes, CRM history, private appointment notes, photos/media, and full internal JSON data are excluded by construction.
- **UI:** patient card header now has a dedicated Patient-safe treatment export PDF action beside the minimal summary and internal JSON export.
- **i18n/Knowledge Base/docs:** EN/RU strings, Knowledge Base article, backlog, architecture, data-model, and session note updated.

**Validation**

- Added Vitest coverage for the patient-safe export PDF builder.
- Run `npm run type-check`, focused PDF tests, and `npm run lint`.
- No schema change.

---

## Chunk 52 — 2026-04-28 (account and notification preferences)

**Shipped**

- **Schema:** added `ClinicUserPreference` for tenant-scoped practitioner locale and notification preferences.
- **Account:** `/clinic/account` now saves display name, preferred EN/RU language, password changes, email/push channels, alert-type toggles, and device push subscription state.
- **Locale:** clinic shell applies the saved account language on sign-in while local storage remains the fallback.
- **Notifications:** low-stock email and browser push delivery now respects saved low-stock/channel preferences; tenants with no preference rows keep the legacy env-recipient fallback.
- **i18n/Knowledge Base/docs:** EN/RU strings, Knowledge Base article, data model, architecture, backlog, and session note updated.

**Validation**

- Added Vitest coverage for preference normalization.
- Run `npx prisma generate`, `npm run type-check`, focused preference tests, and `npm run lint`.
- Run `npx prisma db push` against the target database before production use because this chunk changes schema.

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
