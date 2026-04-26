# Clinic practice console — session changelog

**Last updated:** 2026-04-23  
**Product area:** VisionDrive **Practice console** (`/clinic`, `/api/clinic/*`)

This document records implementation work done after the baseline described in `CHUNKS.md` (chunks 1–3). Earlier chunks remain the source of truth for the initial vertical slice; **this file** is the detailed record of follow-on shipping: **full i18n sweep**, **month calendar**, **drag-to-reschedule**, and **optional Vercel Blob** for patient photos.

---

## Summary

| Area | What changed |
|------|----------------|
| **i18n** | Dashboard, account, patient chart (Overview / Photos / Payments / CRM), procedures catalog, new/edit flows, shared errors; EN + AR in `lib/clinic/strings.ts`. |
| **Appointments UI** | **Week / Month** view toggle; month grid (6×7, Monday-first); prev/next/“this month” navigation; **HTML5 drag-and-drop** to move appointments between days (PATCH `startsAt`, preserves local time-of-day). |
| **Media** | `ClinicPatientMedia`: optional **`blobPathname`** + optional **`data`** (BYTEA). If `BLOB_READ_WRITE_TOKEN` is set → new uploads use **private** Vercel Blob; else unchanged Postgres bytes. `GET /api/clinic/media/[id]` serves either source. |
| **Libraries** | `lib/clinic/week.ts` — month helpers; `lib/clinic/appointment-dnd.ts` — DnD MIME + reschedule time math; Vitest coverage extended. |
| **Dependencies** | `@vercel/blob` (v2.x) for optional object storage. |

---

## 1. Internationalization (English / Arabic)

**Source of truth:** `lib/clinic/strings.ts` — keys added for dashboard copy, account (profile/password), patient record forms and labels, procedures table, appointment create/edit, shared errors (`failedToLoad`, `saveFailed`, `invalidDateTime`, `serverErrorWithCode`, saving/updating ellipses, payment/CRM enums, month/week UI, etc.).

**UI wired to `useClinicLocale()` / `t.*`:**

- `app/clinic/page.tsx` — dashboard intro, stats labels, quick actions, docs line.
- `app/clinic/account/page.tsx` — full page; `ClinicSpinner`; profile + password forms; aria-labels for password visibility toggles.
- `app/clinic/patients/[id]/PatientRecordClient.tsx` — Overview (contact, edit patient, log visit, recent appointments), Photos, Payments, CRM; locale-aware `toLocaleString` / `toLocaleDateString` via `dateLocale` (`en-GB` vs `ar-AE`).
- `app/clinic/patients/page.tsx` — load error copy.
- `app/clinic/patients/new/page.tsx` — form labels and actions.
- `app/clinic/procedures/page.tsx` — table headers, empty state, `ClinicSpinner`.
- `app/clinic/procedures/new/page.tsx` — form + price hint with `{currency}` placeholder.
- `app/clinic/appointments/page.tsx` — week/month chrome, DnD-related strings, empty state (week view).
- `app/clinic/appointments/new/page.tsx` — meta load spinner, form, “add patient first” banner.
- `app/clinic/appointments/[id]/page.tsx` — status options, field labels, save state, patient link.

**Arabic copy** lives alongside English in `strings.ts` under the `ar` table; RTL continues to be driven by the existing clinic layout/locale provider.

---

## 2. Appointments: month view and drag-to-reschedule

### Month calendar

- **Helpers:** `startOfMonth`, `addMonths`, `isSameLocalMonth`, `monthGridFrom` in `lib/clinic/week.ts` (42 cells, Monday-first, covering the displayed month).
- **Page:** `app/clinic/appointments/page.tsx` — segmented **Week | Month** control; month navigation; fetches `from` / `to` as `[startOfMonth, startOfNextMonth)` when in month mode.
- **Density:** Up to **3** appointments shown per day cell; overflow as `moreAppointments` (`+{count} more` / Arabic equivalent).

### Drag-and-drop reschedule

- **Payload:** `application/x-visiondrive-clinic-appointment` JSON: `{ id, startsAt }` (`lib/clinic/appointment-dnd.ts`).
- **Behavior:** On drop, **`rescheduleStartsAtPreserveClock`** sets the target **calendar day** while keeping **local hours/minutes/seconds** from the original slot; then **`PATCH /api/clinic/appointments/[id]`** with `{ startsAt: ISO }`. Server continues to recompute `endsAt` when a procedure is attached (existing API logic).
- **UX:** Appointment chips are **draggable**; day columns (week) and cells (month) accept drops. **Click / Enter / Space** opens the edit page (chips are focusable `role="link"` divs, not nested `<a>` + drag).
- **iPad note:** Native HTML5 DnD is limited on many touch browsers; **tap-to-edit** remains the primary mobile path.

### Strings added (representative)

`viewWeek`, `viewMonth`, `thisMonth`, `prevMonth`, `nextMonth`, `ariaDropReschedule`, `rescheduleFailed`, `moreAppointments`.

---

## 3. Media: Postgres BYTEA vs optional Vercel Blob

**You do not need Blob** if all images stay in Postgres/Timescale (`BYTEA`). Blob is **opt-in** for deployments that want object storage (size/cost, operational split).

| Mode | Condition | Storage |
|------|-----------|---------|
| **Postgres only** | `BLOB_READ_WRITE_TOKEN` unset | `data` = `Uint8Array` / BYTEA; `blobPathname` null |
| **Blob** | Token set | `put(..., { access: 'private', addRandomSuffix: true })`; `blobPathname` set; `data` omitted |

**Serving:** `GET /api/clinic/media/[id]` — after tenant auth, if `blobPathname` present → `@vercel/blob` **`get(pathname, { access: 'private' })`** stream with `Cache-Control: private, no-store`; else legacy **`data`** buffer with existing cache header.

**Files:**

- `prisma/schema.prisma` — `ClinicPatientMedia.data` optional; `blobPathname` optional.
- `app/api/clinic/patients/[id]/media/route.ts` — branch on token; Prisma create uses conditional spread for `data` / `blobPathname`.
- `app/api/clinic/media/[id]/route.ts` — dual read path.

---

## 4. Schema and database migration

After pulling these changes, apply the schema to your database:

```bash
npx prisma db push
# or your migration workflow
npx prisma generate
```

**Existing rows:** Keep `data` populated, `blobPathname` null — no backfill required. **New uploads** pick Blob vs BYTEA based on env at request time.

---

## 5. Environment variables

Documented in **`.env.example`:**

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Optional. When set, **new** clinic media uploads use Vercel Blob (private). Omit to keep BYTEA-only behavior. |

Existing DB and JWT variables are unchanged; see `.env.example` and `docs/clinic/SETUP_LOCAL.md`.

---

## 6. Dependencies

- **`@vercel/blob`** (v2.x) — `put`, `get` for private blobs.

Run `npm install` after pull so `package-lock.json` matches.

---

## 7. Tests

| File | Coverage |
|------|----------|
| `lib/clinic/week.test.ts` | `monthGridFrom`, month length sanity (e.g. April = 30 days in grid). |
| `lib/clinic/appointment-dnd.test.ts` | `rescheduleStartsAtPreserveClock` preserves local clock on new day. |
| Existing | `timeline`, `db-tls`, etc. — unchanged |

Command: **`npm test`** (no DB required for these unit tests).

---

## 8. File reference (implementation touchpoints)

- `lib/clinic/strings.ts` — i18n keys (EN/AR).
- `lib/clinic/week.ts` — month calendar helpers.
- `lib/clinic/appointment-dnd.ts` — DnD + reschedule helper.
- `lib/clinic/appointment-dnd.test.ts`
- `lib/clinic/week.test.ts`
- `app/clinic/page.tsx`
- `app/clinic/account/page.tsx`
- `app/clinic/patients/page.tsx`
- `app/clinic/patients/new/page.tsx`
- `app/clinic/patients/[id]/PatientRecordClient.tsx`
- `app/clinic/procedures/page.tsx`
- `app/clinic/procedures/new/page.tsx`
- `app/clinic/appointments/page.tsx`
- `app/clinic/appointments/new/page.tsx`
- `app/clinic/appointments/[id]/page.tsx`
- `app/api/clinic/patients/[id]/media/route.ts`
- `app/api/clinic/media/[id]/route.ts`
- `prisma/schema.prisma` — `ClinicPatientMedia`
- `.env.example` — `BLOB_READ_WRITE_TOKEN`
- `package.json` / `package-lock.json` — `@vercel/blob`

---

## 9. Documentation follow-ups (optional)

~~Blob / dual media rows in `ARCHITECTURE.md` and `DATA_MODEL.md`~~ — updated in **Chunk 5** (2026-04-23).

## 12. Inventory (Chunk 7, 2026-04-23)

| Area | Detail |
|------|--------|
| **Schema** | `clinic_stock_items`, `clinic_stock_movements`; optional `procedureId` on item; movement types RECEIPT / ADJUSTMENT / CONSUMPTION / RETURN. |
| **Rules** | On-hand never negative; opening quantity creates a RECEIPT movement; low-stock = active, `reorderPoint > 0`, `quantityOnHand <= reorderPoint`. |
| **API / UI** | See `docs/clinic/CHUNKS.md` Chunk 7; dashboard **`lowStockCount`** + amber card linking to filtered list. |

---

## 11. Patient summary PDF (Chunk 6, 2026-04-23)

| Area | Detail |
|------|--------|
| **Route** | `GET /api/clinic/patients/[id]/summary-pdf` — `Content-Disposition: attachment`, `private, no-store`. |
| **PDF** | `lib/clinic/patient-summary-pdf.ts` — jsPDF; English labels; demographics + anamnesis + appointment/visit **dates**; footer disclaimer. |
| **UI** | Patient record — `downloadPatientSummaryPdf` link (EN/AR hint). |
| **E2E** | `test:clinic-flow` downloads PDF and checks magic bytes. |

---

## 10. Structured anamnesis (Chunk 5, 2026-04-23)

| Area | Detail |
|------|--------|
| **Schema** | `ClinicPatient.anamnesisJson` — nullable JSONB, v1 shape: `allergies`, `medications`, `conditions`, `social`. |
| **API** | `PATCH .../patients/[id]` with `anamnesisJson`; `null` clears. Validation in `lib/clinic/anamnesis.ts`. |
| **UI** | Overview card + edit form fields (EN/AR). |
| **E2E** | `scripts/clinic-business-flow.ts` patches anamnesis after chart load. |

---

## Relation to `CHUNKS.md`

Chunks **1–3** in `docs/clinic/CHUNKS.md` describe the original phased delivery. **This changelog** is the authoritative detail for **subsequent** work (i18n completion, month + DnD, optional Blob). A short **Chunk 4** entry in `CHUNKS.md` points here for the full list.

---

## UI follow-on — touch reschedule, drag affordance, dashboard (2026-04-23)

| Change | Detail |
|--------|--------|
| **`ClinicRescheduleSheet`** | `components/clinic/ClinicRescheduleSheet.tsx` — bottom sheet / modal: pick **new date** (time-of-day preserved), `PATCH` appointment; Escape + backdrop close; safe-area padding on mobile. |
| **Appointment chips** | Split **drag handle** (main area) vs **Move** button (`CalendarDays`) for iPad / no-DnD; opens sheet. |
| **Drop feedback** | Week columns + month cells **ring/highlight** while dragging; empty week slots show drop hint text when active. |
| **Copy** | `appointmentsCalendarHint`, `rescheduleMove`, `rescheduleSheetTitle`, `rescheduleNewDate`, `rescheduleApply`, `rescheduleHint`, `practiceOsTitle`, `practiceOsBrand` in `lib/clinic/strings.ts`. |
| **Dashboard** | Stat cards are **links** to Patients / Procedures / Appointments; icon tiles, hover shadow, `CalendarClock` for “today”, focus rings, subtle arrow on hover. |
| **Shell** | Sidebar title/brand from **`t.*`**; active nav **ring**; inset shadow on desktop sidebar. |
