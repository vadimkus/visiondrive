# Clinic Service-Specific Public Intake Fields

Date: 2026-04-27

## Context

Point 23 from the Altegio home-visit adaptation backlog adds service-specific intake questions to the public booking flow. The goal is to capture clinically useful context before an online booking reaches the calendar.

## Shipped

- Added `ClinicIntakeQuestion` and `ClinicIntakeResponse` to Prisma.
- Staff can configure questions from `/clinic/procedures` for each service.
- Supported question types: short text, long text, and yes/no.
- Questions can be marked required; required answers are validated in the public booking API.
- `/book/[slug]` displays the selected service's active questions and submits answers with the booking.
- Answers are stored as appointment-linked snapshots and appended to appointment internal notes for staff visibility.
- EN/RU copy and the in-app Knowledge Base were updated.

## Operational Notes

- Run `npm run db:push` for any target database because this changes schema.
- Intake answers are staff-only operational data; they are not exposed in the patient portal or patient-safe PDFs.
- Question prompts are snapshotted into responses, so future question edits do not rewrite historical bookings.

## Validation

- `npm run db:generate`
- `npm run db:push`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
