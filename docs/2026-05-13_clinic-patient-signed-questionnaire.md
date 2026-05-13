# Clinic Patient Signed Questionnaire

## Context

Vadim requested a patient-card questionnaire: always collapsed under a chevron, 10 doctor questions, checkbox/text answers, client signature, save, and future read-only display as a signed sheet.

## What Changed

- Added a top-of-card `Лист-опросник от доктора` / `Doctor questionnaire` section in `PatientRecordClient`, directly under the back link and before the patient header card.
- The section is collapsed by default and expands via chevron.
- Before signing, it shows 10 starter doctor questions with mixed text inputs and checkboxes.
- A client signature field is required before saving.
- After saving, the section collapses and later reopens as a read-only signed questionnaire with answers, signature, and timestamp.
- Stored the signed snapshot inside `ClinicPatient.anamnesisJson.doctorQuestionnaire` to avoid a schema migration for the first pass.
- Extended anamnesis normalization so ordinary anamnesis edits preserve the signed questionnaire instead of overwriting it.

## Current Question Set

The questions were replaced from `Medical_Anamnesis_Consent_Form.pdf` and cover:

- Chronic diseases
- Allergies, including Lidocaine / local anesthetics
- Autoimmune diseases
- Oncological diseases
- Diabetes and blood pressure
- Fainting, blood clotting disorders, and herpes
- Pregnancy / lactation
- Medicines and supplements
- Previous aesthetic procedures
- Previous complications plus consent / aftercare / photo acknowledgement

These are still stored as a signed patient-card snapshot and can be replaced later with Iryna's final clinical wording.

## Verification

- `npx eslint "app/clinic/patients/[id]/PatientRecordClient.tsx" "lib/clinic/anamnesis.ts"`
- `npm run type-check`
