# Clinic AI Note Dictation

Date: 2026-05-12

## Context

The patient visit form had copy that mentioned pasting rough notes or dictation into the AI note assistant, but the visible AI assistant card did not expose a microphone button. Voice dictation existed separately in the CRM interaction form, so the visit note workflow was confusing.

## Changes

- Added a dictation button directly inside the AI note assistant card on the patient visit form.
- Dictated text is appended into the AI note input field, then the practitioner can press Draft note / Составить заметку.
- Reused the existing EN/RU voice strings and browser SpeechRecognition integration.
- Updated `Permissions-Policy` from `microphone=()` to `microphone=(self)` so browser microphone access can work for Practice OS dictation.

## Verification

- `ReadLints` on `PatientRecordClient.tsx` and `next.config.ts`: no diagnostics.
- `npx eslint app/clinic/patients/[id]/PatientRecordClient.tsx next.config.ts`: passed.
- `npm run type-check`: passed.
