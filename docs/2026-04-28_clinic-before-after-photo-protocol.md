# Clinic Before/After Photo Protocol

Date: 2026-04-28

## Context

Implemented the next Altegio adaptation backlog item for solo home-visit practitioners: before/after photo protocol. The goal is to make patient photos clinically and commercially useful without adding a heavy studio workflow.

## Shipped

- Added capture-protocol metadata to `ClinicPatientMedia`: checklist JSON, marketing-consent flag, and consent timestamp.
- Added `lib/clinic/photo-protocol.ts` helper coverage for checklist normalization, consent parsing, protocol JSON construction, and completion counts.
- Extended `POST /api/clinic/patients/[id]/media` to accept protocol checklist, linked procedure snapshot, consent note, and marketing-consent marker.
- Updated Patient Photos tab with a capture checklist for same lighting, angle, distance, clean background, and treatment-area/session clarity.
- Linked visit selection now drives a procedure-aware capture hint when the visit has a procedure.
- Photo cards show protocol completion and marketing-consent badges.
- Added EN/RU strings and Knowledge Base guidance.

## Guardrails

- Photos remain private tenant-scoped media served through authenticated routes.
- Marketing consent is an explicit marker per image; it is not inferred from general consent forms.
- Existing photos remain compatible because protocol metadata is optional.

## Validation

- `npx prisma format`
- `npx prisma generate`
- `npm run type-check`
- `npx vitest run lib/clinic/photo-protocol.test.ts`

Run `npx prisma db push` before using this on the target database because the schema changed.
