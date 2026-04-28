# Clinic Patient-Safe Exports

Date: 2026-04-28

## Context

Backlog item 37 from the Altegio home-visit adaptation map: export treatment summary, receipts, consent, and aftercare without internal notes.

## Shipped

- Added a richer patient-facing PDF endpoint: `GET /api/clinic/patients/[id]/patient-safe-export`.
- Added a patient-card action: **Patient-safe treatment export (PDF)**.
- The PDF includes:
  - patient demographics and anamnesis,
  - completed treatment summaries,
  - aftercare text and document links,
  - receipt summaries,
  - accepted consent snapshots.
- The export excludes internal notes, staff visit notes, CRM history, private appointment notes, photos/media, and internal JSON/audit metadata by construction.

## Validation

- `npm run type-check`
- `npx vitest run lib/clinic/patient-safe-export-pdf.test.ts lib/clinic/patient-summary-pdf.test.ts lib/clinic/payment-receipt-pdf.test.ts`
- `npm run lint`

## Next Improvements

- Add date range and section filters before export.
- Allow patient portal self-download.
- Add optional media ZIP only for explicitly consented photos.
