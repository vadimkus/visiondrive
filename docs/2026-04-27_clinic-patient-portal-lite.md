# Clinic Patient Portal Lite

Date: 2026-04-27

## Context

Point 22 from the Altegio home-visit practitioner backlog is **Private patient portal lite**. The first pass keeps it link-based: no patient accounts, no app install, and no marketplace-style exposure.

## What Shipped

- Added `ClinicPatientPortalLink` for private portal links.
- Added `ClinicPatientPortalRequest` for reschedule/cancel/message requests.
- Portal tokens are generated once, stored only as SHA-256 hashes, expire after 90 days by default, and can be revoked.
- Patient chart now has a Patient portal card for creating/copying/revoking a link and reviewing recent requests.
- Public route `/patient-portal/[token]` shows:
  - Upcoming appointments and home-visit location notes.
  - Patient-facing booking policy terms, accepted timestamp, deposit/prepay/card-on-file status, cancellation window, and late-cancel/no-show fees.
  - Aftercare / next steps from completed visits.
  - Package balance.
  - Payment receipts with patient-friendly deposit/late-cancel/no-show descriptions.
  - Active treatment plans.
  - Accepted consent titles.
  - Reschedule and cancellation request form.
- Active portal links can download receipt PDFs through a token-scoped receipt endpoint.
- Requests do not mutate appointments directly. They create structured request rows, CRM notes, and appointment events for staff review.
- `robots.ts` blocks `/patient-portal/` from indexing.

## Safety Notes

- Plaintext token is never stored.
- Internal notes, staff notes, clinical photos, full consent bodies, and anamnesis are not exposed.
- The patient can request a change, but staff remains the approval gate.

## Validation

- Added `lib/clinic/patient-portal.test.ts`.
- Required validation: `npm run db:generate`, `npm run db:push`, `npm run type-check`, `npm run test`, `npm run lint`, `npm run build`.
