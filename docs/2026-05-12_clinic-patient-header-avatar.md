# Clinic Patient Header Avatar

Date: 2026-05-12

## Context

The patient card header used initials inside the avatar block. For the current patient profile this looked too plain and less human than the rest of the redesigned patient header.

## Change

- Replaced the initials block in the patient header with a local inline SVG lady avatar.
- Kept the same footprint and soft rounded styling, so the header layout remains stable.
- No external image asset or network dependency was introduced.

## Verification

- `ReadLints` on `app/clinic/patients/[id]/PatientRecordClient.tsx`: no diagnostics.
- `npx eslint app/clinic/patients/[id]/PatientRecordClient.tsx`: passed.
- `npm run type-check`: passed.
