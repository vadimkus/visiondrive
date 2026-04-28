# Clinic Call Log

Date: 2026-04-28

## Context

Point 46 in the Altegio adaptation backlog asks for call history. The solo-practitioner first pass should capture what happened on a call and what should happen next, without building telephony integration prematurely.

## Shipped

- Patient CRM now includes a structured Call log card.
- The form captures call direction, outcome, summary, and next action.
- If the patient has a phone number, the card shows a `tel:` Call patient action for phone-capable devices.
- Calls save through the existing `POST /api/clinic/patients/[id]/crm` route as `ClinicCrmActivity` rows with type `CALL`.
- Recent calls are shown in a dedicated section above Message history and the full CRM activity log.

## Limits

- No device call-log import yet.
- No recording/transcription of phone calls.
- No missed-call automation or task creation yet.
- No external telephony provider integration.
