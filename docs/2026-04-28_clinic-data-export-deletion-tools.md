# Clinic data export and deletion tools

Date: 2026-04-28

## Context

Practice OS now stores rich patient records: clinical notes, photos, consents, payments, correction history, treatment plans, portal requests, packages, and CRM history. Solo practitioners need a clean way to export a complete record before deletion or migration.

## Shipped

- Added `GET /api/clinic/patients/[id]/export` for authenticated, tenant-scoped full patient JSON exports.
- Added guarded `DELETE /api/clinic/patients/[id]` with exact typed confirmation (`DELETE Last First`).
- Added best-effort Vercel Blob cleanup for private patient media when deleting a patient.
- Added patient chart controls for patient-safe PDF, full JSON export, and irreversible deletion.
- Added EN/RU strings and Knowledge Base guidance.
- Updated architecture, data model, implementation log, and backlog canvas.

## Export scope

The JSON archive includes:

- patient demographics, address/access notes, tags, internal notes, and anamnesis JSON;
- appointments, appointment events, intake responses, and linked payments;
- visits, clinical text, linked media metadata, package redemptions, consent records, payments, and product sales;
- payment corrections, product sales, prepaid packages, consent records, treatment plans, portal links/requests, reviews, CRM activities, and top-level intake responses.

Media binaries are not embedded in JSON to avoid huge archives. Each media row includes an authenticated `downloadPath` so staff can download originals before deletion.

## Deletion behavior

Deletion is a hard delete of the patient record. Existing Prisma cascade relations remove linked patient data. Blob cleanup is best-effort: database deletion remains the source of truth, and failed blob path cleanup is returned in the API response.

## Validation

- Added `lib/clinic/data-export.test.ts`.
- Run after implementation: `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No Prisma schema change.
