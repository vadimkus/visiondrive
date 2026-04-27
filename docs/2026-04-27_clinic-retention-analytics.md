# Clinic Retention Analytics

Date: 2026-04-27

## Context

Point 20 from the Altegio home-visit adaptation backlog adapts client retention, lost clients, and returning-client analytics for solo practitioners.

## Shipped

- Added `lib/clinic/retention.ts` for derived retention metrics without adding schema.
- Added `GET /api/clinic/retention/overview` with range selection, lost-patient threshold, rebook rate, returning-client rate, no-show rate, follow-up conversion, repeat interval by procedure, and lost-patient rows.
- Added `/clinic/retention` with mobile-friendly cards, repeat interval table, lost patient list, patient chart links, and WhatsApp reactivation links.
- Added Retention to clinic navigation.
- Updated EN/RU strings and the in-app Knowledge Base.
- Updated the Altegio adaptation map and canvas to mark Point 20 as shipped.

## Metric Definitions

- **Rebook rate:** completed appointments in the report window that have a later active or completed appointment for the same patient.
- **Returning clients:** unique patients with a completed visit in the window and at least two completed appointments in history.
- **No-show rate:** no-shows divided by completed appointments plus no-shows in the window.
- **Follow-up conversion:** rebooking follow-up reminders in the window that were followed by a later active or completed appointment.
- **Lost patients:** patients whose last completed appointment is older than the configured threshold and who have no future active appointment.
- **Repeat interval by procedure:** average days between completed repeat appointments for the same patient and procedure.

## Validation

- Added Vitest coverage for retention summary, procedure repeat intervals, and rebooking follow-up conversion.
- Required validation: `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No `npm run db:push` is required because there is no schema change.
