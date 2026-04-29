# Clinic Deposit Payment Links

Date: 2026-04-29

## Context

Chunk 2 connects the booking-policy foundation to an operational deposit workflow. The first pass intentionally avoids a live payment gateway: practitioners generate a secure request link, send it by WhatsApp, and manually mark the deposit paid after the client pays by transfer/card/POS/Stripe link outside the app.

## Shipped

- `ClinicPatientPayment` now stores `paymentRequestTokenHash`, `paymentRequestExpiresAt`, and `paymentRequestSentAt` for secure read-only deposit request links.
- `prepare_deposit_request` appointment action creates or reissues a pending appointment-linked deposit payment with `DEPOSIT:{appointmentId}` reference and returns `/pay/deposit/[token]` plus WhatsApp-ready copy.
- `/pay/deposit/[token]` shows the patient-facing deposit summary without requiring clinic login.
- `mark_deposit_paid` marks the deposit paid, snapshots processor fee if a fee rule exists, changes the appointment payment requirement to paid, and confirms the appointment.
- Direct appointment confirmation is blocked while a required deposit remains pending.
- Appointment drawer and calendar cards show pending/paid deposit state; patient payment timeline labels deposit requests.
- EN/RU strings and automated coverage were added.

## Notes

- The public link is a request summary, not a card-processing gateway. The actual provider link or transfer instruction remains manual in this chunk.
- The payment ledger remains the source of truth; no separate deposit table was introduced.
- Request tokens are stored only as SHA-256 hashes. Reissuing a request rotates the token on the pending payment row.

## Verification

- `npx prisma db push`
- `npx prisma generate`
- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/deposit-requests.test.ts lib/clinic/booking-policy.test.ts`
- `npm run test:clinic-flow`
