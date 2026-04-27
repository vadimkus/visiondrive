# Clinic Notification Center

Date: 2026-04-27

## Context

Point 15 from the Altegio-inspired home-visit backlog adds a daily operational inbox for solo practitioners. The goal is to replace receptionist-style follow-up with one screen that surfaces what needs attention today.

## Shipped

- Added `GET /api/clinic/inbox`, a derived API that aggregates:
  - due scheduled/prepared reminders
  - new online bookings
  - recent reschedules
  - pending review requests
  - unpaid arrived/completed appointments
  - low-stock inventory
- Added `lib/clinic/notification-center.ts` for severity sorting, summary counters, and appointment due calculation.
- Added `/clinic/inbox` with totals, severity counters, filters, localized labels, and action links back to source workflows.
- Added Inbox to the clinic navigation.
- Added EN/RU strings and a Knowledge Base article.

## Notes

- No new database table was added. The inbox is intentionally derived from source-of-truth rows so it cannot go stale.
- There is no read/dismiss state yet. That should be a future persisted layer once the source signals prove useful.
- Unpaid visit items use the same discount/fee/refund direction as the inline payment flow and dedupe payment rows by id.

## Validation

- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
