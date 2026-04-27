# Clinic Client Import From Excel

Date: 2026-04-27

## Context

Point 24 from the Altegio home-visit adaptation backlog adds a practical onboarding path for existing solo-practitioner client lists. The goal is to avoid manual one-by-one patient creation while protecting the database from duplicate or incomplete rows.

## Shipped

- Added `read-excel-file` for `.xlsx` parsing.
- Added native CSV parsing for simple exports.
- Added `lib/clinic/patient-import.ts` to map common EN/RU headers, normalize patient fields, validate rows, parse common DOB formats, and detect duplicates.
- Added `POST /api/clinic/patients/import`:
  - multipart upload returns preview rows and summary counts;
  - JSON `action=commit` creates only clean non-duplicate patient cards.
- Added `/clinic/patients/import` with upload, preview, status chips, duplicate warnings, and import commit.
- Added a Patients page button for import.
- Updated EN/RU copy, Knowledge Base, architecture docs, data model docs, implementation log, and backlog canvas.

## Supported Columns

- First name / last name / full name
- Date of birth / DOB
- Phone / WhatsApp
- Email
- Home address / area / access notes
- Category
- Tags
- Notes

## Validation

- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
