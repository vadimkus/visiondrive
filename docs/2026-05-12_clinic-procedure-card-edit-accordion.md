# Clinic Procedure Card Edit Accordion

Date: 2026-05-12

Context: Existing Practice OS procedure catalog allowed creating procedures, but the list view did not expose an editable procedure card for the core service fields. The page also rendered every procedure fully expanded, making the catalog hard to scan.

Changes:
- Converted the procedure catalog into a top-level chevron list: each procedure row shows name, status, duration, buffer, base price, and material cost summary.
- Added an expandable procedure card editor for name, service duration, post-appointment buffer, base price, currency, and active status.
- Extended `PATCH /api/clinic/procedures/[id]` to update core procedure fields in addition to booking policy fields.
- Added EN/RU strings for the procedure card editor labels and validation.

Verification:
- `npx eslint "app/clinic/procedures/page.tsx" "app/api/clinic/procedures/[id]/route.ts" "lib/clinic/strings.ts"`
- `npm run type-check`
