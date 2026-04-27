# Clinic Prepaid Treatment Packages

Date: 2026-04-27

Context: continued the Altegio-inspired home-visit practitioner backlog after client balance/debt. Point 10 was prepaid treatment packages: sell courses of 3/5/10 visits and automatically debit sessions when visits complete.

## What Shipped

- Added `ClinicPatientPackage` and `ClinicPackageRedemption` to track sold packages, remaining sessions, expiry, and visit-linked usage.
- Added `/api/clinic/patients/[id]/packages` for listing and selling packages from a patient chart.
- Added automatic package session debit when an appointment/visit is completed and the patient has a matching active package.
- Added a patient Packages tab with sale form, service restriction, payment status, expiry, remaining-session cards, one-session-left warning, and usage history.
- Package sale creates a payment row with `PACKAGE:<id>` reference; client balance ignores those payments as deposit credit so package revenue does not inflate open balance.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint` (passes with the existing `app/login/page.tsx` `<img>` warning)
- `npm run build` (passes with existing legacy metadata warnings)

Remaining before production: run `npm run db:push` against the target database because this includes new package tables and enum values.
