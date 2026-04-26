# Clinic Reminders + UI Polish

Date: 2026-04-26

Context: Implemented point 3 from the Altegio-inspired solo-practitioner backlog and improved the Clinic / Practice OS panel design for phone, iPad, and desktop.

## Reminder System

- Added tenant-scoped reminder templates.
- Added reminder delivery/preparation log.
- Added appointment drawer actions:
  - send WhatsApp reminder now
  - schedule 24h reminder
  - prepare no-show follow-up
- Added `/clinic/reminders`:
  - edit templates
  - view delivery log
  - manually run due reminder preparation
- Added `/api/clinic/reminders/run` for manual or cron execution.
- WhatsApp messages are prepared with generated `wa.me` links; they are not silently auto-sent because that requires WhatsApp Business API.

## UI Enhancements

- Clinic shell now has a more polished gradient/glass layout.
- Desktop sidebar widened slightly and made visually clearer.
- Phone/iPad top navigation remains horizontally scrollable with stronger touch targets.
- Dashboard now has a hero section, clearer primary actions, responsive five-card stats grid, and richer card styling.
- Added Reminders to the panel navigation and dashboard actions.

## Operational Notes

- Prisma schema changed. Run `npx prisma generate` and `npx prisma db push` on the target database.
- Optional cron can call `/api/clinic/reminders/run` with `x-cron-secret: $CRON_SECRET`.
- Future delivery automation should integrate WhatsApp Business API and then mark `ClinicReminderDelivery.status` as `SENT`.
