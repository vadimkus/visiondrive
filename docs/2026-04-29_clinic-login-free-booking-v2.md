# Clinic Login-Free Booking V2

Date: 2026-04-29

## Context

This chunk improves the public booking flow while keeping it account-free. Patients still open a private booking link, choose a service/time, enter details, accept terms, and finish without creating a portal account.

## Shipped

- Added public booking confirmation mode in tenant settings:
  - `REQUEST` keeps online bookings as appointment requests.
  - `INSTANT` immediately confirms the appointment and stamps `confirmedAt`.
- Dashboard now lets staff switch between approval and instant modes beside the public booking link controls.
- Public booking API returns the current confirmation mode and uses it during appointment creation.
- The public success screen now distinguishes "Booking requested" from "Booking confirmed" in EN/RU.
- Existing service policy/cancellation/no-show terms continue to be accepted before submission.

## Notes

- No patient account is introduced.
- No schema change: the setting is stored in existing `tenant_settings.thresholds.publicBooking.confirmationMode`.
- Staff remains able to use deposit/no-show protection on services even when instant confirmation is enabled.

## Verification

- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/public-booking-settings.test.ts lib/clinic/public-booking.test.ts`
- `npm run test:clinic-flow`
