# Clinic Face Map Annotations

## Intent

Add an aesthetic face-map workflow to the patient card so a practitioner can mark injection points or planned modifications, save the annotated image, and quickly review or continue it at the next visit.

## Shipped

- Added a face-map panel inside the patient **Photos** tab.
- Doctors can start from a built-in lady-face template or any existing patient photo.
- The editor supports direct pen marking, color selection, line width, undo, and clearing marks.
- Saving creates a rendered PNG in the existing private patient media store.
- Editable vector strokes are stored inside the media `protocolJson.faceMap` metadata, so the latest map can be reopened for cleanup or continued marking.
- Previous saved maps remain in the photo history as versions unless deleted manually.
- Added EN/RU copy for the workflow.

## Data Model

No schema change. Face maps reuse `ClinicPatientMedia`:

- `kind`: `OTHER`
- `mimeType`: `image/png`
- `caption`: localized face-map timestamp
- `protocolJson.faceMap`: editable annotation source and strokes

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed; existing `MODULE_TYPELESS_PACKAGE_JSON` warning remains unrelated.
- `npm run test -- face-map`: passed.
- `npm run test:clinic-flow`: passed.
- Browser sanity check: opened a patient Photos tab, created a template face map, saved it to the patient card, and reopened the latest map for modification.
- Follow-up validation fixed single-tap injection dots so one-point marks render in the editor and saved PNG, then re-ran the full suite: `npm run type-check`, `npm run lint`, `npm run test`, and `npm run test:clinic-flow` all passed.
