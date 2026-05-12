# Clinic Knowledge Base Refresh and Gap Audit

Date: 2026-05-12

## Context

The in-app `/clinic/knowledge-base` needed to reflect the latest Practice OS behavior after the patient, inventory, procedure, appointment, and admin workflow updates.

## Updated Knowledge Base Coverage

- Updated inventory guidance for unit of measure selection (`pcs`, `шт`, `ml`, `мл`, `g`, `г`, and custom units).
- Clarified that the stock reorder/alert threshold is interpreted in the selected unit, for example `шт` for pieces, `ml` for liquids, and `г` for powders.
- Documented selected stock-item deletion via checkboxes as a soft hide/deactivation that preserves movement history.
- Updated patient deletion guidance to match the current warning-confirmed deletion flow instead of the older exact-phrase prompt.
- Clarified that date of birth is optional in public booking and patient imports.
- Updated product import guidance to include unit/measure/volume columns.
- Added missing EN/RU KB articles for:
  - private ICS calendar feed,
  - procedure booking rules,
  - smart waitlist and cancellation fill,
  - admin user/access management.

## Audit Notes

Coverage was reviewed against recent implementation chunks and active clinic routes. The largest user-facing gaps were not core feature absence, but KB discoverability gaps where capability bullets existed without a practical article. Those gaps were filled in the in-app Knowledge Base.

## Validation Plan

- Run `npm run type-check`.
- Check linter diagnostics for `/app/clinic/knowledge-base/page.tsx`.
