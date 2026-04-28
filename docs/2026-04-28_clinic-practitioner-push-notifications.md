# Clinic Practitioner Push Notifications

Date: 2026-04-28

## Context

Backlog item 41 from the Altegio home-visit adaptation map: practitioner mobile push for new bookings, cancellations, reschedules, reminder due, unpaid visit, low stock, and package expiring.

## Shipped

- Added `ClinicPractitionerPushDelivery` as an idempotency log.
- Added `notifyCancelled` to account notification preferences.
- Added shared notification item derivation in `lib/clinic/notification-items.ts`.
- Updated `/api/clinic/inbox` to reuse the shared derivation and include cancellations plus expiring packages.
- Added `GET/POST /api/clinic/practitioner-push/run`:
  - signed-in users run their tenant,
  - cron can run all active tenants via `CRON_SECRET`,
  - sends browser push only to active opted-in users,
  - respects saved alert-type preferences,
  - removes stale subscriptions on 404/410,
  - records sent alerts so repeated scans do not resend the same source item.
- Added helper tests for push payload and preference mapping.

## Validation

- `npx prisma format`
- `npx prisma generate`
- `npx prisma db push`
- `npm run type-check`
- `npx vitest run lib/clinic/practitioner-push.test.ts lib/clinic/account-preferences.test.ts`
- `npm run lint`

## Next Improvements

- Direct event-triggered push on booking/cancel/reschedule mutations.
- Visible delivery history and retry status.
- Quiet hours and snooze controls.
