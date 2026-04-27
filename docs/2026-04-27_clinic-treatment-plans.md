# Clinic Treatment Plans

Date: 2026-04-27

## Context

Point 14 from the Altegio-inspired home-visit backlog adds planned courses of care for solo practitioners. The goal is to turn repeat treatment into a structured plan with target sessions, cadence, outcomes, photo checkpoints, and linked visits.

## Shipped

- Added `ClinicTreatmentPlan` with tenant/patient/procedure scope, expected sessions, cadence, target dates, goals, next steps, outcome notes, photo milestones, and status.
- Added optional `treatmentPlanId` on `ClinicVisit`, so completed visits can contribute to a plan.
- Added treatment-plan APIs under `GET/POST /api/clinic/patients/[id]/treatment-plans` and `PATCH .../[planId]`.
- Updated visit create/update APIs to validate and store `treatmentPlanId`.
- Added a Treatment plans tab to the patient record with create form, plan cards, status actions, progress, linked visits, and EN/RU strings.
- Added a Knowledge Base article in English and Russian.

## Notes

- Plan progress is derived from completed linked visits, not manually edited. This keeps the plan aligned with the clinical timeline.
- Photo milestones are stored as structured JSON checkpoints; actual before/after media remains on visits and can be linked through the plan's visits.
- Next improvements: milestone-specific media comparison, outcome scoring, generated appointment schedule, and WhatsApp progress summary.

## Validation

- `npm run db:generate`
- `npm run type-check`
- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run db:push`
