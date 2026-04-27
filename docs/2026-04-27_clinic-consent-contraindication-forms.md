# Clinic Consent And Contraindication Forms

Date: 2026-04-27

## Context

Point 12 from the Altegio home-visit adaptation backlog was implemented for solo practitioners who deliver aesthetic or medical-adjacent treatments at home. The goal is to protect both patient and practitioner before treatment by recording what was explained, what contraindications were reviewed, and when the patient accepted.

## Shipped

- Added reusable `ClinicConsentTemplate` records with optional procedure restriction, consent text, contraindication checklist, and aftercare wording.
- Added `ClinicConsentRecord` signed snapshots linked to patient, optional visit, optional appointment, optional procedure, and optional template.
- Signed records store immutable snapshots of the template title/body and contraindications, so future template edits do not alter historical consent.
- Added helper logic in `lib/clinic/consents.ts` for text normalization, contraindication normalization, accepted timestamps, and snapshot construction.
- Added APIs:
  - `GET/POST /api/clinic/consents/templates`
  - `GET/POST /api/clinic/patients/[id]/consents`
- Added a patient record `Consents` tab to create templates, review contraindications, sign a consent, link it to a visit, and view signed records.
- Added EN/RU strings and Knowledge Base article.

## Safety Notes

- Consent records are tenant-scoped and patient-scoped.
- Signed records are patient-safe snapshots by design: they contain the accepted text, signature name, accepted timestamp, reviewed checklist, and optional note.
- This is a first pass. Strong next steps are public pre-visit signing, drawn signature capture, consent expiry rules, and consent PDF export.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`

Run `npm run db:push` against the target database before production use because this feature adds tables.
