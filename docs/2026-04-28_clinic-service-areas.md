# Clinic Service Areas

## Context

Backlog next item after Knowledge Base expansion was Altegio-style chain/location management. That is not useful for a solo home-visit practitioner, so the first pass ships a lighter replacement: service-area visibility.

## Shipped

- Added `/clinic/service-areas`.
- Added `GET /api/clinic/service-areas/overview`.
- Added sidebar navigation and dashboard quick action.
- Added EN/RU strings and a Knowledge Base article.
- Updated backlog, architecture, data-model, chunks, and docs index.

## Behavior

The report derives neighborhood demand from existing fields:

- `ClinicPatient.area` for the patient's default home-visit area.
- `ClinicAppointment.locationArea` for appointment-specific visit snapshots.

It shows:

- areas served,
- patients with an area,
- patient cards missing an area,
- upcoming visits for the next 30 or 90 days,
- completed visits in the last 90 days,
- busiest areas,
- next visit per area.

No branch, chain, or location table was added. This keeps the product aligned with solo practitioners who need route and demand visibility, not enterprise location administration.

## Next Improvements

- Normalize area aliases such as `JVC` / `Jumeirah Village Circle`.
- Area filters in patient and appointment lists.
- Map links from area cards.
- Optional home-base setting to estimate travel pressure by area.
