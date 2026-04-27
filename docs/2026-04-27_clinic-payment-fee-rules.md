# Clinic payment fee rules

## Context

Point 27 from the Altegio solo-practitioner adaptation backlog adds method-level acquiring fees so Practice OS can show profit after card/POS/Stripe/bank costs, not just gross payment revenue.

## Shipped

- Added `ClinicPaymentFeeRule` for tenant-scoped method rules.
- Added `processorFeeCents` to `ClinicPatientPayment`.
- Added `GET/PATCH /api/clinic/payment-fee-rules`.
- Updated payment creation from patient records, appointment drawer, product sales, and package sales to snapshot processor fees for new paid payments.
- Updated Finance / P&L v2 to subtract processing fees from direct costs, gross profit, operating profit, and procedure profitability.
- Added Finance UI for Cash, Card, Transfer, POS, Stripe, and Other fee rules.
- Added EN/RU Knowledge Base guidance.

## Accounting logic

`feeCents` remains patient-facing and still increases patient due when used manually. `processorFeeCents` is internal only:

- It does not affect client balance.
- It is calculated from the configured method rule at payment creation time.
- It is counted as direct cost in finance reports.

Formula:

`processorFeeCents = min(amountCents, round(amountCents * percentBps / 10000) + fixedFeeCents)`

Fees are calculated only for newly created `PAID` payments. Existing historical payments keep `processorFeeCents = 0` until backfilled manually in a future migration/tool.

## Validation

- Added unit tests for fee normalization, fixed/percentage fee calculation, unpaid payment behavior, and summaries.
- Run: `npm run type-check`, `npm run test`, `npm run lint`, `npm run build`.

## Operational note

This is a schema change. Run `npx prisma db push` against the target production database after deploying.
