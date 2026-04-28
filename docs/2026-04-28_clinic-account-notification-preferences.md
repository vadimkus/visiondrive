# Clinic Account And Notification Preferences

Date: 2026-04-28

## Context

Backlog item 39 from the Altegio home-visit adaptation map: practitioner profile, language, notification preferences, password reset/change, and push settings.

## Shipped

- Added `ClinicUserPreference` to store tenant-scoped practitioner preferences.
- Expanded `/api/clinic/me` so the account page can read and save:
  - display name,
  - preferred EN/RU language,
  - password changes,
  - email/push channel preferences,
  - alert-type preferences for bookings, reschedules, reminders, reviews, unpaid visits, low stock, and package expiry.
- Updated `/clinic/account` with concise controls for profile, language, notification preferences, device push subscription, and password changes.
- Clinic shell now applies the saved language on sign-in.
- Low-stock email and browser push delivery respects saved preferences. Tenants with no preference rows keep the legacy env-recipient fallback.

## Validation

- `npx prisma generate`
- `npm run type-check`
- `npx vitest run lib/clinic/account-preferences.test.ts`
- `npm run lint`

## Operational Note

Run `npx prisma db push` against the target database before production use because this adds `clinic_user_preferences`.

## Next Improvements

- Password-reset email flow.
- Quiet hours and daily digest frequency.
- SMS/WhatsApp Business notification channel preferences.
