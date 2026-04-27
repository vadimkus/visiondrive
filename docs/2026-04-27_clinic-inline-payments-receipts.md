# Clinic Inline Payments And Receipts

Date: 2026-04-27

## Context

Point 13 from the Altegio home-visit adaptation backlog was implemented so a solo practitioner can close a visit from the appointment drawer instead of jumping between patient chart, visit log, and finance views.

## Shipped

- Added optional `appointmentId`, `discountCents`, and `feeCents` to `ClinicPatientPayment`.
- Appointment drawer now records payments inline with amount, method, status, discount, fee, reference, and note.
- Payment rows can be linked to the appointment and, when a visit already exists, to the visit as well.
- Client balance now includes appointment-linked payments, deduplicates rows linked to both visit and appointment, applies discounts against expected charges, and adds patient-facing fees.
- Added refund/void status actions for payment rows.
- Added patient-safe receipt PDF endpoint:
  - `GET /api/clinic/patients/[id]/payments/[paymentId]/receipt`
- Added payment status update endpoint:
  - `PATCH /api/clinic/patients/[id]/payments/[paymentId]`
- Added `lib/clinic/payment-receipt-pdf.ts` with Vitest coverage.
- Added EN/RU UI strings and Knowledge Base article.

## Notes

- `amountCents` is the amount recorded as paid/pending/refunded/void.
- `discountCents` reduces the expected charge for the linked appointment.
- `feeCents` increases the expected charge when a patient-facing fee is added.
- Future improvements should add proper sequential receipt numbers, partial refunds, WhatsApp receipt sending, and payment-terminal/Stripe integration.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`

Run `npm run db:push` against the target database before production use because this feature changes the payment schema.
