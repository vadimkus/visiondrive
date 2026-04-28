# Clinic Gift Cards

Date: 2026-04-28

## Context

Implemented the next Altegio adaptation backlog item for solo home-visit practitioners: gift cards. The goal is a simple prepaid voucher sold to a buyer and redeemed by a patient, separate from treatment packages.

## Shipped

- Added `ClinicGiftCard` and `ClinicGiftCardRedemption` to track voucher sale details, buyer/recipient, code, balance, expiry, payment status, and redemption audit rows.
- Added `lib/clinic/gift-cards.ts` helper coverage for code normalization/generation, payment references, status derivation, and redemption validation.
- Added `GET/POST /api/clinic/gift-cards` for listing/selling cards and `POST /api/clinic/gift-cards/redeem` for transactional redemption.
- Finance now sells gift cards and reports sold, redeemed, outstanding balance, open cards, and gift-card processing fees.
- Patient Payments tab now redeems a gift-card code against that patient and shows redemption history.
- Daily close now includes gift-card sale cash by payment method.
- Patient detail/export includes gift-card redemption history.

## Guardrails

- Redemption requires an active, paid, non-expired card with enough remaining balance.
- Redemption decrements balance and creates a `GIFT_CARD:*` patient payment in one transaction.
- Gift-card sales are tracked as voucher liability; service revenue is recognized when redeemed through patient payment.

## Validation

- `npx prisma generate`
- `npm run type-check`
- `npx vitest run lib/clinic/gift-cards.test.ts lib/clinic/patient-packages.test.ts lib/clinic/client-balance.test.ts`

Run `npx prisma db push` before using this on the target database because the schema changed.
