# Clinic booking source attribution and abandoned follow-up

Date: 2026-04-28

## Context

After dormant patient reactivation, the next practical growth gap was the public booking funnel: it could show drop-off, but not which shared link created useful leads or how to recover submitted bookings that failed before appointment creation.

## Shipped

- Public booking now preserves `source`, `utm_source`, `utm_medium`, `utm_campaign`, and `ref` from the booking URL in funnel event metadata.
- Submitted public booking forms store minimal contact metadata on the funnel event so failed or abandoned submissions can be followed up without creating a patient record.
- Booking funnel overview now returns conversion by source and abandoned booking sessions with localized EN/RU WhatsApp follow-up messages.
- `/clinic/booking-funnel` shows source conversion, abandoned booking cards, copy-message action, WhatsApp open action, missing-phone state, and locale-aware numbers.
- Post-login Practice OS shell now uses a VD mark, a simpler solo-practitioner slogan, and dashboard copy focused on solo-preneur operations.

## Behavior

- No Prisma schema change was needed; existing `ClinicBookingFunnelEvent.metadata` stores source and submitted-contact context.
- Sessions with `BOOKING_COMPLETED` are excluded from abandoned follow-up.
- Abandoned follow-up focuses on sessions that reached slot selection, form start, or form submission without completing.
- WhatsApp links are generated only when a usable phone number is present.

## Validation

- Added Vitest coverage for source conversion, abandoned-session detection, and localized follow-up message generation.
- Ran `npx prisma format`, `npx prisma generate`, `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- Existing warnings remained unrelated: legacy login `<img>` lint warning, middleware deprecation, and old `kitchen-owner` metadata warnings.
