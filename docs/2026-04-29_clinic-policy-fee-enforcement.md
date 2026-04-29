# Clinic Policy Fee Enforcement

Date: 2026-04-29

## Context

Chunk 3 of the commercial protection backlog adds practitioner discretion around late-cancel and no-show fees. The important product behavior is not automatic punishment; it is a clean workflow to enforce or waive a fee with an audit trail.

## Shipped

- Added policy-fee helpers for `LATE_CANCEL` and `NO_SHOW` references.
- Added appointment actions:
  - `enforce_policy_fee` creates a pending payment for the configured late-cancel/no-show fee.
  - `waive_policy_fee` logs a waiver and voids an existing pending policy-fee row if present.
- Enforcing a late-cancel fee marks the appointment cancelled; enforcing a no-show fee marks it no-show.
- Client balance now treats appointment-linked policy-fee payments as expected charges even when the appointment itself is cancelled/no-show.
- Appointment drawer shows fee amounts, charge/waive buttons, and recent fee rows.
- Patient payment timeline labels late-cancel/no-show fee rows.
- EN/RU copy and automated coverage were added.

## Notes

- No live card capture is attempted here.
- The payment ledger remains the source of truth: fees are normal `ClinicPatientPayment` rows with `LATE_CANCEL:{appointmentId}` or `NO_SHOW:{appointmentId}` references.
- Waiver is deliberately manual because solo practitioners often choose relationship preservation over strict fee collection.

## Verification

- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/policy-fees.test.ts lib/clinic/deposit-requests.test.ts lib/clinic/booking-policy.test.ts`
- `npm run test:clinic-flow`
