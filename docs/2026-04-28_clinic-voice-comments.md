# Clinic Voice Comments

Date: 2026-04-28

## Context

Added voice-to-text comments on the patient card for the solo-practitioner workflow: finish treatment, speak the note, review the transcript, and save it as a patient CRM note.

## Shipped

- Added a dictation control to the patient card CRM tab.
- Uses the browser Web Speech API, so transcription happens through supported browser speech input rather than a new backend service.
- Dictation language follows the clinic locale: English uses `en-US`, Russian uses `ru-RU`.
- Final transcript is appended into the CRM note textarea; the practitioner can edit before saving.
- Saved notes continue to use existing `ClinicCrmActivity` rows, so they appear in CRM history and patient timeline without schema changes.
- Added EN/RU strings and Knowledge Base guidance.

## Guardrails

- Dictation is optional and disabled when the browser does not expose speech recognition.
- The system does not auto-save voice output; the practitioner must review and press Save.
- Microphone permission remains browser-controlled.

## Validation

- `npm run type-check`

No database push is needed for this voice-comment feature because it reuses existing CRM note storage.
