# Clinic Visit Multiple Procedure Actions

## Context

Iryna's workflow needs two actions on the patient-card visit form:

- **Add procedure** when the current visit contains multiple procedures.
- **Save visit** when the visit has only one procedure, or when the final procedure is entered.

## What Changed

- Added a secondary `Add procedure` / `Добавить процедуру` button next to `Save visit`.
- `Add procedure` saves the current procedure entry through the existing visit API, then clears procedure fields so the practitioner can enter the next procedure.
- `Save visit` keeps the previous behavior and saves the current entry as the completed visit.
- Added EN/RU confirmation copy after adding a procedure.

## Verification

- `npx eslint "app/clinic/patients/[id]/PatientRecordClient.tsx" "lib/clinic/strings.ts"`
- `npm run type-check`
