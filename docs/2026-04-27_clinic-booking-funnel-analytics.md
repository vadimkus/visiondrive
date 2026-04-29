# Clinic Booking Funnel Analytics

Date: 2026-04-27

## Context

Point 21 from the Altegio home-visit practitioner backlog is **Booking funnel analytics**. The goal is to show a solo practitioner where demand leaks inside the public booking link before a client becomes an online appointment.

## What Shipped

- Added `ClinicBookingFunnelEvent` plus `ClinicBookingFunnelEventType` for anonymous, tenant-scoped public booking events.
- Public booking now records these steps: link view, service selected, slot selected, form started, form submitted, booking completed.
- Added `POST /api/clinic/public-booking/[slug]/funnel` for enabled public booking links.
- Added `GET /api/clinic/booking-funnel/overview` for staff analytics.
- Added `/clinic/booking-funnel` with KPI cards, stage conversion/drop-off, procedure conversion, and recent daily view/booking counts.
- Added EN/RU strings and a Knowledge Base article.
- Updated clinic architecture/data-model docs and the Altegio backlog/canvas.

## Follow-up: Google / Instagram Links

On 2026-04-29, the dashboard gained copy-ready Google, Instagram, WhatsApp, and service-specific booking links. These links use the same source/UTM metadata that the funnel already stores, and service links pass `procedureId` so the public page preselects the treatment before showing slots.

## Metric Notes

- Stage counts are based on unique anonymous sessions, while the table also shows raw event count.
- Completion rate = unique booking-completed sessions divided by unique link-view sessions.
- Procedure conversion compares sessions that selected a procedure against sessions that completed a booking for that procedure.
- No patient PII is stored in funnel events.

## Validation

- Added `lib/clinic/booking-funnel.test.ts`.
- Required validation: `npm run db:generate`, `npm run db:push`, `npm run type-check`, `npm run test`, `npm run lint`, `npm run build`.
