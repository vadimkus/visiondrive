# Clinic Russian Localization Sweep

Date: 2026-04-30

## Scope

Checked Practice OS Russian localization across:

- `/clinic` workspace surfaces
- Admin Tools
- Marketing automation
- login
- public booking
- patient portal
- PWA practitioner card and manifest shortcuts

## Fixes

- Marketing automation now uses localized Russian loading and error text instead of English fallbacks.
- Public booking no longer leaks unknown raw English API error strings to Russian users; unknown errors fall back to localized generic messages.
- Patient portal reschedule placeholder is localized (`Завтра после 15:00`).
- Patient portal request/pre-visit mutation errors fall back to Russian generic messages in RU mode.
- Login email placeholder is no longer company-specific English, and the small product label is localized for Russian.
- Login no longer shows raw English backend login errors to Russian users.
- Admin Tools now localizes operation failures, success notices, fallback practice name, and password/name placeholders.
- PWA appointment fallback label now uses `t.appointmentDefault`, so Russian shows `Запись`.
- `site.webmanifest` shortcuts now use Russian names/descriptions for Today, New appointment, and Patients.

## Validation

- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm test` — 68 test files, 230 tests passed

## Notes

- `Email`, `WhatsApp`, product names, and code placeholders like `GC-...` remain intentionally unchanged.
- The static web manifest cannot switch language dynamically per user locale, so shortcut labels were changed to Russian-first because the current ask was RU completeness.
- Legacy `/portal` IoT/parking surfaces are still outside the current Practice OS localization scope.
