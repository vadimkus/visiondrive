# Clinic Calendar Sync And Personal Blocks

Date: 2026-04-29

## Context

This chunk adds a practical first pass for calendar sync around the existing solo-practitioner availability and blocked-time workflow.

## Shipped

- Added a private ICS calendar feed:
  - staff can create/rotate/revoke the feed from Availability,
  - the feed includes active appointments and blocked time,
  - patient identity/contact data is intentionally excluded.
- Added public tokenized calendar route for Apple Calendar, Google Calendar, Outlook, and other ICS subscribers.
- Availability page now shows calendar-feed state and copy-ready links immediately after creation/rotation.
- Added ICS escaping/token helper tests.

## Notes

- This is subscription/export sync, not OAuth. It avoids storing Google/Apple credentials and works with standard calendar clients.
- Existing `ClinicBlockedTime` remains the source for personal blocks, lunch, leave, training, and external calendar busy time manually added by staff.
- Feed tokens are stored hashed in `tenant_settings.thresholds.calendarFeed`.

## Verification

- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/calendar-feed.test.ts`
- `npm run test:clinic-flow`
