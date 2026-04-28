# Clinic WhatsApp bot intake first pass

## Context

A full WhatsApp bot is heavy for a solo practitioner. The immediate value is a manual assistant that prepares accurate replies quickly while the practitioner stays in control of sending.

## Shipped

- Added `/clinic/whatsapp-assistant`.
- Added sidebar navigation entry.
- The assistant generates WhatsApp-ready text for:
  - booking link sharing;
  - price replies from procedure catalog prices;
  - intake prompts before booking confirmation;
  - appointment status for a selected patient;
  - reminder / follow-up replies.
- It fetches patient details, upcoming appointments, procedure prices, and public booking link state.
- It supports copy-to-clipboard and `wa.me` opening.
- Added EN/RU strings and Knowledge Base guidance.

## Limits

- No inbound WhatsApp messages are received by the app yet.
- No automatic WhatsApp sending; the practitioner reviews and sends manually.
- Sent messages are not persisted to patient history yet. That is the next logical step for Message history.
