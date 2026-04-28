# Clinic Aftercare Document Library

Date: 2026-04-28

## Context

Backlog item 36 from the Altegio home-visit adaptation map: attach or send aftercare PDF/message templates after a visit, based on procedure.

## Shipped

- Added `ClinicAftercareTemplate` for reusable procedure-based aftercare messages and optional document/PDF references.
- Added visit-level aftercare snapshots so patient-facing instructions remain stable even if a template is edited later.
- Procedures page now manages aftercare templates per service.
- Appointment completion can choose an aftercare template, snapshot it to the visit, copy the message, and open WhatsApp.
- Patient visit logging can attach an aftercare template.
- Patient portal displays saved aftercare text and document links.

## Validation

- `npx prisma format`
- `npx prisma generate`
- `npm run type-check`

## Next Improvements

- Upload/store branded aftercare PDFs instead of URL-only references.
- Add first-class aftercare delivery audit rows.
- Suggest retail aftercare products from the selected template.
