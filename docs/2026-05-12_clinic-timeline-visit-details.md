# Clinic Timeline Visit Details

Date: 2026-05-12

## Context

Vadim reported that history timeline rows like `Visit · COMPLETED` in the Russian patient card could not be opened, so Iryna could not see what was done during a saved visit.

## Change

- Timeline visit rows now carry their source visit id.
- Visit rows in the patient history tab are clickable/tappable.
- Clicking a visit row expands inline details: chief complaint, procedure summary, next steps, staff notes, aftercare, and linked photo count where available.
- Timeline labels now localize known visit/payment/appointment status labels by locale.
- Russian visit labels now show `Визит · Завершён` instead of `Visit · COMPLETED`.

## Validation

- `npx eslint "app/clinic/patients/[id]/PatientRecordClient.tsx" lib/clinic/timeline.ts --max-warnings=0`
- `npm run type-check`
- `npx vitest run lib/clinic/timeline.test.ts`
- IDE lints for touched files: clean.
