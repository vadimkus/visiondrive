## 2026-04-26 — Clinic RU Localization Follow-up

Context: after shipping public booking, the RU language switch still left some visible English strings in the clinic/public booking flow.

Changes made:
- Wired `/book/[slug]` to the saved clinic locale (`visiondrive-clinic-locale`) so the public booking page follows the RU switch.
- Added Russian copy for the public booking hero, service/time/details steps, form labels, consent text, submit states, confirmation screen, date formatting, and known API validation errors.
- Replaced remaining hardcoded `DOB` and `Phone` headers on the patient list with localized string keys.
- Added missing Russian fallbacks in `lib/clinic/strings.ts` for common patient, account, timeline, visit, photo, payment, CRM, dashboard, and error strings that were previously inheriting English.

Validation:
- `npm run type-check`
- `npm test -- --run lib/clinic/public-booking.test.ts lib/clinic/public-booking-settings.test.ts`
- `npm run build`
- `npm run lint`

Notes:
- Lint passes with one pre-existing warning for the legacy `<img>` on `/login`.
