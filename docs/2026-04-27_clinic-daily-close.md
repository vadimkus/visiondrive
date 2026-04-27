# Clinic Daily Close

## Context

Daily close is point 28 from the Altegio home-visit practitioner backlog. The goal is a lightweight cash desk report for solo practitioners: compare what the system expects from payment rows against what was actually counted in cash, card, POS, Stripe, transfers, and other methods.

## Shipped

- Added `ClinicDailyClose` with business date, expected totals, counted totals, discrepancies, pending/refund totals, processor fees, appointment/payment counts, note, and draft/finalized status.
- Added `lib/clinic/daily-close.ts` for date parsing, method totals, net expected payment calculations, and discrepancy summaries.
- Added `GET/POST /api/clinic/daily-close`:
  - `GET` previews one business date from payment rows and returns saved close data if present.
  - `POST` saves a draft or finalizes the day; finalized closes cannot be overwritten by the current workflow.
- Added a Daily close panel to `/clinic/finance` with date selector, method-level counted inputs, discrepancy summary, notes, save draft, finalize, and recent closes.
- Added EN/RU strings and Knowledge Base guidance.

## Accounting Logic

- Expected totals are net by payment method:
  - `PAID` payments add to the method total.
  - `REFUNDED` payments subtract from the method total and are tracked separately.
  - `PENDING` payments are tracked as pending, but do not count as cash/card received.
  - `VOID` payments are ignored.
- Counted totals are entered manually by staff.
- Discrepancy = counted total minus expected total, per method and overall.
- Daily close is a reconciliation snapshot only. It does not mutate payments, patient balances, product sales, or profitability.

## Validation

- Added Vitest coverage for daily close date parsing, method normalization, net expected totals, pending/refund handling, processor fees, and discrepancies.
- Run `npx prisma format`, `npx prisma generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.

## Operational Note

This changes the Prisma schema. Run `npx prisma db push` against the target database after deployment.
