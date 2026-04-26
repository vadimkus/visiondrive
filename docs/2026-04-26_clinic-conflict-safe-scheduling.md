# Clinic Conflict-Safe Scheduling Completion

Date: 2026-04-26

Context: Completed point 2 from the Altegio-inspired backlog: conflict-safe scheduling and buffers.

## Shipped

- Appointment create/reschedule now checks:
  - existing appointment overlap
  - hidden service buffer / occupied-until time
  - blocked time
  - working-hours rules
  - minimum lead time
- Intentional exceptions now require:
  - `allowConflictOverride=true`
  - non-empty `overrideReason`
- Override reason is stored on `ClinicAppointment.overrideReason`.
- Appointment create/edit UI now has an override checkbox and reason field.
- Appointment drawer displays the stored override reason.

## Design Decision

Status-only changes do not re-run the availability guard. This prevents confirming or completing an existing same-day appointment from being blocked by minimum lead-time rules.

## Operational Notes

- Prisma schema changed. Run `npx prisma generate` and `npx prisma db push` on the target database before/with deployment.
- Public booking should not use overrides. Overrides are staff-only for manual operational exceptions.
