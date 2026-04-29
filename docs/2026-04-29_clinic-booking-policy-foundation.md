# Clinic Booking Policy Foundation

Date: 2026-04-29

## Context

Chunk 1 of the commercial protection backlog adds the rules layer before live payment capture:
deposits, full prepay, card-on-file hold intent, cancellation windows, late-cancel fees,
no-show fees, and client-facing policy text.

## Shipped

- Added service-level booking policy fields to `ClinicProcedure`.
- Added appointment-level policy snapshot, acceptance timestamp, payment requirement status, deposit due, cancellation window, late-cancel fee, and no-show fee fields to `ClinicAppointment`.
- Added `PATCH /api/clinic/procedures/[id]` for updating service policy terms.
- Manual appointment creation blocks policy-protected services until the practitioner records client acceptance.
- Public booking shows service policy terms in EN/RU and blocks submission until the client accepts them.
- Existing appointment edit view can preserve or re-record policy acceptance when a policy-protected service is selected.
- The HTTP clinic business flow now verifies that a policy-protected appointment is rejected without acceptance and succeeds with acceptance.

## Notes

- No card data is stored and no live payment is captured in this chunk.
- `paymentRequirementStatus` starts as `PENDING` for deposit/full-prepay/card-on-file policies; Chunk 2 will connect this to deposit payment links/manual paid marking.
- Appointment snapshots preserve historical client terms if a service policy changes later.

## Verification

- `npx prisma db push`
- `npm run lint`
- `npm run type-check`
- `npx vitest run lib/clinic/booking-policy.test.ts lib/clinic/public-booking.test.ts lib/clinic/appointments.test.ts`
- `npm run test:clinic-flow`
