# Clinic dormant patient reactivation

Date: 2026-04-28

## Context

Retention analytics already identified patients who had completed visits but no future booking. Point 30 turns that signal into a practical home-visit practitioner workflow: filter dormant clients, preview a soft return message, copy it, open WhatsApp, and check the patient chart before sending.

## Shipped

- Added `lib/clinic/reactivation.ts` for 60/90/120-day threshold normalization, EN/RU reactivation message generation, and WhatsApp deep links.
- Updated `GET /api/clinic/retention/overview` to accept `lostAfterDays=60|90|120` and `locale=en|ru`.
- Returned `reactivationMessage` and localized `whatsappUrl` for dormant patients.
- Updated `/clinic/retention` with 60/90/120 dormant filters, message previews, copy action, WhatsApp open action, and no-phone state.
- Added EN/RU strings and Knowledge Base guidance.
- Updated architecture, data model, implementation log, backlog map, and canvas.

## Behavior

A dormant patient is included when:

- they have at least one completed appointment;
- their last completed appointment is older than the selected threshold;
- they have no future active appointment (`SCHEDULED`, `CONFIRMED`, or `ARRIVED`).

The message is intentionally low-pressure. The current implementation does not persist outreach as CRM activity yet; that is a next improvement.

## Validation

- Added `lib/clinic/reactivation.test.ts`.
- Run after implementation: `npm run type-check`, `npm run test`, `npm run lint`, and `npm run build`.
- No Prisma schema change.
