# Clinic WhatsApp AI Receptionist V2

## Context

Home doctors receive many WhatsApp questions before and after treatment: price, availability, reschedule, cancellation, quote follow-up, and "can you fit me in earlier?" Full WhatsApp Business API automation is still too heavy for this solo-practitioner phase, but the practitioner needs better structured replies than helper links.

## Decision

Keep the assistant manual-send and practitioner-controlled. V2 expands the assistant into a receptionist console that prepares accurate replies and saves them to the patient CRM history. It does not auto-send WhatsApp messages, auto-reschedule appointments, or auto-cancel bookings.

## What Shipped

- Added shared receptionist message builder in `lib/clinic/whatsapp-receptionist.ts`.
- Added reply modes for:
  - price questions;
  - quote sending;
  - reschedule requests;
  - cancellation requests;
  - waitlist slot offers;
  - practitioner approval briefs;
  - existing booking, intake, status, and reminder replies.
- Added appointment selector for status/reschedule/cancel/approval messages.
- Added quote selector using existing patient quotes, with selected services as fallback.
- Added waitlist slot datetime input for "slot opened" messages.
- Added context box for patient question/preferred time/approval notes.
- Added EN/RU message generation and unit tests.
- Updated the Knowledge Base article for v2 workflows.

## Guardrails

- The app still opens `wa.me` only after practitioner review.
- Saving history writes a `WHATSAPP` CRM activity; it does not mutate appointments.
- Reschedule/cancel messages explicitly say the practitioner will personally confirm before schedule changes.
- Quote messages use existing quote data when selected, otherwise they are clearly preliminary.

## Validation

- `npm test -- --run lib/clinic/whatsapp-receptionist.test.ts`
- `npm run type-check`
- `npm run lint`
