# Clinic Patient Tabs Desktop UI Pass

## Intent

Review the desktop patient card tabs one by one and make each tab easier to scan on a large screen.

## Changes

- Added record counts directly into the patient-card tab bar for Timeline, Photos, Quotes, Payments, Packages, Treatment plans, Consents, and CRM.
- Added a shared desktop tab header to every tab with a short purpose statement and live summary metrics.
- Improved Overview with a desktop two-column split for contact/routing context and anamnesis.
- Improved Photos with protocol/offline-draft metrics and a wider desktop gallery grid.
- Added focused summaries for Timeline, Quotes, Payments, Packages, Treatment plans, Consents, and CRM so each tab explains its job before the form/list content.
- Added full Russian copy for the new tab descriptions.

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed; existing `MODULE_TYPELESS_PACKAGE_JSON` warning remains unrelated.
- `npm run test:clinic-flow`: passed.
