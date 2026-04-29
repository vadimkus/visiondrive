# Clinic Patient List Identity UI

Date: 2026-04-29

## Context

The patients page table made each customer look too similar, especially when test data had repeated names. The goal was to make real patients easier to scan and visually distinct.

## Decision

Use a list-card pattern instead of a dense table. This matches common patient-list UX guidance: make the full row clickable, lead with identity, and show key status/payment/contact data as chips.

## Changes

- Replaced the patient table in `app/clinic/patients/page.tsx` with clickable patient cards.
- Added deterministic colored initials tiles per patient.
- Promoted patient name, category, DOB/age, phone, email, tags, and balance into readable chips.
- Deduplicated displayed tag labels so imported/demo data does not show repeated badges.
- Widened the desktop content area from `max-w-4xl` to `max-w-6xl`.

## Validation

- `npm run type-check` passed.
- `ReadLints` reported no issues for `app/clinic/patients/page.tsx`.
- Browser validation confirmed the fake E2E patients were gone and real/demo patient cards are visually distinct.
