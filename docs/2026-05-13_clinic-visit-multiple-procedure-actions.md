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
- Added an inline `Procedure map and photos` / `Разметка процедуры и фото` block inside the visit form.
- The practitioner can draw the face/procedure map and stage `Before` / `After` photos without leaving the visit form.
- When `Add procedure` or `Save visit` creates the visit, staged map/photo media uploads with that new `visitId`, keeping the material attached to the same visit.
- Added a catalogue procedure selector above `Procedure / summary`.
- Selecting a catalogue procedure fills the summary when empty and passes `procedureId` to the visit API.
- The visit API now applies procedure-linked inventory consumption from the selected procedure BOM even when the visit was entered manually without a calendar appointment.

## Verification

- `npx eslint "app/clinic/patients/[id]/PatientRecordClient.tsx" "lib/clinic/strings.ts"`
- `npx eslint "app/clinic/patients/[id]/PatientRecordClient.tsx" "app/api/clinic/visits/route.ts" "lib/clinic/inventory-visit-consume.ts" "lib/clinic/strings.ts"`
- `npm run type-check`
