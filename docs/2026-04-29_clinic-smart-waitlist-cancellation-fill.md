# Clinic Smart Waitlist + Cancellation Fill

## Context

Built after the competitive feature scan identified waitlist / cancellation fill as the highest-value missing feature for solo practitioners.

## What Shipped

- New `ClinicWaitlistEntry` model for tenant-scoped waitlist rows.
- `/clinic/waitlist` page for adding patients to the waitlist and ranking candidates when a slot opens.
- `GET/POST /api/clinic/waitlist` and `PATCH /api/clinic/waitlist/[id]`.
- WhatsApp-ready cancellation-fill copy with manual handoff and CRM logging when a patient is contacted.
- EN/RU strings, clinic navigation, dashboard quick action, and helper tests.

## Workflow

1. Add a patient, optional service, urgency, date window, preferred days/time, and note.
2. When a cancellation opens a slot, enter the slot start and optional service.
3. Practice OS scores candidates by service match, urgency, acceptable date window, and time waiting.
4. Open WhatsApp for the best match; the row is marked contacted and a CRM activity is stored.
5. Mark the row booked or closed after the patient replies.

## Boundaries

- No automatic WhatsApp sending; the practitioner stays in control.
- No public patient-facing waitlist form yet.
- No automatic appointment creation from a waitlist row yet; the practitioner still creates/confirms the booking through the normal appointment flow.
