# Clinic birthday and occasion messages

Date: 2026-04-28

## Context

The next solo-practitioner backlog item was birthday and personal occasion messages. The product should help a practitioner keep personal touch without becoming a heavy loyalty or campaign engine.

## Shipped

- Added `lib/clinic/occasions.ts` for upcoming birthday detection, 7/30/90-day range normalization, leap-day handling, EN/RU birthday message generation, and WhatsApp deep links.
- Added `GET /api/clinic/occasions/overview`, tenant-scoped via `getClinicSession`, returning upcoming birthdays, WhatsApp availability counts, message previews, and patient chart links.
- Added `/clinic/occasions` to the post-login panel with range filters, birthday cards, copy-message action, WhatsApp open action, missing-phone state, and patient chart links.
- Added EN/RU strings and a Knowledge Base article.

## Behavior

- No database schema change was needed; birthdays derive from existing `ClinicPatient.dateOfBirth`.
- The first version intentionally avoids coupons, points, and automation. It gives the practitioner a warm, personal message to send manually.
- Feb 29 birthdays are treated as Feb 28 in non-leap years for outreach.

## Validation

- Added Vitest coverage for range normalization, next-birthday calculation, leap-day handling, upcoming-row filtering, localized messages, and WhatsApp links.
- Ran `npx prisma format`, `npx prisma generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Existing warnings remained unrelated: legacy login `<img>` lint warning, middleware deprecation, and old `kitchen-owner` metadata warnings.
