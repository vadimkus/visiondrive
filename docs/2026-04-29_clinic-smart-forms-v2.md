# Clinic Smart Forms V2

Date: 2026-04-29

## Context

This chunk upgrades existing service-specific public intake fields into a smarter form layer for solo practitioners.

## Shipped

- Added conditional intake questions:
  - staff can make a question appear only when a previous yes/no question has a matching answer,
  - public booking hides conditional questions until the condition is met,
  - required validation only applies to currently visible questions.
- Added internal-only intake questions:
  - staff can keep preparation/checklist fields on the service configuration,
  - internal-only fields are never exposed on the public booking page.
- Added patient-card smart form summary:
  - latest intake responses are grouped by appointment/service,
  - practitioners can review recent form answers from the patient overview.
- Added EN/RU labels and focused unit coverage for conditional visibility.

## Data Model

`ClinicIntakeQuestion` now includes:

- `internalOnly`
- `showWhenQuestionId`
- `showWhenAnswer`

No new standalone smart-form table was introduced in this pass. The existing service-question and response snapshot models remain the source of truth.

## Verification

- `npm run db:generate`
- `npm run db:push`
- `npm run type-check`
- `npm run lint`
- `npm test -- --run lib/clinic/intake-fields.test.ts`
- `npm run test:clinic-flow`
