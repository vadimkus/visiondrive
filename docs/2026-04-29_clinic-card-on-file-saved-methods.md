# Clinic Card-On-File Saved Methods

Date: 2026-04-29

## Context

Card-on-file booking policies existed as a service-level rule, but the patient card had no workflow for recording that a client had authorised a saved method. This chunk adds the operational first pass without storing full card numbers or CVV.

## Shipped

- New `ClinicSavedPaymentMethod` model for provider-ready saved-method metadata:
  - provider name,
  - card brand,
  - last 4 digits,
  - optional expiry,
  - status (`ACTIVE`, `REVOKED`, `EXPIRED`),
  - consent text and timestamp.
- New patient API: `POST/PATCH /api/clinic/patients/[id]/saved-payment-methods`.
- Patient Payments tab now shows a saved-method card:
  - add manual card-on-file consent metadata,
  - list active/revoked/expired methods,
  - mark methods expired or revoked.
- When an active saved method is added, pending `CARD_ON_FILE` appointment requirements for that patient are marked as satisfied.
- EN/RU copy added for the saved-card workflow.

## Safety Notes

- Do not store PAN/full card numbers, CVV, screenshots of cards, or bank authentication data.
- This is not payment capture. It is the consent and saved-method status workflow that a real payment provider token can connect to later via `provider` / `providerRef`.
- Revoking a method does not retroactively change historical appointments; it prevents staff from treating that method as active going forward.

## Verification

- `npx prisma generate`
- `npx prisma db push`
- `npm test -- --run lib/clinic/saved-payment-methods.test.ts lib/clinic/booking-policy.test.ts`
- `npm run type-check`
- `npm run lint`
