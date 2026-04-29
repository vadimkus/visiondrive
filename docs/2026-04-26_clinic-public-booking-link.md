# Clinic Public Booking Link

Date: 2026-04-26

Context: Implemented point 4 from the Altegio-inspired solo-practitioner backlog: a private public-booking link.

## Shipped

- Public page: `/book/[tenant-slug]`
- Public API: `GET/POST /api/clinic/public-booking/[slug]`
- Staff toggle: `GET/PATCH /api/clinic/public-booking/settings`
- Client flow:
  - choose service
  - pick available time
  - enter name, DOB, phone/email, optional notes
  - accept consent
  - request booking
- Booking creation:
  - validates real availability using working hours, blocked time, buffers, and minimum lead time
  - creates or reuses a patient
  - creates an `ONLINE` appointment
  - stores public booking consent/notes in event/internal notes
  - schedules a 24h WhatsApp reminder
- Staff panel:
  - dashboard exposes the booking link
  - dashboard turns public booking on/off
  - dashboard can switch between practitioner approval and instant confirmation
  - knowledge base article explains the flow

## Design Decision

Public booking is disabled by default. The public API returns `404` until staff explicitly turns the link on from the dashboard.

Public users cannot override conflicts. If a slot disappears before submission, the API returns `409` and the page refreshes availability.

By default, online bookings remain approval requests. If the practitioner switches public booking to instant mode, the created online appointment is immediately marked `CONFIRMED` and the public success page says the booking is confirmed.

DOB is required because `ClinicPatient.dateOfBirth` is mandatory in the current clinical data model. The public form asks for it explicitly rather than creating unsafe placeholder patient records.

## Next Best Follow-Up

- Add a custom public slug or unguessable booking token.
- Add service-specific intake questions.
- Add client reschedule/cancel links.
