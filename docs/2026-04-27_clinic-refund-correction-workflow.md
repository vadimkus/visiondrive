# Clinic Refund And Correction Workflow

## Context

Refund and correction workflow is point 29 from the Altegio home-visit practitioner backlog. Daily close made payment reconciliation visible; the next risk was changing old payment rows directly when a refund or mistake happens.

## Shipped

- Added `ClinicPaymentCorrection` and `ClinicPaymentCorrectionType` for required-reason refund/void audit records.
- Refunds now preserve the original payment and create a separate `REFUNDED` adjustment payment with reference `REFUND:<originalPaymentId>`.
- Voids require a reason, mark the original payment as `VOID`, and store a correction record.
- Added helper coverage in `lib/clinic/payment-corrections.ts` for refund references, reasons, amount normalization, refundable balance, and void eligibility.
- Updated appointment drawer and patient Payments tab to prompt for refund/void reason, support partial refund amount, and show correction history under the original payment.
- Updated product-sale payment status when the linked product-sale payment is fully refunded or voided.
- Added EN/RU strings and Knowledge Base guidance.

## Accounting Logic

- `PAID` original payment remains unchanged for refunds.
- Refund creates a new `ClinicPatientPayment` row:
  - `status = REFUNDED`
  - `amountCents = refund amount`
  - `reference = REFUND:<originalPaymentId>`
  - same patient, visit, and appointment links as the original payment
- Client balance, Finance, and Daily close already subtract `REFUNDED` rows, so the adjustment flows through without rewriting visit history.
- A payment can be partially refunded multiple times until the original paid amount is exhausted.
- A payment with refund corrections cannot be voided.

## Validation

- Added Vitest coverage for correction helper logic.
- Run `npx prisma format`, `npx prisma generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.

## Operational Note

This changes the Prisma schema. Run `npx prisma db push` against the target database after deployment.
