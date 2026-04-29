# Clinic home-doctor field workflows

Date: 2026-04-29

## Context

Practice OS is moving toward a mobile operating system for solo home doctors. This pass shipped four high-priority field workflows: route mode, patient pre-visit tasks, injectable batch/expiry tracking, and before/after comparison v2.

## Shipped

- Route Mode on the Appointments day view now opens a full multi-stop Google Maps route and prepares an "On my way" WhatsApp handoff per appointment. The handoff is logged to CRM and appointment history.
- Patient portal appointments now include pre-visit tasks for address, access, medical changes, and treatment readiness. Patient saves create portal request, CRM, and appointment history records.
- Inventory now supports injectable batch/lot number and expiry date fields without changing stock quantity math. Expiry badges show tracked, expiring soon, or expired status.
- Patient Photos now includes Before / after review v2, automatically pairing Before and After images for side-by-side follow-up review.
- Knowledge Base now includes EN/RU articles for all four workflows.

## Validation

- `npm test -- lib/clinic/route-mode.test.ts`
- `npm test -- lib/clinic/previsit-tasks.test.ts`
- `npm test -- lib/clinic/inventory-batches.test.ts`
- `npm test -- lib/clinic/before-after.test.ts`
- `npm run type-check` after each chunk
