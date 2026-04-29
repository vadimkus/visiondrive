# Clinic Phone Workflow Without IP Telephony

## Context

The next Altegio adaptation item was deep IP telephony integration. For a solo home-visit practitioner, this is too much operational and technical weight. The useful workflow is simpler: call from the device, then save the call outcome and next action on the patient card.

## Shipped

- Added a Phone workflow panel to `/clinic/account`.
- Added EN/RU Knowledge Base guidance.
- Updated backlog, architecture, data model, chunks, and docs index.

## Behavior

Calls remain device-native:

- use the patient `tel:` link or normal mobile dialer,
- speak on the practitioner's own phone,
- save a structured `CALL` activity in the patient CRM,
- use reminders, WhatsApp, or future appointments for follow-up.

## Deferred

- IP telephony provider setup.
- Call recording.
- Device call-log import.
- Webhook delivery status.
- Synced inbound/outbound call tables.

Add these only if call volume becomes high enough to justify telephony complexity.
