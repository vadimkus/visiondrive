# Clinic Portal Policy And Receipt Text

Date: 2026-04-29

## Context

This chunk completes the patient-facing side of the booking protection work. Staff could already set policy terms, collect deposits, and enforce or waive late-cancel/no-show fees. The patient portal now explains those terms back to the client from the immutable appointment snapshot.

## Shipped

- The token-scoped patient portal API now includes appointment booking policy snapshots.
- Upcoming appointment cards show:
  - custom policy text,
  - accepted timestamp,
  - deposit or full-prepay amount and payment status,
  - card-on-file/no-show protection note,
  - cancellation window,
  - late-cancel and no-show fees.
- Receipt cards now classify standard payments, deposits, late-cancel fees, and no-show fees with patient-friendly text.
- EN/RU portal copy was added directly to the public portal page.
- `patientPortalPaymentKind` helper classifies receipt type from ledger references.

## Safety Notes

- The portal still does not expose internal notes, clinical notes, photos, or staff-only policy decisions.
- Policy details come from the appointment snapshot, not the current service catalog, so a patient sees the terms they accepted at booking time.

## Verification

- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/patient-portal.test.ts`
