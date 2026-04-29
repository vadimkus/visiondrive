# Clinic RU Localization And Demo Data

## Intent

Make the Practice OS clinic experience testable in Russian end-to-end, especially after the adaptive UI and smart waitlist work.

## What Changed

- Balanced `lib/clinic/strings.ts` so every English clinic string key has a Russian override.
- Moved the new adaptive dashboard/sidebar labels into localized strings.
- Localized smart-waitlist form placeholders and WhatsApp fill-message generation.
- Added RU-first seed data for two demo patients:
  - Анна Петрова, Dubai Marina, upcoming consultation.
  - Мария Иванова, Business Bay, upcoming biorevitalization plus an open waitlist entry.

## Seed Behavior

`prisma/seed.ts` deletes and recreates only the two demo clinic patients by their demo emails, then recreates related appointments, CRM notes, procedures, and waitlist data. Real patient rows are untouched.

## Verification

- String-table audit: `0` missing Russian overrides.
- `npm run type-check`: passed.
- `npm run lint`: passed with the existing unrelated `app/login/page.tsx` `<img>` warning.
- `npm run db:seed`: passed and confirmed `Ensured Practice OS RU demo patients and waitlist data`. The existing Timescale hypertable warning remains non-blocking.
