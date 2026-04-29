# Clinic Google / Instagram Booking Links

Date: 2026-04-29

## Context

This chunk adds the practical first version of Google/Instagram booking integration: clean direct links that a solo practitioner can paste into Google Business Profile, Instagram bio, WhatsApp replies, or service-specific posts.

## Shipped

- Added reusable booking channel link helpers for Google, Instagram, and WhatsApp.
- Dashboard now shows copy-ready attributed booking links:
  - Google profile link,
  - Instagram bio link,
  - WhatsApp booking message,
  - first service-specific Instagram links.
- Public booking now honors `procedureId` in the URL, so service links preselect the treatment and load matching slots.
- Links include `source`, `utm_source`, `utm_medium`, and `utm_campaign` so the existing booking funnel report can attribute sessions/bookings.
- Added EN/RU dashboard copy and focused helper tests.

## Notes

- This does not use official Reserve with Google or Instagram action-button APIs yet. It is the useful, shippable first pass: trackable links and service preselection.
- The existing booking funnel remains the source of truth for conversion by source.

## Verification

- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/booking-channel-links.test.ts lib/clinic/booking-funnel.test.ts`
- `npm run test:clinic-flow`
