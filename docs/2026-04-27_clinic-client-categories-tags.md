# Clinic client categories and tags

## Context

Point 8 from the Altegio solo-practitioner backlog adds lightweight client segmentation for retention, risk, and payment workflows.

## Shipped

- Added `ClinicPatient.category` and `ClinicPatient.tags`.
- Added controlled category/tag helpers in `lib/clinic/patient-tags.ts`.
- Supported categories: VIP, regular, new, sensitive, high-risk.
- Supported tags: VIP, regular, new, sensitive, high-risk, follow-up due, late payer.
- Patient create and edit forms can set category and tags.
- Patient list can filter by category and tag.
- Patient list, patient chart, and appointment drawer show category/tag chips.
- Knowledge Base was updated in English and Russian.

## Operational Notes

- Requires `npm run db:push` against the target database because the Prisma schema changed.
- Tags are intentionally controlled in the first pass to avoid noisy free-text segmentation.
